import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BankRow {
  'datum zauctovania': string;
  'suma': string;
  'mena': string;
  'referencia platitela': string;
  'typ transakcie': string;
  'cislo uctu protistrany': string;
  'banka protistrany': string;
  'nazov protistrany': string;
  'informacia pre prijemcu': string;
  'doplnujuce udaje': string;
}

function parseCSV(text: string): BankRow[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const rows: BankRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index].trim();
    });
    rows.push(row as unknown as BankRow);
  }

  return rows;
}

function parseDate(dateStr: string): string {
  // Format: "25.11.2025" -> "2025-11-25"
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function generateHash(date: string, amount: string, account: string, reference: string): string {
  const data = `${date}${amount}${account}${reference}`;
  return crypto.createHash('md5').update(data).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be CSV format' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows found in CSV' },
        { status: 400 }
      );
    }

    let imported = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const transactionDate = parseDate(row['datum zauctovania']);
        const amount = parseFloat(row['suma'].replace(',', '.'));
        const hash = generateHash(
          transactionDate,
          amount.toString(),
          row['cislo uctu protistrany'],
          row['referencia platitela']
        );

        // Check for duplicate
        const { data: existing } = await supabaseAdmin
          .from('bank_payments')
          .select('id')
          .eq('transaction_hash', hash)
          .single();

        if (existing) {
          duplicates++;
          continue;
        }

        // Insert payment
        const { error: insertError } = await supabaseAdmin
          .from('bank_payments')
          .insert({
            transaction_date: transactionDate,
            amount: amount,
            currency: row['mena'],
            payer_reference: row['referencia platitela'],
            transaction_type: row['typ transakcie'],
            counterparty_account: row['cislo uctu protistrany'],
            counterparty_bank: row['banka protistrany'],
            counterparty_name: row['nazov protistrany'],
            message_for_recipient: row['informacia pre prijemcu'],
            additional_info: row['doplnujuce udaje'],
            transaction_hash: hash,
            matched: false,
          });

        if (insertError) {
          if (insertError.code === '23505') {
            // Unique constraint violation (duplicate)
            duplicates++;
          } else {
            errors.push(`Row ${imported + duplicates + 1}: ${insertError.message}`);
          }
        } else {
          imported++;
        }
      } catch (err) {
        errors.push(
          `Row ${imported + duplicates + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      imported,
      duplicates,
      errors,
    });
  } catch (error) {
    console.error('Error importing bank payments:', error);
    return NextResponse.json(
      {
        error: 'Failed to import bank payments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface BankPayment {
  transaction_id: string;
  transaction_date: string;
  amount: number;
  currency: string;
  payer_name: string | null;
  payer_account: string | null;
  payer_reference: string | null;
  payment_reference: string | null;
  payment_note: string | null;
  transaction_type: string;
  payment_type: string | null;
}

/**
 * Parse CAMT.053 XML bank statement
 * European standard format for bank account statements
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Validate token and check admin role
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Get XML content from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const xmlContent = await file.text();

    // Parse XML
    const parsedXml = await parseStringPromise(xmlContent, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true
    });

    // Navigate to transactions
    const statement = parsedXml.Document?.BkToCstmrStmt?.Stmt;
    if (!statement) {
      return NextResponse.json({ error: 'Invalid XML format - no statement found' }, { status: 400 });
    }

    const entries = Array.isArray(statement.Ntry) ? statement.Ntry : [statement.Ntry];
    const payments: BankPayment[] = [];

    // Process each transaction entry
    for (const entry of entries) {
      // Skip debit transactions (outgoing payments)
      if (entry.CdtDbtInd !== 'CRDT') continue;

      const txDetails = entry.NtryDtls?.TxDtls;
      if (!txDetails) continue;

      // Extract amount
      const amount = parseFloat(entry.Amt?._ || entry.Amt || '0');
      const currency = entry.Amt?.Ccy || 'EUR';

      // Extract date
      const transactionDate = entry.BookgDt?.Dt || entry.ValDt?.Dt;

      // Extract payer information
      const relatedParties = txDetails.RltdPties;
      const payerName = relatedParties?.Dbtr?.Nm || null;
      const payerAccount = relatedParties?.DbtrAcct?.Id?.IBAN || null;

      // Extract references (VS, SS, KS)
      const endToEndId = txDetails.Refs?.EndToEndId || '';
      let variableSymbol = null;

      // Parse references from EndToEndId (format: /VS123/SS456/KS789)
      const vsMatch = endToEndId.match(/\/VS(\d+)/);

      if (vsMatch) variableSymbol = vsMatch[1];

      // Extract payment note
      const paymentNote = txDetails.RmtInf?.Ustrd || null;

      // Create payment record
      const payment: BankPayment = {
        transaction_id: entry.NtryRef || `${transactionDate}-${amount}`,
        transaction_date: transactionDate,
        amount: amount,
        currency: currency,
        payer_name: payerName,
        payer_account: payerAccount,
        payer_reference: variableSymbol,
        payment_reference: endToEndId,
        payment_note: paymentNote,
        transaction_type: entry.CdtDbtInd,
        payment_type: null // Will be set during matching
      };

      payments.push(payment);
    }

    if (payments.length === 0) {
      return NextResponse.json({ 
        error: 'No valid credit transactions found in XML',
        imported: 0
      }, { status: 400 });
    }

    // Insert payments into database
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const payment of payments) {
      try {
        // Check if transaction already exists
        const { data: existing } = await supabaseAdmin
          .from('bank_payments')
          .select('id')
          .eq('transaction_id', payment.transaction_id)
          .single();

        if (existing) {
          skipped++;
          continue;
        }

        // Insert new payment
        const { error: insertError } = await supabaseAdmin
          .from('bank_payments')
          .insert({
            ...payment,
            matched: false,
            imported_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting payment:', insertError);
          errors++;
        } else {
          imported++;
        }
      } catch (err) {
        console.error('Error processing payment:', err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      total: payments.length,
      imported,
      skipped,
      errors,
      message: `Imported ${imported} payments, skipped ${skipped} duplicates, ${errors} errors`
    });

  } catch (error) {
    console.error('Error processing XML:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process XML file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

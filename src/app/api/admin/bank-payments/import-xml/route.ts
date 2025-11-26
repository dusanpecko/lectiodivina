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
  transaction_date: string;
  amount: number;
  currency: string;
  payer_reference: string | null;
  transaction_type: string;
  counterparty_account: string | null;
  counterparty_name: string | null;
  message_for_recipient: string | null;
  additional_info: string | null;
  transaction_hash: string;
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

    // Extract Message ID from header (unique identifier for this XML file)
    const groupHeader = parsedXml.Document?.BkToCstmrStmt?.GrpHdr;
    const messageId = groupHeader?.MsgId;
    
    if (!messageId) {
      return NextResponse.json({ 
        error: 'Invalid XML format - no Message ID found',
        details: 'XML file must contain GrpHdr.MsgId'
      }, { status: 400 });
    }

    // Check if this XML file was already imported
    const { data: existingImport } = await supabaseAdmin
      .from('bank_statement_imports')
      .select('id, imported_at, imported_count, file_name')
      .eq('message_id', messageId)
      .single();

    if (existingImport) {
      return NextResponse.json({
        error: 'Duplicate import',
        message: `Tento XML súbor bol už naimportovaný`,
        details: {
          already_imported: true,
          imported_at: existingImport.imported_at,
          imported_count: existingImport.imported_count,
          original_file: existingImport.file_name
        }
      }, { status: 409 }); // 409 Conflict
    }

    // Navigate to transactions
    const statement = parsedXml.Document?.BkToCstmrStmt?.Stmt;
    if (!statement) {
      return NextResponse.json({ error: 'Invalid XML format - no statement found' }, { status: 400 });
    }

    // Extract statement metadata
    const statementId = statement.Id;
    const accountIban = statement.Acct?.Id?.IBAN;
    const dateFrom = statement.FrToDt?.FrDtTm?.split('T')[0];
    const dateTo = statement.FrToDt?.ToDtTm?.split('T')[0];

    console.log('Statement structure:', JSON.stringify(statement, null, 2));
    console.log('Statement.Ntry type:', typeof statement.Ntry);
    console.log('Statement.Ntry isArray:', Array.isArray(statement.Ntry));
    console.log('Statement.Ntry exists:', !!statement.Ntry);

    // Handle entries - could be array, single object, or undefined
    let entries = [];
    if (statement.Ntry) {
      entries = Array.isArray(statement.Ntry) ? statement.Ntry : [statement.Ntry];
    }

    console.log('Total entries found:', entries.length);
    const payments: BankPayment[] = [];

    // Process each transaction entry
    for (const entry of entries) {
      console.log('Processing entry:', JSON.stringify(entry, null, 2));
      
      // Skip debit transactions (outgoing payments)
      if (entry.CdtDbtInd !== 'CRDT') {
        console.log('Skipping non-credit entry:', entry.CdtDbtInd);
        continue;
      }

      const txDetails = entry.NtryDtls?.TxDtls;
      console.log('TxDtls:', JSON.stringify(txDetails, null, 2));
      
      if (!txDetails) {
        console.log('No transaction details found');
        continue;
      }

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

      // Extract bank's unique reference number for this transaction
      const entryRef = entry.NtryRef || entry.AcctSvcrRef;
      
      // Generate transaction hash using bank's reference number if available
      // Fallback to generated hash if no bank reference exists
      const transactionHash = entryRef 
        ? `bank-${entryRef}` 
        : `${transactionDate}-${amount}-${payerAccount || ''}-${variableSymbol || ''}`;

      // Create payment record matching the database schema
      const payment: BankPayment = {
        transaction_date: transactionDate,
        amount: amount,
        currency: currency,
        payer_reference: variableSymbol,
        transaction_type: 'Prijatá platba',
        counterparty_account: payerAccount,
        counterparty_name: payerName,
        message_for_recipient: paymentNote,
        additional_info: endToEndId,
        transaction_hash: transactionHash
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
        // Check if transaction already exists by hash
        const { data: existing } = await supabaseAdmin
          .from('bank_payments')
          .select('id')
          .eq('transaction_hash', payment.transaction_hash)
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
            matched: false
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

    // Record this XML import to prevent future duplicates
    const { error: importRecordError } = await supabaseAdmin
      .from('bank_statement_imports')
      .insert({
        message_id: messageId,
        statement_id: statementId,
        account_iban: accountIban,
        statement_date_from: dateFrom || null,
        statement_date_to: dateTo || null,
        file_name: file.name,
        file_size: file.size,
        payments_count: payments.length,
        imported_count: imported,
        skipped_count: skipped,
        imported_by: user.id
      });

    if (importRecordError) {
      console.error('Error recording import:', importRecordError);
      // Don't fail the whole import for this
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

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const deletePayments = url.searchParams.get('deletePayments') === 'true';

    if (deletePayments) {
      // Get import record to get date range
      const { data: importRecord, error: fetchError } = await supabase
        .from('bank_statement_imports')
        .select('statement_date_from, statement_date_to')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching import:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch import record' },
          { status: 500 }
        );
      }

      // Delete payments within date range
      const { error: paymentsError } = await supabase
        .from('bank_payments')
        .delete()
        .gte('transaction_date', importRecord.statement_date_from)
        .lte('transaction_date', importRecord.statement_date_to);

      if (paymentsError) {
        console.error('Error deleting payments:', paymentsError);
        return NextResponse.json(
          { error: 'Failed to delete payments' },
          { status: 500 }
        );
      }
    }

    // Delete the import record
    const { error } = await supabase
      .from('bank_statement_imports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting import:', error);
      return NextResponse.json(
        { error: 'Failed to delete import record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/bank-statement-imports/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

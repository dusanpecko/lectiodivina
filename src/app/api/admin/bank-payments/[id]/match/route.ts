import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MatchRequest {
  userId: string;
  paymentType?: 'donation' | 'shop' | 'subscription';
  relatedId?: string;
}

// POST - Manual match payment to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;
    const body: MatchRequest = await request.json();
    const { userId, paymentType, relatedId } = body;

    if (!paymentId || !userId) {
      return NextResponse.json(
        { error: 'Missing paymentId or userId' },
        { status: 400 }
      );
    }

    // Get admin user (from session in real app)
    // For now, we'll use the service role
    const { data, error } = await supabaseAdmin.rpc('match_bank_payment_manual', {
      p_payment_id: paymentId,
      p_user_id: userId,
      p_admin_id: null, // TODO: Get from session
    });

    if (error) {
      console.error('Error matching payment manually:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment_type and related_id if provided
    if (paymentType || relatedId) {
      const updateData: { payment_type?: string; related_id?: string } = {};
      if (paymentType) updateData.payment_type = paymentType;
      if (relatedId) updateData.related_id = relatedId;

      const { error: updateError } = await supabaseAdmin
        .from('bank_payments')
        .update(updateData)
        .eq('id', paymentId);

      if (updateError) {
        console.error('Error updating payment type:', updateError);
        // Don't fail the whole request if this fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment matched successfully',
    });
  } catch (error) {
    console.error('Error in manual match endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to match payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Unmatch payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc('unmatch_bank_payment', {
      p_payment_id: paymentId,
    });

    if (error) {
      console.error('Error unmatching payment:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment unmatched successfully',
    });
  } catch (error) {
    console.error('Error in unmatch endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to unmatch payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

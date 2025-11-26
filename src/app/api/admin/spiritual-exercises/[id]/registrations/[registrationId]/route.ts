import { UpdateRegistrationInput } from '@/types/spiritual-exercises';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin API - uses service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// PATCH - Update registration (payment status, notes)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const params = await context.params;
    const registrationId = params.registrationId;
    const body: UpdateRegistrationInput = await request.json();

    const { data: registration, error } = await supabaseAdmin
      .from('spiritual_exercises_registrations')
      .update({
        payment_status: body.payment_status,
        payment_amount: body.payment_amount,
        payment_notes: body.payment_notes,
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating registration:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Error in PATCH registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel/delete registration
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const params = await context.params;
    const registrationId = params.registrationId;

    const { error } = await supabaseAdmin
      .from('spiritual_exercises_registrations')
      .delete()
      .eq('id', registrationId);

    if (error) {
      console.error('Error deleting registration:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Registration deleted' });
  } catch (error) {
    console.error('Error in DELETE registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

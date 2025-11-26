import { sendEmailFromTemplate } from '@/lib/email-sender';
import { CreateRegistrationInput, SpiritualExercise, SpiritualExercisePricing, SpiritualExerciseRegistration } from '@/types/spiritual-exercises';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role for INSERT operations (bypasses RLS for registration creation)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Anon client for auth checks
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.slug;
    const body: CreateRegistrationInput = await request.json();

    // Check if user is authenticated (optional)
    let userId: string | null = null;
    try {
      const authHeader = request.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseAnon.auth.getUser(token);
        if (user) {
          userId = user.id;
        }
      }
    } catch {
      // Not authenticated, continue as guest
    }

    // Validate required fields
    const requiredFields = [
      'email', 'first_name', 'last_name', 'phone',
      'birth_date', 'id_card_number',
      'city', 'street', 'postal_code',
      'room_type', 'gdpr_consent', 'responsibility_consent'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CreateRegistrationInput]) {
        return NextResponse.json(
          { error: `Povinné pole '${field}' chýba` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Neplatný formát e-mailu' },
        { status: 400 }
      );
    }

    // Validate GDPR consent
    if (!body.gdpr_consent || !body.responsibility_consent) {
      return NextResponse.json(
        { error: 'Musíte potvrdiť súhlas s ochranou osobných údajov a zodpovednosťou' },
        { status: 400 }
      );
    }

    // Get exercise by slug
    const { data: exercise, error: exerciseError } = await supabaseAnon
      .from('spiritual_exercises')
      .select('*, pricing:spiritual_exercises_pricing(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .eq('is_active', true)
      .single();

    if (exerciseError || !exercise) {
      return NextResponse.json(
        { error: 'Duchovné cvičenie sa nenašlo alebo nie je dostupné' },
        { status: 404 }
      );
    }

    // Validate room type exists in pricing
    const selectedRoomPrice = (exercise.pricing as SpiritualExercisePricing[])?.find(
      (p: SpiritualExercisePricing) => p.room_type === body.room_type
    );

    if (!selectedRoomPrice) {
      return NextResponse.json(
        { error: 'Vybraný typ izby nie je dostupný' },
        { status: 400 }
      );
    }

    // Check capacity (if set)
    if (exercise.max_capacity) {
      const { count } = await supabaseAnon
        .from('spiritual_exercises_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('exercise_id', exercise.id)
        .not('payment_status', 'eq', 'cancelled');

      if (count && count >= exercise.max_capacity) {
        return NextResponse.json(
          { error: 'Duchovné cvičenie je plne obsadené' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate registration (same email + exercise)
    const { data: existingReg } = await supabaseAnon
      .from('spiritual_exercises_registrations')
      .select('id, payment_status')
      .eq('exercise_id', exercise.id)
      .eq('email', body.email)
      .not('payment_status', 'eq', 'cancelled')
      .maybeSingle();

    if (existingReg) {
      return NextResponse.json(
        { error: 'Na toto cvičenie ste už zaregistrovaný/á' },
        { status: 400 }
      );
    }

    // Create registration
    const registrationData = {
      exercise_id: exercise.id,
      user_id: userId, // Link to authenticated user if available
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      birth_date: body.birth_date,
      id_card_number: body.id_card_number,
      city: body.city,
      street: body.street,
      postal_code: body.postal_code,
      parish: body.parish || null,
      diocese: body.diocese || null,
      room_type: body.room_type,
      dietary_restrictions: body.dietary_restrictions || null,
      notes: body.notes || null,
      referral_source: body.referral_source || null,
      gdpr_consent: body.gdpr_consent,
      responsibility_consent: body.responsibility_consent,
      newsletter_consent: body.newsletter_consent || false,
      payment_status: 'pending',
      payment_amount: selectedRoomPrice.price,
      registered_by: 'web',
    };

    const { data: registration, error: regError } = await supabaseAdmin
      .from('spiritual_exercises_registrations')
      .insert(registrationData)
      .select()
      .single();

    if (regError || !registration) {
      console.error('Registration error:', regError);
      return NextResponse.json(
        { error: 'Chyba pri vytváraní registrácie' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail({
        registration,
        exercise: exercise as SpiritualExercise,
        pricing: exercise.pricing as SpiritualExercisePricing[],
        selectedRoomPrice,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the registration if email fails
      // We can resend it manually from admin panel
    }

    return NextResponse.json(
      {
        message: 'Registrácia bola úspešná. Potvrdenie sme vám zaslali na e-mail.',
        registration: {
          id: registration.id,
          email: registration.email,
          exercise_title: exercise.title,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      { error: 'Interná chyba servera' },
      { status: 500 }
    );
  }
}

// Email sending function using database templates
async function sendConfirmationEmail(data: {
  registration: SpiritualExerciseRegistration;
  exercise: SpiritualExercise;
  pricing: SpiritualExercisePricing[];
  selectedRoomPrice: SpiritualExercisePricing;
}) {
  const { registration, exercise, pricing, selectedRoomPrice } = data;

  // Format dates
  const startDate = new Date(exercise.start_date).toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const endDate = new Date(exercise.end_date).toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate deposit and total
  const deposit = selectedRoomPrice.deposit || 50;
  const total = selectedRoomPrice.price + deposit;

  // Create clean variable symbol (only digits from phone number)
  const variableSymbol = registration.phone.replace(/\D/g, '');

  // Build pricing table HTML for email
  const pricingTable = pricing
    .map(
      (p) => {
        const roomDeposit = p.deposit || 50;
        return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.room_type}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">
            ${p.price} € + záloha ${roomDeposit} € = <strong>${(p.price + roomDeposit).toFixed(2)} €</strong>
          </td>
        </tr>
      `;
      }
    )
    .join('');

  // Send email using template system
  const result = await sendEmailFromTemplate({
    templateKey: 'spiritual_exercise_registration',
    recipientEmail: registration.email,
    recipientName: `${registration.first_name} ${registration.last_name}`,
    variables: {
      first_name: registration.first_name,
      last_name: registration.last_name,
      exercise_title: exercise.title,
      start_date: startDate,
      end_date: endDate,
      location_name: exercise.location_name || '',
      location_city: exercise.location_city || '',
      room_type: registration.room_type,
      price: selectedRoomPrice.price,
      deposit: deposit,
      total: total,
      pricing_table: pricingTable,
      email: registration.email,
      phone: registration.phone,
      variable_symbol: variableSymbol,
      birth_date: new Date(registration.birth_date).toLocaleDateString('sk-SK'),
      street: registration.street,
      city: registration.city,
      postal_code: registration.postal_code,
      parish: registration.parish || '-',
      diocese: registration.diocese || '-',
      dietary_restrictions: registration.dietary_restrictions || '-',
      notes: registration.notes || '-',
      has_parish: registration.parish ? 'true' : 'false',
      has_diocese: registration.diocese ? 'true' : 'false',
      has_dietary: registration.dietary_restrictions ? 'true' : 'false',
      has_notes: registration.notes ? 'true' : 'false',
    },
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }

  return result;
}

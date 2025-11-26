import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Public API - uses anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
interface PricingItem {
  display_order: number;
  [key: string]: unknown;
}

interface TestimonialItem {
  is_visible: boolean;
  display_order: number;
  [key: string]: unknown;
}

interface GalleryItem {
  is_visible: boolean;
  display_order: number;
  [key: string]: unknown;
}

interface FormItem {
  is_active: boolean;
  [key: string]: unknown;
}

// GET - Get spiritual exercise detail by slug
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.slug;

    const { data: exercise, error } = await supabase
      .from('spiritual_exercises')
      .select(`
        *,
        locale:locales(*),
        pricing:spiritual_exercises_pricing(*),
        testimonials:spiritual_exercises_testimonials(*),
        gallery:spiritual_exercises_gallery(*),
        forms:spiritual_exercises_forms(*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .eq('is_active', true)
      .single();

    if (error || !exercise) {
      return NextResponse.json(
        { error: 'Duchovné cvičenie sa nenašlo alebo nie je dostupné' },
        { status: 404 }
      );
    }

    // Filter and sort nested data
     
    const filteredExercise = {
      ...exercise,
      pricing: (exercise.pricing || []).sort((a: PricingItem, b: PricingItem) => a.display_order - b.display_order),
      testimonials: (exercise.testimonials || [])
        .filter((t: TestimonialItem) => t.is_visible)
        .sort((a: TestimonialItem, b: TestimonialItem) => a.display_order - b.display_order),
      gallery: (exercise.gallery || [])
        .filter((g: GalleryItem) => g.is_visible)
        .sort((a: GalleryItem, b: GalleryItem) => a.display_order - b.display_order),
      forms: (exercise.forms || []).filter((f: FormItem) => f.is_active),
    };

    // Get registration count
    const { count } = await supabase
      .from('spiritual_exercises_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('exercise_id', filteredExercise.id)
      .not('payment_status', 'eq', 'cancelled');

    const exerciseWithStats = {
      ...filteredExercise,
      current_registrations: count || 0,
      is_full: filteredExercise.max_capacity ? (count || 0) >= filteredExercise.max_capacity : false,
    };

    return NextResponse.json({ exercise: exerciseWithStats });
  } catch (error) {
    console.error('Error in GET spiritual exercise detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

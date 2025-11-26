import type { SpiritualExerciseGallery, SpiritualExercisePricing, SpiritualExerciseTestimonial } from '@/types/spiritual-exercises';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the exercise ID from params
    const { id } = await context.params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    // Fetch the original exercise with all related data
    const { data: originalExercise, error: fetchError } = await supabase
      .from('spiritual_exercises')
      .select(`
        *,
        pricing:spiritual_exercises_pricing(*),
        testimonials:spiritual_exercises_testimonials(*),
        gallery:spiritual_exercises_gallery(*)
      `)
      .eq('id', exerciseId)
      .single();

    if (fetchError || !originalExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Create new exercise with modified data
    const newExerciseData = {
      title: `${originalExercise.title} (kópia)`,
      slug: `${originalExercise.slug}-copy-${Date.now()}`,
      description: originalExercise.description,
      full_description: originalExercise.full_description,
      image_url: originalExercise.image_url,
      start_date: originalExercise.start_date,
      end_date: originalExercise.end_date,
      location_name: originalExercise.location_name,
      location_address: originalExercise.location_address,
      location_city: originalExercise.location_city,
      location_country: originalExercise.location_country,
      locale_id: originalExercise.locale_id,
      leader_name: originalExercise.leader_name,
      leader_bio: originalExercise.leader_bio,
      leader_photo: originalExercise.leader_photo,
      max_capacity: originalExercise.max_capacity,
      is_published: false, // Set to draft by default
      is_active: originalExercise.is_active,
      current_registrations: 0, // Reset registrations
    };

    // Insert new exercise
    const { data: newExercise, error: insertError } = await supabase
      .from('spiritual_exercises')
      .insert(newExerciseData)
      .select()
      .single();

    if (insertError || !newExercise) {
      console.error('Error inserting exercise:', insertError);
      return NextResponse.json(
        { error: 'Failed to create duplicate exercise' },
        { status: 500 }
      );
    }

    // Duplicate pricing
    if (originalExercise.pricing && originalExercise.pricing.length > 0) {
      const pricingData = originalExercise.pricing.map((price: SpiritualExercisePricing) => ({
        exercise_id: newExercise.id,
        room_type: price.room_type,
        price: price.price,
        deposit: price.deposit,
        description: price.description,
        display_order: price.display_order,
      }));

      const { error: pricingError } = await supabase
        .from('spiritual_exercises_pricing')
        .insert(pricingData);

      if (pricingError) {
        console.error('Error duplicating pricing:', pricingError);
      }
    }

    // Duplicate testimonials
    if (originalExercise.testimonials && originalExercise.testimonials.length > 0) {
      const testimonialsData = originalExercise.testimonials.map((testimonial: SpiritualExerciseTestimonial) => ({
        exercise_id: newExercise.id,
        author_name: testimonial.author_name,
        testimonial_text: testimonial.testimonial_text,
        rating: testimonial.rating,
        display_order: testimonial.display_order,
        is_visible: testimonial.is_visible,
      }));

      const { error: testimonialsError } = await supabase
        .from('spiritual_exercises_testimonials')
        .insert(testimonialsData);

      if (testimonialsError) {
        console.error('Error duplicating testimonials:', testimonialsError);
      }
    }

    // Duplicate gallery
    if (originalExercise.gallery && originalExercise.gallery.length > 0) {
      const galleryData = originalExercise.gallery.map((item: SpiritualExerciseGallery) => ({
        exercise_id: newExercise.id,
        image_url: item.image_url,
        caption: item.caption,
        alt_text: item.alt_text,
        display_order: item.display_order,
        is_visible: item.is_visible,
      }));

      const { error: galleryError } = await supabase
        .from('spiritual_exercises_gallery')
        .insert(galleryData);

      if (galleryError) {
        console.error('Error duplicating gallery:', galleryError);
      }
    }

    return NextResponse.json({
      success: true,
      exercise: newExercise,
      message: 'Exercise duplicated successfully',
    });
  } catch (error) {
    console.error('Error in duplicate exercise:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

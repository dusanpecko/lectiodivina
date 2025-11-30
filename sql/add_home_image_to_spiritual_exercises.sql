-- Migration: Add home_image_url to spiritual_exercises
-- Date: 2025-11-30
-- Purpose: Add illustration image for home page display

ALTER TABLE public.spiritual_exercises 
ADD COLUMN home_image_url text;

COMMENT ON COLUMN public.spiritual_exercises.home_image_url IS 'Illustration image displayed on home page';

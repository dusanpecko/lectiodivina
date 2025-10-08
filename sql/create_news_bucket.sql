-- SQL príkaz na vytvorenie bucketu "news" v Supabase Storage
-- Spustite tento príkaz v Supabase SQL editore alebo vytvorte bucket manuálne

-- Vytvorenie bucketu
INSERT INTO storage.buckets (id, name, public)
VALUES ('news', 'news', true);

-- Nastavenie policies pre bucket (umožní upload a čítanie)
-- Policy pre čítanie (všetci)
CREATE POLICY "Public read access for news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news');

-- Policy pre upload (iba autentifikovaní používatelia)
CREATE POLICY "Authenticated users can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news' AND auth.role() = 'authenticated');

-- Policy pre update (iba autentifikovaní používatelia)
CREATE POLICY "Authenticated users can update news images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'news' AND auth.role() = 'authenticated');

-- Policy pre delete (iba autentifikovaní používatelia)
CREATE POLICY "Authenticated users can delete news images"
ON storage.objects FOR DELETE
USING (bucket_id = 'news' AND auth.role() = 'authenticated');

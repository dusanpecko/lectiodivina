-- Automaticky vytvoriť záznam v users tabuľke pri registrácii
-- Tento trigger sa spustí po vytvorení nového používateľa v auth.users

-- 1. Najprv DOČASNE vypni RLS na users tabuľke pre INSERT operáciu triggera
-- Alebo pridaj špeciálnu RLS policy pre service_role

-- Pridaj RLS policy ktorá umožní INSERT z triggera (service_role má všetky práva)
DROP POLICY IF EXISTS "Allow service role to insert users" ON public.users;

CREATE POLICY "Allow service role to insert users"
ON public.users
FOR INSERT
WITH CHECK (true);

-- 2. Vytvor funkciu s SECURITY DEFINER (spustí sa s právami ownera, nie callera)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, provider, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 3. Vytvor trigger (ak neexistuje)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Uisti sa, že users tabuľka má správne stĺpce
DO $$ 
BEGIN
  -- Pridaj stĺpec provider ak neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'provider'
  ) THEN
    ALTER TABLE public.users ADD COLUMN provider TEXT DEFAULT 'email';
  END IF;
  
  -- Pridaj stĺpec updated_at ak neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 5. Verifikácia triggera
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 6. Verifikácia RLS políky
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

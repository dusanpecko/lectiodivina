-- Launch Checklist Table for tracking project milestones
CREATE TABLE IF NOT EXISTS launch_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  task text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id),
  week_number integer,
  order_index integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE launch_checklist ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admin full access to launch_checklist"
  ON launch_checklist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy: Anyone can view (read-only for non-admins)
CREATE POLICY "Public read access to launch_checklist"
  ON launch_checklist
  FOR SELECT
  USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_launch_checklist_category ON launch_checklist(category);
CREATE INDEX IF NOT EXISTS idx_launch_checklist_order ON launch_checklist(order_index);
CREATE INDEX IF NOT EXISTS idx_launch_checklist_completed ON launch_checklist(is_completed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_launch_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_launch_checklist_timestamp ON launch_checklist;
CREATE TRIGGER update_launch_checklist_timestamp
  BEFORE UPDATE ON launch_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_launch_checklist_updated_at();

-- Insert initial checklist data
INSERT INTO launch_checklist (category, task, week_number, order_index) VALUES
  -- BRANDING (Týždeň 1)
  ('BRANDING', 'Logo exportované vo všetkých formátoch', 1, 1),
  ('BRANDING', 'Brand guidelines vytvorené (PDF)', 1, 2),
  ('BRANDING', 'Písmo Inter nainštalované', 1, 3),
  ('BRANDING', 'Farebná paleta zdokumentovaná', 1, 4),
  ('BRANDING', 'Favicon vytvorený (16×16, 32×32)', 1, 5),
  ('BRANDING', 'Ikona aplikácie (všetky veľkosti iOS/Android)', 1, 6),
  ('BRANDING', 'Social media profily aktualizované', 1, 7),
  ('BRANDING', 'Webstránka lectio.one aktualizovaná', 1, 8),

  -- TECHNICKÁ INFRAŠTRUKTÚRA (Týždeň 2)
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'Databáza pripravená (4 jazyky)', 2, 9),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'API v2 nasadené', 2, 10),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'CDN nakonfigurované', 2, 11),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'Zálohovací systém nastavený', 2, 12),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'Analytics (GA4, Firebase) integrované', 2, 13),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'Bezpečnostné audity dokončené', 2, 14),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'Load testing vykonané', 2, 15),
  ('TECHNICKÁ INFRAŠTRUKTÚRA', 'Monitorovanie a alerty nastavené', 2, 16),

  -- OBSAH (Týždeň 3-5)
  ('OBSAH', 'Slovenský obsah skontrolovaný', 3, 17),
  ('OBSAH', 'Anglický preklad dokončený', 3, 18),
  ('OBSAH', 'Španielsky preklad dokončený', 3, 19),
  ('OBSAH', 'Český preklad dokončený', 3, 20),
  ('OBSAH', 'Teologická kontrola všetkých jazykov', 4, 21),
  ('OBSAH', 'ElevenLabs hlas vybraný pre každý jazyk', 4, 22),
  ('OBSAH', 'Audio generované (365 × 4 × 3 = 4,380 súborov)', 5, 23),
  ('OBSAH', 'QA sampling audio (vzorka 50 súborov)', 5, 24),

  -- APP DEVELOPMENT (Týždeň 3-5)
  ('APP DEVELOPMENT', 'Flutter app aktualizovaný s novým brandingom', 3, 25),
  ('APP DEVELOPMENT', 'Multi-language framework implementovaný', 3, 26),
  ('APP DEVELOPMENT', 'Contemplatio krok pridaný', 3, 27),
  ('APP DEVELOPMENT', 'Tempo možnosti (Rýchle/Vyvážené/Hlboké)', 4, 28),
  ('APP DEVELOPMENT', 'Onboarding flow vylepšený', 4, 29),
  ('APP DEVELOPMENT', 'Push notifikácie testované', 4, 30),
  ('APP DEVELOPMENT', 'Offline režim (ak plánovaný)', 5, 31),
  ('APP DEVELOPMENT', 'Bug fixes z beta testingu', 5, 32),

  -- APP STORE (Týždeň 3-4)
  ('APP STORE', 'Snímky obrazovky (SK/EN/ES/CZ)', 3, 33),
  ('APP STORE', 'Popisy aplikácie napísané', 3, 34),
  ('APP STORE', 'Kľúčové slová vyskúmané', 3, 35),
  ('APP STORE', 'Ikona nahraná', 3, 36),
  ('APP STORE', 'Preview video (voliteľné)', 4, 37),
  ('APP STORE', 'Privacy policy aktualizovaná', 4, 38),
  ('APP STORE', 'GDPR compliance overená', 4, 39),
  ('APP STORE', 'iOS submission pripravený', 4, 40),
  ('APP STORE', 'Android submission pripravený', 4, 41),

  -- FUNDRAISING (Týždeň 3-8)
  ('FUNDRAISING', 'Crowdfunding stránka vytvorená', 3, 42),
  ('FUNDRAISING', 'Video kampane natočené (3-5 min)', 3, 43),
  ('FUNDRAISING', 'Reward tiers definované', 3, 44),
  ('FUNDRAISING', 'Email sequence napísaná', 4, 45),
  ('FUNDRAISING', 'Social media grafika pripravená', 4, 46),
  ('FUNDRAISING', 'Grantové žiadosti odoslané (5-10)', 5, 47),
  ('FUNDRAISING', 'Angel investors kontaktovaní', 5, 48),
  ('FUNDRAISING', 'Kampaň spustená', 6, 49),
  ('FUNDRAISING', 'Denné aktualizácie počas kampane', 7, 50),
  ('FUNDRAISING', 'Thank you messaging pripravené', 8, 51),

  -- MARKETING (Týždeň 6-9)
  ('MARKETING', 'Landing page "Be first to know"', 6, 52),
  ('MARKETING', 'Lead magnet vytvorený (PDF príručka)', 6, 53),
  ('MARKETING', 'Email list building (cieľ: 5k)', 6, 54),
  ('MARKETING', 'Instagram účet aktívny (denné posty)', 6, 55),
  ('MARKETING', 'Facebook skupiny identifikované (50+)', 7, 56),
  ('MARKETING', 'TikTok účet (ak kapacita)', 7, 57),
  ('MARKETING', 'Obsah naplánovaný (30 dní vopred)', 7, 58),
  ('MARKETING', '100 farností kontaktovaných', 8, 59),
  ('MARKETING', '20 partnerských farností potvrdených', 8, 60),
  ('MARKETING', 'Tlačová správa napísaná', 9, 61),
  ('MARKETING', 'Katolícke médiá kontaktované', 9, 62),
  ('MARKETING', 'Influenceri oslovení', 9, 63),

  -- BETA TESTING (Týždeň 8-9)
  ('BETA TESTING', '50-100 beta testerov naverbovaných', 8, 64),
  ('BETA TESTING', 'TestFlight / Firebase setup', 8, 65),
  ('BETA TESTING', 'Feedback formulár vytvorený', 8, 66),
  ('BETA TESTING', 'Beta program komunikácia', 8, 67),
  ('BETA TESTING', 'Týždenné check-in call', 8, 68),
  ('BETA TESTING', 'Bug fixes z feedback', 9, 69),
  ('BETA TESTING', 'Finálne UI vylepšenia', 9, 70),
  ('BETA TESTING', 'Onboarding úpravy', 9, 71),
  ('BETA TESTING', 'Crash-free rate >98%', 9, 72),
  ('BETA TESTING', 'Pozitívna spätná väzba', 9, 73),

  -- SPUSTENIE (Týždeň 10)
  ('SPUSTENIE', 'App Store / Play Store publikované', 10, 74),
  ('SPUSTENIE', 'Webstránka live', 10, 75),
  ('SPUSTENIE', 'Email existujúcim používateľom', 10, 76),
  ('SPUSTENIE', 'Social media oznámenie', 10, 77),
  ('SPUSTENIE', 'Tlačová správa distribuovaná', 10, 78),
  ('SPUSTENIE', 'Farnosti oznámené', 10, 79),
  ('SPUSTENIE', 'Influenceri informovaní', 10, 80),
  ('SPUSTENIE', 'Živé Q&A naplánované', 10, 81),
  ('SPUSTENIE', 'Monitoring dashboard aktívne', 10, 82),
  ('SPUSTENIE', 'Tím pripravený reagovať', 10, 83),

  -- POST-LAUNCH (Týždeň 11+)
  ('POST-LAUNCH', 'Denné sledovanie metrík', 11, 84),
  ('POST-LAUNCH', 'Odpovedanie na recenzie (<24h)', 11, 85),
  ('POST-LAUNCH', 'Oprava kritických bugov', 11, 86),
  ('POST-LAUNCH', 'Weekly newsletter používateľom', 11, 87),
  ('POST-LAUNCH', 'Social media engagement', 11, 88),
  ('POST-LAUNCH', 'Sledovanie pokroku fundraisingu', 11, 89),
  ('POST-LAUNCH', 'Mesačná retrospektíva', 11, 90),
  ('POST-LAUNCH', 'Plánovanie ďalších funkcií', 11, 91)
ON CONFLICT DO NOTHING;

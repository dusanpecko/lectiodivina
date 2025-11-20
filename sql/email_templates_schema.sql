-- Email Templates Schema
-- Umožňuje upravovať email texty bez programovania

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template identification
  template_key TEXT UNIQUE NOT NULL, -- napr: 'order_confirmation', 'subscription_created'
  name TEXT NOT NULL, -- User-friendly názov
  description TEXT, -- Popis kedy sa email posiela
  category TEXT NOT NULL, -- 'order', 'subscription', 'donation'
  
  -- Email content (multi-language support)
  subject_sk TEXT NOT NULL,
  subject_en TEXT,
  subject_cz TEXT,
  subject_es TEXT,
  
  body_sk TEXT NOT NULL, -- HTML alebo plain text
  body_en TEXT,
  body_cz TEXT,
  body_es TEXT,
  
  -- Template variables (JSON array of available placeholders)
  -- Example: ["{{customer_name}}", "{{order_number}}", "{{total_amount}}"]
  available_variables JSONB DEFAULT '[]'::jsonb,
  
  -- Settings
  from_email TEXT DEFAULT 'noreply@lectiodivina.org',
  from_name TEXT DEFAULT 'Lectio Divina',
  reply_to TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0
);

-- Email sending log
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template reference
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  template_key TEXT NOT NULL,
  
  -- Recipient info
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Email content (stored for history)
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  locale TEXT DEFAULT 'sk',
  
  -- Related entities
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  
  -- Sending status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, bounced
  provider TEXT, -- 'resend', 'sendgrid', 'smtp'
  provider_message_id TEXT,
  error_message TEXT,
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_templates_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_order ON email_logs(order_id);
CREATE INDEX idx_email_logs_subscription ON email_logs(subscription_id);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access to email_templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

CREATE POLICY "Admin full access to email_logs"
  ON email_logs FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Users can view their own email logs
CREATE POLICY "Users can view own email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert email logs (from API)
CREATE POLICY "Service role can insert email_logs"
  ON email_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_updated_at();

-- Insert default email templates
INSERT INTO email_templates (template_key, name, description, category, subject_sk, body_sk, available_variables) VALUES

-- ORDER TEMPLATES
(
  'order_confirmation',
  'Potvrdenie objednávky',
  'Email odoslaný okamžite po úspešnej objednávke',
  'order',
  'Ďakujeme za Vašu objednávku #{{order_number}}',
  '<h1>Objednávka potvrdená ✅</h1>
<p>Milý/á {{customer_name}},</p>
<p>Ďakujeme za Vašu objednávku! Vaše číslo objednávky je <strong>#{{order_number}}</strong>.</p>

<h2>Detaily objednávky:</h2>
<ul>
{{#items}}
  <li>{{name}} - {{quantity}}× - €{{price}}</li>
{{/items}}
</ul>

<p><strong>Celkom: €{{total_amount}}</strong></p>
<p>Poštovné: €{{shipping_cost}}</p>

<h2>Doručovacia adresa:</h2>
<p>
{{shipping_name}}<br>
{{shipping_address}}<br>
{{shipping_city}}, {{shipping_zip}}<br>
{{shipping_country}}
</p>

<p>Objednávku odošleme čo najskôr. O odoslaní Vás budeme informovať emailom s tracking číslom.</p>

<p>S láskou,<br>Tím Lectio Divina</p>',
  '["{{customer_name}}", "{{order_number}}", "{{total_amount}}", "{{shipping_cost}}", "{{items}}", "{{shipping_name}}", "{{shipping_address}}", "{{shipping_city}}", "{{shipping_zip}}", "{{shipping_country}}"]'::jsonb
),

(
  'order_shipped',
  'Objednávka odoslaná',
  'Email s tracking číslom keď admin označí objednávku ako odoslanú',
  'order',
  'Vaša objednávka #{{order_number}} bola odoslaná 📦',
  '<h1>Objednávka na ceste! 📦</h1>
<p>Milý/á {{customer_name}},</p>
<p>Vaša objednávka <strong>#{{order_number}}</strong> bola odoslaná!</p>

<h2>Tracking informácie:</h2>
<p><strong>Tracking číslo:</strong> {{tracking_number}}</p>
<p><strong>Kuriér:</strong> {{carrier}}</p>
<p><a href="{{tracking_url}}" style="background: #40467b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Sledovať zásielku</a></p>

<p>Doručenie očakávame do {{estimated_delivery}} dní.</p>

<p>S láskou,<br>Tím Lectio Divina</p>',
  '["{{customer_name}}", "{{order_number}}", "{{tracking_number}}", "{{carrier}}", "{{tracking_url}}", "{{estimated_delivery}}"]'::jsonb
),

-- SUBSCRIPTION TEMPLATES
(
  'subscription_created',
  'Nové predplatné',
  'Email po vytvorení nového subscription',
  'subscription',
  'Ďakujeme za podporu! Vaše predplatné {{tier_name}} je aktívne 💜',
  '<h1>Vitajte v komunite podporovateľov! 🙏</h1>
<p>Milý/á {{customer_name}},</p>
<p>Ďakujeme za Vašu podporu projektu Lectio Divina!</p>

<h2>Detaily predplatného:</h2>
<ul>
  <li><strong>Tier:</strong> {{tier_name}}</li>
  <li><strong>Cena:</strong> €{{amount}}/{{interval}}</li>
  <li><strong>Začiatok:</strong> {{start_date}}</li>
  <li><strong>Ďalšia platba:</strong> {{next_billing_date}}</li>
</ul>

<h2>Vaše benefity:</h2>
<p>{{tier_benefits}}</p>

<p><a href="{{account_url}}" style="background: #40467b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Zobraziť môj účet</a></p>

<p>S láskou a vďakou,<br>Tím Lectio Divina</p>',
  '["{{customer_name}}", "{{tier_name}}", "{{amount}}", "{{interval}}", "{{start_date}}", "{{next_billing_date}}", "{{tier_benefits}}", "{{account_url}}"]'::jsonb
),

(
  'subscription_renewal',
  'Obnovenie predplatného',
  'Email pri úspešnom obnovení subscription',
  'subscription',
  'Vaše predplatné {{tier_name}} bolo obnovené ✅',
  '<h1>Predplatné obnovené</h1>
<p>Milý/á {{customer_name}},</p>
<p>Vaše predplatné <strong>{{tier_name}}</strong> bolo úspešne obnovené.</p>

<ul>
  <li><strong>Suma:</strong> €{{amount}}</li>
  <li><strong>Dátum platby:</strong> {{payment_date}}</li>
  <li><strong>Ďalšie obnovenie:</strong> {{next_billing_date}}</li>
</ul>

<p><a href="{{receipt_url}}">Stiahnuť faktúru</a></p>

<p>Ďakujeme za Vašu pokračujúcu podporu! 💜</p>

<p>S láskou,<br>Tím Lectio Divina</p>',
  '["{{customer_name}}", "{{tier_name}}", "{{amount}}", "{{payment_date}}", "{{next_billing_date}}", "{{receipt_url}}"]'::jsonb
),

(
  'subscription_cancelled',
  'Zrušenie predplatného',
  'Email keď user zruší subscription',
  'subscription',
  'Vaše predplatné bolo zrušené',
  '<h1>Predplatné zrušené</h1>
<p>Milý/á {{customer_name}},</p>
<p>Vaše predplatné <strong>{{tier_name}}</strong> bolo zrušené podľa Vašej požiadavky.</p>

<p><strong>Prístup zostáva aktívny do:</strong> {{access_until}}</p>

<p>Po tomto dátume stratíte prístup k premium obsahu, ale môžete naďalej používať základné funkcie Lectio Divina.</p>

<p>Ak to bola chyba, môžete predplatné obnoviť na <a href="{{renew_url}}">tejto stránke</a>.</p>

<p>Ďakujeme za Vašu doterajšiu podporu! 🙏</p>

<p>S láskou,<br>Tím Lectio Divina</p>',
  '["{{customer_name}}", "{{tier_name}}", "{{access_until}}", "{{renew_url}}"]'::jsonb
),

(
  'payment_failed',
  'Platba zlyhala',
  'Email keď sa nepodarí stiahnuť platbu z karty',
  'subscription',
  '⚠️ Problém s platbou pre predplatné {{tier_name}}',
  '<h1>Problém s platbou</h1>
<p>Milý/á {{customer_name}},</p>
<p>Nepodarilo sa nám stiahnuť platbu za Vaše predplatné <strong>{{tier_name}}</strong>.</p>

<p><strong>Dôvod:</strong> {{error_reason}}</p>

<p>Prosím, aktualizujte Vaše platobné údaje čo najskôr, aby Vaše predplatné zostalo aktívne.</p>

<p><a href="{{update_payment_url}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">Aktualizovať platobnú metódu</a></p>

<p>Budeme to skúšať ešte {{retry_attempts}}× počas nasledujúcich dní. Ak platba zlyhá, predplatné bude zrušené.</p>

<p>S pozdravom,<br>Tím Lectio Divina</p>',
  '["{{customer_name}}", "{{tier_name}}", "{{error_reason}}", "{{update_payment_url}}", "{{retry_attempts}}"]'::jsonb
),

-- DONATION TEMPLATES
(
  'donation_receipt',
  'Potvrdenie daru',
  'Email s poďakovaním a potvrdením daru',
  'donation',
  'Ďakujeme za Váš dar 💝',
  '<h1>Ďakujeme za Váš dar! 💝</h1>
<p>Milý/á {{donor_name}},</p>
<p>S veľkou vďakou prijímame Váš dar vo výške <strong>€{{amount}}</strong> pre projekt Lectio Divina.</p>

{{#has_message}}
<p><em>Váš odkaz: "{{message}}"</em></p>
{{/has_message}}

<p>Vaša podpora nám umožňuje pokračovať v šírení Božieho slova a pomáhať ľuďom rásť vo viere.</p>

<h2>Detaily daru:</h2>
<ul>
  <li><strong>Suma:</strong> €{{amount}}</li>
  <li><strong>Dátum:</strong> {{donation_date}}</li>
  <li><strong>Číslo transakcie:</strong> {{transaction_id}}</li>
</ul>

<p><a href="{{receipt_url}}">Stiahnuť daňový doklad</a></p>

<p>Nech Vás Boh žehná! 🙏</p>

<p>S láskou a vďakou,<br>Tím Lectio Divina</p>',
  '["{{donor_name}}", "{{amount}}", "{{message}}", "{{has_message}}", "{{donation_date}}", "{{transaction_id}}", "{{receipt_url}}"]'::jsonb
);

-- Insert English translations (optional - môžeš pridať neskôr)
-- Pre každý template môžeš UPDATE pridať subject_en, body_en atď.

COMMENT ON TABLE email_templates IS 'Upraviteľné email šablóny s multi-language podporou';
COMMENT ON TABLE email_logs IS 'História odoslaných emailov pre audit a debugging';

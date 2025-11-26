-- Email template for Spiritual Exercises Registration Confirmation
-- Run this in Supabase SQL Editor

INSERT INTO email_templates (
  template_key,
  name,
  description,
  category,
  subject_sk,
  body_sk,
  available_variables,
  from_email,
  from_name,
  reply_to,
  is_active
)
VALUES (
  'spiritual_exercise_registration',
  'Potvrdenie registrácie na duchovné cvičenia',
  'Email posielaný účastníkom po úspešnej registrácii na duchovné cvičenia',
  'spiritual_exercises',
  'Potvrdenie registrácie - {{exercise_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Potvrdenie registrácie - {{exercise_title}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6e8292;">Ďakujeme za registráciu</h1>
  
  <p><strong>Milý/á {{first_name}} {{last_name}},</strong></p>
  
  <p>Vyplnením tohto formulára ste sa <strong>ZÁVÄZNE prihlásili</strong> na duchovné cvičenia.</p>
  
  <div style="background-color: #f3f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #6e8292;">{{exercise_title}}</h2>
    <p style="margin: 5px 0;"><strong>Začiatok:</strong> {{start_date}}</p>
    <p style="margin: 5px 0;"><strong>Koniec:</strong> {{end_date}}</p>
    <p style="margin: 5px 0;"><strong>Miesto:</strong> {{location_name}}, {{location_city}}</p>
  </div>

  <h3 style="color: #6e8292;">Cenník</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <thead>
      <tr style="background-color: #6e8292; color: white;">
        <th style="padding: 10px; text-align: left;">Typ izby</th>
        <th style="padding: 10px; text-align: right;">Cena</th>
      </tr>
    </thead>
    <tbody>
      {{pricing_table}}
    </tbody>
  </table>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
    <h3 style="margin-top: 0;">Vaša rezervácia:</h3>
    <p style="margin: 5px 0;"><strong>Typ izby:</strong> {{room_type}}</p>
    <p style="margin: 5px 0; font-size: 18px;"><strong>Celková cena: {{total}} €</strong></p>
  </div>

  <h3 style="color: #6e8292;">Informácie o platbe</h3>
  <p><strong>Záloha je povinná</strong> - doplatok sa bude uhrádzať až na mieste.</p>
  
  <div style="background-color: #f3f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Číslo účtu:</strong> SK42 7500 0000 0040 3515 6222</p>
    <p style="margin: 5px 0;"><strong>Variabilný symbol:</strong> {{variable_symbol}}</p>
    <p style="margin: 5px 0;"><strong>Do poznámky platby uveďte:</strong> {{first_name}} {{last_name}} + Lectio divina</p>
    <p style="margin: 5px 0; font-size: 18px; color: #d9534f;"><strong>Záloha: {{deposit}} €</strong></p>
  </div>

  <p>V cene je zahrnuté ubytovanie, plná penzia, občerstvenie, žurnál Lectio divina a registračný poplatok, ktorý kryje náklady tímu a organizačného zabezpečenia.</p>

  <h3 style="color: #6e8292;">Vaše údaje</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr style="background-color: #ffffff;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{email}}</td>
    </tr>
    <tr style="background-color: #f3f5f7;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Meno:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{first_name}}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Priezvisko:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{last_name}}</td>
    </tr>
    <tr style="background-color: #f3f5f7;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Telefón:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{phone}}</td>
    </tr>
    <tr style="background-color: #ffffff;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Dátum narodenia:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{birth_date}}</td>
    </tr>
    <tr style="background-color: #f3f5f7;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Adresa:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{street}}, {{city}}, {{postal_code}}</td>
    </tr>
    {{#has_parish}}
    <tr style="background-color: #ffffff;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Farnosť:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{parish}}</td>
    </tr>
    {{/has_parish}}
    {{#has_diocese}}
    <tr style="background-color: #f3f5f7;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Diecéza:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{diocese}}</td>
    </tr>
    {{/has_diocese}}
    {{#has_dietary}}
    <tr style="background-color: #ffffff;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Obmedzenia v strave:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{dietary_restrictions}}</td>
    </tr>
    {{/has_dietary}}
    {{#has_notes}}
    <tr style="background-color: #f3f5f7;">
      <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Poznámka:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">{{notes}}</td>
    </tr>
    {{/has_notes}}
  </table>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #6e8292;">
    <p><strong>Dôležité informácie:</strong></p>
    <ul>
      <li>Bližšie informácie o programe seminára vám zašleme krátko pred jeho začiatkom.</li>
      <li>Ak vám kópia formulára do emailu neprišla, vieme vašu registráciu skontrolovať a potvrdiť. Stačí nám o tom napísať na <a href="mailto:info@lectio.one">info@lectio.one</a></li>
      <li>Ďalšie informácie: <a href="mailto:info@lectio.one">info@lectio.one</a>, +421 902 575 575</li>
    </ul>
  </div>

  <p style="margin-top: 30px;"><strong>Ďakujeme a tešíme sa na stretnutie s vami!</strong><br>
  Tím Lectio divina</p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <p style="font-size: 12px; color: #666;">
    Duchovné cvičenia organizuje tím Krok - Pastoračný fond Žilinskej diecézy, so súhlasom a požehnaním o. biskupa Tomáša Galisa.
  </p>
</body>
</html>',
  '[
    "first_name",
    "last_name",
    "exercise_title",
    "start_date",
    "end_date",
    "location_name",
    "location_city",
    "room_type",
    "price",
    "deposit",
    "total",
    "pricing_table",
    "email",
    "phone",
    "birth_date",
    "street",
    "city",
    "postal_code",
    "parish",
    "diocese",
    "dietary_restrictions",
    "notes",
    "has_parish",
    "has_diocese",
    "has_dietary",
    "has_notes"
  ]'::jsonb,
  'noreply@lectio.one',
  'Lectio Divina - Duchovné cvičenia',
  'info@lectio.one',
  true
)
ON CONFLICT (template_key) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject_sk = EXCLUDED.subject_sk,
  body_sk = EXCLUDED.body_sk,
  available_variables = EXCLUDED.available_variables,
  from_email = EXCLUDED.from_email,
  from_name = EXCLUDED.from_name,
  reply_to = EXCLUDED.reply_to,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify insertion
SELECT template_key, name, category, is_active, created_at 
FROM email_templates 
WHERE template_key = 'spiritual_exercise_registration';

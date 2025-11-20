// app/api/contact/route.ts

import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Type definitions for better TypeScript support
interface EmailData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'ADMIN_EMAIL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create email transporter with error handling
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw new Error('Email service unavailable');
  }
};

// reCAPTCHA Enterprise Assessment
async function createRecaptchaAssessment({
  projectID = process.env.PROJECT_ID || "dpapp-297812",
  recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Lc6GWwrAAAAAOJWvRqOyQY0lrb_ve0VIBapbbUN",
  token,
  recaptchaAction = "contact_form",
}: {
  projectID?: string;
  recaptchaKey?: string;
  token: string;
  recaptchaAction?: string;
}): Promise<number | null> {
  try {
    // Create the reCAPTCHA client
    const client = new RecaptchaEnterpriseServiceClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const projectPath = client.projectPath(projectID);

    // Build the assessment request
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      console.log(`reCAPTCHA token invalid: ${response.tokenProperties?.invalidReason}`);
      return null;
    }

    // Check if the expected action was executed
    if (response.tokenProperties?.action === recaptchaAction) {
      const score = response.riskAnalysis?.score || 0;
      console.log(`reCAPTCHA score: ${score}`);
      
      // Log reasons if any
      if (response.riskAnalysis?.reasons) {
        response.riskAnalysis.reasons.forEach((reason) => {
          console.log(`reCAPTCHA reason: ${reason}`);
        });
      }

      return score;
    } else {
      console.log(`reCAPTCHA action mismatch. Expected: ${recaptchaAction}, Got: ${response.tokenProperties?.action}`);
      return null;
    }
  } catch (error) {
    console.error('reCAPTCHA Enterprise assessment error:', error);
    return null;
  }
}

// Verify reCAPTCHA token (with Enterprise fallback)
async function verifyRecaptcha(token: string, action: string): Promise<boolean> {
  if (!token) return false;
  
  // Try Enterprise first if credentials are available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT) {
    try {
      const score = await createRecaptchaAssessment({ token, recaptchaAction: action });
      if (score !== null) {
        // Consider score > 0.5 as valid (adjust threshold as needed)
        return score > 0.5;
      }
    } catch {
      console.log('Falling back to basic reCAPTCHA verification');
    }
  }
  
  // Fallback to basic reCAPTCHA verification
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
    
    const data = await response.json();
    return data.success && data.action === action && data.score > 0.5;
  } catch (error) {
    console.error('Basic reCAPTCHA verification error:', error);
    return false;
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes default
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'); // 5 requests default
  
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Email templates
function createEmailTemplate(data: EmailData, language: string = 'sk') {
  const templates = {
    sk: {
      subject: 'Nová správa z kontaktného formulára - Lectio Divina',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Lectio Divina</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Nová správa z kontaktného formulára</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Detaily správy</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Meno:</strong> ${data.firstName} ${data.lastName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 0 0 10px 0;"><strong>Dátum:</strong> ${new Date(data.timestamp).toLocaleString('sk-SK')}</p>
              <p style="margin: 0;"><strong>IP adresa:</strong> ${data.ipAddress}</p>
            </div>
            
            <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Správa:</h3>
              <p style="line-height: 1.6; color: #4b5563; margin: 0;">${data.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Táto správa bola odoslaná cez kontaktný formulár na stránke Lectio Divina
              </p>
            </div>
          </div>
        </div>
      `
    }
  };
  
  return templates[language as keyof typeof templates] || templates.sk;
}

function createAutoReplyTemplate(data: EmailData, language: string = 'sk') {
  const templates = {
    sk: {
      subject: 'Potvrdenie prijatia správy - Lectio Divina',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Lectio Divina</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Ďakujeme za vašu správu</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Vážený/á ${data.firstName},</h2>
            
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Ďakujeme za vašu správu týkajúcu sa aplikácie Lectio Divina. 
              Vaša správa bola úspešne prijatá a náš tím sa vám ozve čo najskôr.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-style: italic;">
                "Skúste a presvedčte sa, aký dobrý je Pán" - Žalm 34:9
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                S požehnaním,<br>
                Tím lectio.one
              </p>
            </div>
          </div>
        </div>
      `
    },
    en: {
      subject: 'Message Received Confirmation - Lectio Divina',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Lectio Divina</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your message</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Dear ${data.firstName},</h2>
            
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Thank you for your message regarding the Lectio Divina app. 
              Your message has been successfully received and our team will get back to you as soon as possible.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-style: italic;">
                "Taste and see that the Lord is good" - Psalm 34:9
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                With blessings,<br>
                The lectio.one Team
              </p>
            </div>
          </div>
        </div>
      `
    },
    es: {
      subject: 'Confirmación de recepción del mensaje - Lectio Divina',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Lectio Divina</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Gracias por tu mensaje</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Estimado/a ${data.firstName},</h2>
            
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Gracias por tu mensaje sobre la aplicación Lectio Divina. 
              Tu mensaje ha sido recibido con éxito y nuestro equipo se pondrá en contacto contigo lo antes posible.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-style: italic;">
                "Prueben y vean qué bueno es el Señor" - Salmo 34:9
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Con bendiciones,<br>
                El equipo de lectio.one
              </p>
            </div>
          </div>
        </div>
      `
    },
    cz: {
      subject: 'Potvrzení přijetí zprávy - Lectio Divina',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Lectio Divina</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Děkujeme za vaši zprávu</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Vážený/á ${data.firstName},</h2>
            
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Děkujeme za vaši zprávu týkající se aplikace Lectio Divina. 
              Vaše zpráva byla úspěšně přijata a náš tým se vám ozve co nejdříve.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-style: italic;">
                "Okuste a vizte, že Hospodin je dobrý" - Žalm 34:9
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                S požehnáním,<br>
                Tým lectio.one
              </p>
            </div>
          </div>
        </div>
      `
    }
  };
  
  return templates[language as keyof typeof templates] || templates.sk;
}

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration');
      return NextResponse.json(
        { error: 'Email service unavailable' },
        { status: 500 }
      );
    }

    const ip = getClientIP(request);
    
    // Check rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      message,
      privacyConsent,
      recaptchaToken,
      language = 'sk',
      userAgent,
      timestamp
    } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !message || !privacyConsent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Verify reCAPTCHA (Enterprise or basic)
    if (recaptchaToken) {
      const isValidRecaptcha = await verifyRecaptcha(recaptchaToken, 'contact_form');
      if (!isValidRecaptcha) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }
    
    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          privacy_consent: privacyConsent,
          recaptcha_token: recaptchaToken,
          ip_address: ip,
          user_agent: userAgent,
          created_at: timestamp || new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }
    
    // Prepare email data
    const emailData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: timestamp || new Date().toISOString(),
      ipAddress: ip,
      userAgent
    };
    
    // Send emails only if SMTP is properly configured
    try {
      const transporter = createTransporter();
      
      // Send notification email to admin
      const adminTemplate = createEmailTemplate(emailData, language);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        cc: process.env.SMTP_FROM,
        subject: adminTemplate.subject,
        html: adminTemplate.html
      });
      
      // Send auto-reply to user
      const autoReplyTemplate = createAutoReplyTemplate(emailData, language);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email.trim(),
        subject: autoReplyTemplate.subject,
        html: autoReplyTemplate.html
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the entire request if email fails, just log it
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: dbData.id
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
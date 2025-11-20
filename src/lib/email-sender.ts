/**
 * Email Sending Service
 * Sends emails using database templates with variable replacement
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

interface SendEmailParams {
  templateKey: string;
  recipientEmail: string;
  recipientName?: string;
  variables: Record<string, string | number | boolean>;
  locale?: 'sk' | 'en' | 'cz' | 'es';
  userId?: string;
  orderId?: string;
  subscriptionId?: string;
  donationId?: string;
}

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  category: string;
  subject_sk: string;
  subject_en: string | null;
  subject_cz: string | null;
  subject_es: string | null;
  body_sk: string;
  body_en: string | null;
  body_cz: string | null;
  body_es: string | null;
  from_email: string;
  from_name: string;
  reply_to: string | null;
  is_active: boolean;
}

/**
 * Replace template variables with actual values
 * Supports {{variable}} syntax and {{#condition}}...{{/condition}} blocks
 */
function renderTemplate(template: string, variables: Record<string, string | number | boolean>): string {
  let rendered = template;

  // Replace conditional blocks {{#key}}...{{/key}}
  const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  rendered = rendered.replace(conditionalRegex, (match, key, content) => {
    const value = variables[key];
    // Show content if variable is truthy
    return value ? content : '';
  });

  // Replace simple variables {{key}}
  const variableRegex = /\{\{(\w+)\}\}/g;
  rendered = rendered.replace(variableRegex, (match, key) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : match;
  });

  return rendered;
}

/**
 * Send email using template from database
 */
export async function sendEmailFromTemplate(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const {
    templateKey,
    recipientEmail,
    recipientName,
    variables,
    locale = 'sk',
    userId,
    orderId,
    subscriptionId,
    donationId,
  } = params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .eq('is_active', true)
      .single<EmailTemplate>();

    if (templateError || !template) {
      console.error('Template not found:', templateKey, templateError);
      return { success: false, error: 'Template not found' };
    }

    // 2. Get subject and body for the locale (fallback to Slovak)
    const subjectKey = `subject_${locale}` as keyof EmailTemplate;
    const bodyKey = `body_${locale}` as keyof EmailTemplate;

    let subject = template[subjectKey] as string | null;
    let body = template[bodyKey] as string | null;

    // Fallback to Slovak if locale not available
    if (!subject) subject = template.subject_sk;
    if (!body) body = template.body_sk;

    // 3. Render template with variables
    const renderedSubject = renderTemplate(subject || '', variables);
    const renderedBody = renderTemplate(body || '', variables);

    // 4. Send email via SMTP (or Resend/SendGrid)
    const emailResult = await sendEmailViaSMTP({
      from: `${template.from_name} <${template.from_email}>`,
      to: recipientEmail,
      replyTo: template.reply_to || undefined,
      subject: renderedSubject,
      html: renderedBody,
    });

    // 5. Log email to database
    const { error: logError } = await supabase.from('email_logs').insert({
      template_id: template.id,
      template_key: templateKey,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      user_id: userId,
      subject: renderedSubject,
      body: renderedBody,
      locale,
      order_id: orderId,
      subscription_id: subscriptionId,
      donation_id: donationId,
      status: emailResult.success ? 'sent' : 'failed',
      provider: 'smtp',
      provider_message_id: emailResult.messageId,
      error_message: emailResult.error,
      sent_at: emailResult.success ? new Date().toISOString() : null,
    });

    if (logError) {
      console.error('Failed to log email:', logError);
    }

    // 6. Update template sent_count and last_sent_at
    if (emailResult.success) {
      await supabase.rpc('increment_email_sent_count', {
        template_key: templateKey,
      });
    }

    return emailResult;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email via SMTP using Nodemailer
 */
async function sendEmailViaSMTP(params: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.m1.websupport.sk',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // port 465 requires secure: true
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: params.from,
      to: params.to,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
    });

    console.log('Email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('SMTP error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMTP error',
    };
  }
}

/**
 * Helper to format currency
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Helper to format date
 */
export function formatDate(date: string | Date, locale = 'sk-SK'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

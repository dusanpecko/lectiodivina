// utils/auditHelpers.ts
import { SupabaseClient } from '@supabase/supabase-js';

export class AuditLogger {
  constructor(private supabase: SupabaseClient, private userEmail?: string) {}

  async logNewsAction(action: 'create' | 'edit' | 'delete', title: string, details?: string) {
    const actionTexts = {
      create: `Vytvorený nový článok: "${title}"`,
      edit: `Upravený článok: "${title}"${details ? ` - ${details}` : ''}`,
      delete: `Vymazaný článok: "${title}"`
    };

    return this.log('news', actionTexts[action], action);
  }

  async logUserAction(action: 'create' | 'edit' | 'delete', userIdentifier: string, details?: string) {
    const actionTexts = {
      create: `Vytvorený nový používateľ: ${userIdentifier}`,
      edit: `Upravený používateľ: ${userIdentifier}${details ? ` - ${details}` : ''}`,
      delete: `Vymazaný používateľ: ${userIdentifier}`
    };

    return this.log('users', actionTexts[action], action);
  }

  async logLectioAction(action: 'create' | 'edit' | 'delete', title: string, details?: string) {
    const actionTexts = {
      create: `Vytvorené nové lectio: "${title}"`,
      edit: `Upravené lectio: "${title}"${details ? ` - ${details}` : ''}`,
      delete: `Vymazané lectio: "${title}"`
    };

    return this.log('lectio', actionTexts[action], action);
  }

  async logQuoteAction(action: 'create' | 'edit' | 'delete', quoteText: string, details?: string) {
    const shortQuote = quoteText.length > 50 ? quoteText.substring(0, 50) + '...' : quoteText;
    const actionTexts = {
      create: `Vytvorený nový citát: "${shortQuote}"`,
      edit: `Upravený citát: "${shortQuote}"${details ? ` - ${details}` : ''}`,
      delete: `Vymazaný citát: "${shortQuote}"`
    };

    return this.log('daily_quotes', actionTexts[action], action);
  }

  async logSystemAction(action: string, details?: string) {
    return this.log('system', `${action}${details ? ` - ${details}` : ''}`, 'edit');
  }

  private async log(tableName: string, action: string, actionType: 'create' | 'edit' | 'delete') {
    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert({
          table_name: tableName,
          action,
          action_type: actionType,
          user_email: this.userEmail || 'system@app.com',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }
}
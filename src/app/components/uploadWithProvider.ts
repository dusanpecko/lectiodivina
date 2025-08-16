// src/app/components/uploadWithProvider.ts
import { SupabaseClient } from '@supabase/supabase-js';

export type FileUploadType = 'image' | 'audio';

export interface UploadResult {
  url: string;
  path: string;
  success: boolean;
  error?: string;
}

/**
 * Upload súboru do Supabase Storage bucket "rosary"
 * Používa Supabase klienta z SupabaseProvider
 */
export const uploadLectioFile = async (
  supabase: SupabaseClient,
  file: File, 
  type: FileUploadType
): Promise<UploadResult> => {
  try {
    console.log('🚀 Začínam upload do bucket "rosary"...');

    // Validácia súboru
    const validationResult = await validateFile(file, type);
    if (!validationResult.isValid) {
      return {
        url: '',
        path: '',
        success: false,
        error: validationResult.error
      };
    }

    // Generovanie názvu súboru
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `lectio-divina-${type}s/${fileName}`;

    console.log('📤 Uploading súbor do bucket "rosary":', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      targetPath: filePath
    });

    // Upload súboru do rosary bucket
    let uploadResult = await supabase.storage
      .from('rosary')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    // Ak súbor už existuje, skús s upsert
    if (uploadResult.error && uploadResult.error.message.includes('already exists')) {
      console.log('🔄 Súbor existuje, skúšam s upsert...');
      uploadResult = await supabase.storage
        .from('rosary')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
    }

    const { data, error } = uploadResult;

    if (error) {
      console.error('❌ Storage upload error:', error);
      
      // Detailné error handling
      if (error.message.includes('Bucket not found')) {
        return {
          url: '',
          path: '',
          success: false,
          error: 'Bucket "rosary" sa nenašiel. Vytvorte ho v Supabase Dashboard → Storage.'
        };
      }
      
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        return {
          url: '',
          path: '',
          success: false,
          error: 'Problém s prístupovými právami. Bucket "rosary" nemá správne nastavené RLS politiky.'
        };
      }

      if (error.message.includes('JWT') || error.message.includes('auth')) {
        return {
          url: '',
          path: '',
          success: false,
          error: 'Problém s autentifikáciou. Skúste sa prihlásiť do aplikácie.'
        };
      }

      if (error.message.includes('not allowed') || error.message.includes('forbidden')) {
        return {
          url: '',
          path: '',
          success: false,
          error: 'Prístup zamietnutý. Skontrolujte že bucket "rosary" je public a má správne politiky.'
        };
      }
      
      return {
        url: '',
        path: '',
        success: false,
        error: `Upload chyba: ${error.message}`
      };
    }

    console.log('✅ Upload úspešný:', data);

    // Získanie verejnej URL
    const { data: publicData } = supabase.storage
      .from('rosary')
      .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
      return {
        url: '',
        path: '',
        success: false,
        error: 'Nepodarilo sa získať verejnú URL'
      };
    }

    console.log('✅ Verejná URL:', publicData.publicUrl);

    return {
      url: publicData.publicUrl,
      path: filePath,
      success: true
    };

  } catch (error) {
    console.error('❌ Celková chyba uploadu:', error);
    return {
      url: '',
      path: '',
      success: false,
      error: error instanceof Error ? error.message : 'Neznáma chyba pri uploade'
    };
  }
};

/**
 * Vymazanie súboru zo Supabase Storage
 */
export const deleteLectioFile = async (
  supabase: SupabaseClient,
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('rosary')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    console.log(`✅ Súbor zmazaný z bucket "rosary": ${filePath}`);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * Klientská validácia súboru
 */
export const validateFile = (file: File, type: FileUploadType): { isValid: boolean; error?: string } => {
  // Kontrola veľkosti (50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Súbor je príliš veľký. Maximálna veľkosť je 50MB. Váš súbor má ${(file.size / 1024 / 1024).toFixed(2)}MB.`
    };
  }

  // Kontrola MIME typu
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];

  if (type === 'image' && !allowedImageTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Nepodporovaný typ obrázka. Povolené sú: JPEG, PNG, WebP, GIF. Váš súbor: ${file.type}`
    };
  }

  if (type === 'audio' && !allowedAudioTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Nepodporovaný typ audio súboru. Povolené sú: MP3, WAV, OGG, M4A, AAC. Váš súbor: ${file.type}`
    };
  }

  return { isValid: true };
};

/**
 * Získanie URL z cesty súboru
 */
export const getLectioFileUrl = (supabase: SupabaseClient, filePath: string): string => {
  const { data } = supabase.storage
    .from('rosary')
    .getPublicUrl(filePath);

  return data?.publicUrl || '';
};

/**
 * Extrakcia cesty súboru z URL
 */
export const extractFilePathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'rosary');
    
    if (bucketIndex !== -1 && pathParts.length > bucketIndex + 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting file path:', error);
    return '';
  }
};

/**
 * Formátovanie veľkosti súboru
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Získanie typu súboru z MIME typu
 */
export const getFileTypeFromMime = (mimeType: string): FileUploadType | null => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  return null;
};
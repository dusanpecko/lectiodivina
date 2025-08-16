// src/app/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { 
  uploadLectioFile, 
  deleteLectioFile, 
  validateFile, 
  FileUploadType, 
  UploadResult 
} from '@/app/components/uploadWithProvider';

interface UseFileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UploadResult[];
}

interface UseFileUploadReturn extends UseFileUploadState {
  uploadFile: (supabase: SupabaseClient, file: File, type: FileUploadType) => Promise<UploadResult>;
  deleteFile: (supabase: SupabaseClient, filePath: string) => Promise<boolean>;
  clearError: () => void;
  resetState: () => void;
  validateFileClient: (file: File, type: FileUploadType) => { isValid: boolean; error?: string };
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [state, setState] = useState<UseFileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFiles: []
  });

  const updateState = useCallback((updates: Partial<UseFileUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const uploadFile = useCallback(async (
    supabase: SupabaseClient, 
    file: File, 
    type: FileUploadType
  ): Promise<UploadResult> => {
    updateState({ 
      isUploading: true, 
      progress: 0, 
      error: null 
    });

    // Simulácia progress
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 15, 90)
      }));
    }, 200);

    try {
      const result = await uploadLectioFile(supabase, file, type);
      
      clearInterval(progressInterval);
      
      if (result.success) {
        updateState({
          isUploading: false,
          progress: 100,
          uploadedFiles: [...state.uploadedFiles, result]
        });
      } else {
        updateState({
          isUploading: false,
          progress: 0,
          error: result.error || 'Neznáma chyba pri uploade'
        });
      }

      return result;
    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba';
      
      updateState({
        isUploading: false,
        progress: 0,
        error: errorMessage
      });

      return {
        url: '',
        path: '',
        success: false,
        error: errorMessage
      };
    }
  }, [state.uploadedFiles, updateState]);

  const deleteFile = useCallback(async (
    supabase: SupabaseClient, 
    filePath: string
  ): Promise<boolean> => {
    try {
      const success = await deleteLectioFile(supabase, filePath);
      
      if (success) {
        updateState({
          uploadedFiles: state.uploadedFiles.filter(file => file.path !== filePath),
          error: null
        });
      } else {
        updateState({
          error: 'Nepodarilo sa vymazať súbor'
        });
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Chyba pri mazaní súboru';
      updateState({ error: errorMessage });
      return false;
    }
  }, [state.uploadedFiles, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFiles: []
    });
  }, []);

  const validateFileClient = useCallback((file: File, type: FileUploadType) => {
    return validateFile(file, type);
  }, []);

  return {
    ...state,
    uploadFile,
    deleteFile,
    clearError,
    resetState,
    validateFileClient
  };
};
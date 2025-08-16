"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import { 
  Play, Video, Headphones, FileText, Image as ImageIcon, 
  PlusCircle, Edit3, Trash2, GripVertical, ArrowLeft, Save,
  Clock, Eye, Volume2, Upload, X, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Globe, Calendar, Settings
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  lang: string;
  total_sessions: number;
  total_duration_minutes: number;
}

interface Session {
  id?: string;
  program_id: string;
  title: string;
  description?: string;
  session_order: number;
  duration_minutes: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SessionMedia {
  id?: string;
  session_id: string;
  media_type: 'video' | 'audio' | 'text' | 'image';
  title?: string;
  content: string;
  media_order: number;
  duration_minutes?: number;
  thumbnail_url?: string;
  file_size_mb?: number;
  is_published: boolean;
  created_at?: string;
}

type NotificationType = 'success' | 'error' | 'info';

const MEDIA_TYPE_OPTIONS = [
  { value: 'text', label: 'Text/HTML', icon: FileText, color: 'blue' },
  { value: 'video', label: 'Video', icon: Video, color: 'red' },
  { value: 'audio', label: 'Audio', icon: Volume2, color: 'green' },
  { value: 'image', label: 'Obrázok', icon: ImageIcon, color: 'purple' }
] as const;

// Interface pre SessionCard props - OPRAVENÝ
interface SessionCardProps {
  session: Session;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onToggleMedia: (sessionId: string) => void;
  showMedia: boolean;
  media: SessionMedia[];
  onMediaAction: (action: 'add' | 'edit' | 'delete', sessionId: string, mediaId?: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
  onMediaDragStart: (e: React.DragEvent, mediaId: string, sessionId: string) => void;
  onMediaDragOver: (e: React.DragEvent, targetOrder: number, sessionId: string) => void;
  onMediaDrop: (e: React.DragEvent, targetOrder: number, sessionId: string) => void;
  draggedMediaId: string | null;
  dragOverMediaIndex: number | null;
  draggingInSessionId: string | null;
}

// Notification komponenta
const Notification = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: NotificationType; 
  onClose: () => void; 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`}>
      <div className="flex items-start gap-3">
        <Icon size={20} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`animate-spin rounded-full border-2 border-indigo-600 border-t-transparent ${size === 4 ? 'w-4 h-4' : 'w-6 h-6'}`} />
);

// Session Edit Modal
const SessionEditModal = ({ 
  session, 
  onSave, 
  onClose,
  isNew = false
}: {
  session: Session | null;
  onSave: (sessionData: Partial<Session>) => void;
  onClose: () => void;
  isNew?: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<Session>>(
    session || {
      title: '',
      description: '',
      is_published: true
    }
  );

  if (!session && !isNew) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {isNew ? 'Pridať novú lekciu' : 'Upraviť lekciu'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Názov lekcie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Zadajte názov lekcie..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Popis lekcie
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Voliteľný popis lekcie..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.is_published || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Publikovať lekciu
            </label>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {isNew ? 'Vytvoriť lekciu' : 'Uložiť zmeny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Media Edit Modal
const MediaEditModal = ({ 
  media, 
  sessionId,
  onSave, 
  onClose,
  isNew = false
}: {
  media: SessionMedia | null;
  sessionId: string;
  onSave: (mediaData: Partial<SessionMedia>) => void;
  onClose: () => void;
  isNew?: boolean;
}) => {
  const { uploadFile, isUploading } = useFileUpload();
  const { supabase } = useSupabase();
  
  const [formData, setFormData] = useState<Partial<SessionMedia>>(
    media || {
      session_id: sessionId,
      media_type: 'text',
      title: '',
      content: '',
      is_published: true
    }
  );

  if (!media && !isNew) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileUpload = async (file: File, type: 'image' | 'audio' | 'video') => {
    try {
      const result = await uploadFile(supabase, file, type === 'image' ? 'image' : 'audio');
      if (result.success) {
        setFormData(prev => ({ ...prev, content: result.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {isNew ? 'Pridať nové médium' : 'Upraviť médium'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Typ média <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.media_type || 'text'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  media_type: e.target.value as SessionMedia['media_type'],
                  content: '' // reset content when changing type
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {MEDIA_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Názov média
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Názov média..."
              />
            </div>
          </div>
          
          {/* Content based on media type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.media_type === 'text' ? 'HTML Obsah' : 'URL Súboru'} <span className="text-red-500">*</span>
            </label>
            
            {formData.media_type === 'text' ? (
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
                placeholder="<p>HTML obsah...</p>"
                rows={8}
                required
              />
            ) : (
              <div className="space-y-4">
                <input
                  type="url"
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`https://example.com/${formData.media_type}.${formData.media_type === 'video' ? 'mp4' : formData.media_type === 'audio' ? 'mp3' : 'jpg'}`}
                  required
                />
                
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alebo nahrajte súbor
                  </label>
                  <input
                    type="file"
                    accept={
                      formData.media_type === 'video' ? 'video/*' :
                      formData.media_type === 'audio' ? 'audio/*' : 
                      'image/*'
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, formData.media_type as 'image' | 'audio' | 'video');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-sm text-indigo-600 mt-2">Nahrávam súbor...</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Duration for video/audio */}
          {(formData.media_type === 'video' || formData.media_type === 'audio') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dĺžka (minúty)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseFloat(e.target.value) || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="5.5"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.is_published || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Publikovať médium
            </label>
          </div>
          
          {/* Preview */}
          {formData.content && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Náhľad:</h4>
              {formData.media_type === 'text' ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              ) : formData.media_type === 'image' ? (
                <img src={formData.content} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
              ) : formData.media_type === 'video' ? (
                <video src={formData.content} controls className="max-w-xs max-h-32 rounded" />
              ) : (
                <audio src={formData.content} controls className="w-full max-w-xs" />
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isUploading ? 'Nahrávam...' : isNew ? 'Vytvoriť médium' : 'Uložiť zmeny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Drag and Drop Session komponenta
const SessionCard = ({ 
  session, 
  onEdit, 
  onDelete, 
  onToggleMedia,
  showMedia,
  media,
  onMediaAction,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex,
  onMediaDragStart,
  onMediaDragOver,
  onMediaDrop,
  draggedMediaId,
  dragOverMediaIndex,
  draggingInSessionId
}: SessionCardProps) => {
  const getMediaTypeInfo = (type: SessionMedia['media_type']) => {
    const option = MEDIA_TYPE_OPTIONS.find(opt => opt.value === type);
    return option || MEDIA_TYPE_OPTIONS[0];
  };

  const getMediaTypeColor = (color: string) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
      red: { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
      green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${dragOverIndex !== null ? 'border-indigo-400 shadow-xl' : 'border-gray-200'}`}
      draggable
      onDragStart={(e) => onDragStart(e, session.session_order)}
      onDragOver={(e) => onDragOver(e, session.session_order)}
      onDrop={(e) => onDrop(e, session.session_order)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Drag Handle */}
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600 cursor-grab">
              <GripVertical size={20} />
              <span className="text-lg font-bold text-indigo-600">
                {session.session_order}
              </span>
            </div>
            
            {/* Session Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                  session.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <Eye size={12} />
                  {session.is_published ? 'Publikované' : 'Koncept'}
                </span>
              </div>
              
              {session.description && (
                <p className="text-gray-600 mb-3">{session.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{session.duration_minutes}min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video size={14} />
                  <span>{media.length} médií</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleMedia(session.id!)}
              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
              title="Zobraziť médiá"
            >
              {showMedia ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button
              onClick={() => onEdit(session)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
              title="Upraviť lekciu"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => onDelete(session.id!)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
              title="Vymazať lekciu"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        {/* Media Section */}
        {showMedia && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Médiá v lekcii</h4>
              <button
                onClick={() => onMediaAction('add', session.id!)}
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                <PlusCircle size={16} className="mr-2" />
                Pridať médium
              </button>
            </div>
            
            {media.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Žiadne médiá v tejto lekcii</p>
                <p className="text-sm">Pridajte video, audio, text alebo obrázky</p>
              </div>
            ) : (
              <div className="space-y-3">
                {draggingInSessionId === session.id && (
                  <div className="text-xs text-indigo-600 font-medium mb-2 flex items-center gap-2">
                    <GripVertical size={12} />
                    Ťahaním zmeníte poradie médií v tejto lekcii
                  </div>
                )}
                {media
                  .sort((a, b) => a.media_order - b.media_order)
                  .map((mediaItem) => {
                    const typeInfo = getMediaTypeInfo(mediaItem.media_type);
                    const IconComponent = typeInfo.icon;
                    const colors = getMediaTypeColor(typeInfo.color);
                    const isMediaDragging = draggedMediaId === mediaItem.id;
                    const isMediaDragOver = draggingInSessionId === session.id && dragOverMediaIndex === mediaItem.media_order;
                    
                    return (
                      <div
                        key={mediaItem.id}
                        className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg border transition-all duration-200 ${
                          isMediaDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                        } ${isMediaDragOver ? 'border-indigo-400 shadow-lg' : 'border-gray-200'}`}
                        draggable
                        onDragStart={(e) => onMediaDragStart(e, mediaItem.id!, session.id!)}
                        onDragOver={(e) => onMediaDragOver(e, mediaItem.media_order, session.id!)}
                        onDrop={(e) => onMediaDrop(e, mediaItem.media_order, session.id!)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-grab">
                            <GripVertical size={14} />
                            <span className="text-sm font-medium text-gray-500">
                              {mediaItem.media_order}
                            </span>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                            <IconComponent size={16} className={colors.text} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {mediaItem.title || `${typeInfo.label} #${mediaItem.media_order}`}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                              {typeInfo.label}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {mediaItem.media_type === 'text' ? (
                              <span>HTML obsah</span>
                            ) : (
                              <>
                                <span className="truncate max-w-md inline-block">
                                  {mediaItem.content}
                                </span>
                                {mediaItem.duration_minutes && (
                                  <span className="ml-2">• {mediaItem.duration_minutes}min</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            mediaItem.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <Eye size={10} />
                            {mediaItem.is_published ? 'Pub' : 'Draft'}
                          </span>
                          
                          <button
                            onClick={() => onMediaAction('edit', session.id!, mediaItem.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Upraviť médium"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onMediaAction('delete', session.id!, mediaItem.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                            title="Vymazať médium"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function SessionsManagementPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  // State
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionMedia, setSessionMedia] = useState<Record<string, SessionMedia[]>>({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // UI State
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingMedia, setEditingMedia] = useState<{ media: SessionMedia | null; sessionId: string } | null>(null);
  const [isNewSession, setIsNewSession] = useState(false);
  const [isNewMedia, setIsNewMedia] = useState(false);

  // Drag and Drop State
  const [draggedSessionOrder, setDraggedSessionOrder] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null);
  const [dragOverMediaIndex, setDragOverMediaIndex] = useState<number | null>(null);
  const [draggingInSessionId, setDraggingInSessionId] = useState<string | null>(null);

  // Helper functions
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch data
  const fetchProgram = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("id, title, lang, total_sessions, total_duration_minutes")
        .eq("id", programId)
        .single();

      if (error) throw error;
      setProgram(data);
    } catch (error) {
      console.error('Program fetch error:', error);
      showNotification("Chyba pri načítavaní programu", "error");
    }
  }, [supabase, programId, showNotification]);

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("program_sessions")
        .select("*")
        .eq("program_id", programId)
        .order("session_order");

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Sessions fetch error:', error);
      showNotification("Chyba pri načítavaní lekcií", "error");
    }
  }, [supabase, programId, showNotification]);

  const fetchSessionMedia = useCallback(async (sessionIds: string[]) => {
    if (sessionIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("session_media")
        .select("*")
        .in("session_id", sessionIds)
        .order("media_order");

      if (error) throw error;
      
      // Group media by session_id
      const mediaBySession: Record<string, SessionMedia[]> = {};
      (data || []).forEach(media => {
        if (!mediaBySession[media.session_id]) {
          mediaBySession[media.session_id] = [];
        }
        mediaBySession[media.session_id].push(media);
      });
      
      setSessionMedia(mediaBySession);
    } catch (error) {
      console.error('Media fetch error:', error);
      showNotification("Chyba pri načítavaní médií", "error");
    }
  }, [supabase, showNotification]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProgram(), fetchSessions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProgram, fetchSessions]);

  // Fetch media when sessions change
  useEffect(() => {
    const sessionIds = sessions.map(s => s.id!).filter(Boolean);
    if (sessionIds.length > 0) {
      fetchSessionMedia(sessionIds);
    }
  }, [sessions, fetchSessionMedia]);

  // Session handlers
  const handleAddSession = () => {
    const newOrder = Math.max(...sessions.map(s => s.session_order), 0) + 1;
    setEditingSession({
      program_id: programId,
      title: '',
      description: '',
      session_order: newOrder,
      duration_minutes: 0,
      is_published: true
    });
    setIsNewSession(true);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsNewSession(false);
  };

  const handleSaveSession = async (sessionData: Partial<Session>) => {
    try {
      if (isNewSession) {
        const { data, error } = await supabase
          .from("program_sessions")
          .insert([sessionData])
          .select()
          .single();
        
        if (error) throw error;
        setSessions(prev => [...prev, data]);
        showNotification("Lekcia bola úspešne vytvorená", "success");
      } else {
        const { error } = await supabase
          .from("program_sessions")
          .update(sessionData)
          .eq("id", editingSession!.id);
        
        if (error) throw error;
        setSessions(prev => prev.map(s => 
          s.id === editingSession!.id ? { ...s, ...sessionData } : s
        ));
        showNotification("Lekcia bola úspešne aktualizovaná", "success");
      }
      
      setEditingSession(null);
      setIsNewSession(false);
      
      // Refresh program stats
      await fetchProgram();
    } catch (error) {
      console.error('Save session error:', error);
      showNotification("Chyba pri ukladaní lekcie", "error");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Naozaj chcete vymazať túto lekciu? Všetky médiá v nej budú tiež vymazané.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("program_sessions")
        .delete()
        .eq("id", sessionId);
      
      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setSessionMedia(prev => {
        const newMedia = { ...prev };
        delete newMedia[sessionId];
        return newMedia;
      });
      setExpandedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
      
      showNotification("Lekcia bola úspešne vymazaná", "success");
      await fetchProgram();
    } catch (error) {
      console.error('Delete session error:', error);
      showNotification("Chyba pri mazaní lekcie", "error");
    }
  };

  // Media handlers
  const handleMediaAction = (action: 'add' | 'edit' | 'delete', sessionId: string, mediaId?: string) => {
    if (action === 'add') {
      const existingMedia = sessionMedia[sessionId] || [];
      const newOrder = Math.max(...existingMedia.map(m => m.media_order), 0) + 1;
      setEditingMedia({
        media: {
          session_id: sessionId,
          media_type: 'text',
          title: '',
          content: '',
          media_order: newOrder,
          is_published: true
        },
        sessionId
      });
      setIsNewMedia(true);
    } else if (action === 'edit' && mediaId) {
      const media = sessionMedia[sessionId]?.find(m => m.id === mediaId);
      if (media) {
        setEditingMedia({ media, sessionId });
        setIsNewMedia(false);
      }
    } else if (action === 'delete' && mediaId) {
      handleDeleteMedia(mediaId, sessionId);
    }
  };

  const handleSaveMedia = async (mediaData: Partial<SessionMedia>) => {
    try {
      if (isNewMedia) {
        const { data, error } = await supabase
          .from("session_media")
          .insert([mediaData])
          .select()
          .single();
        
        if (error) throw error;
        
        setSessionMedia(prev => ({
          ...prev,
          [editingMedia!.sessionId]: [
            ...(prev[editingMedia!.sessionId] || []),
            data
          ]
        }));
        
        showNotification("Médium bolo úspešne vytvorené", "success");
      } else {
        const { error } = await supabase
          .from("session_media")
          .update(mediaData)
          .eq("id", editingMedia!.media!.id);
        
        if (error) throw error;
        
        setSessionMedia(prev => ({
          ...prev,
          [editingMedia!.sessionId]: prev[editingMedia!.sessionId].map(m => 
            m.id === editingMedia!.media!.id ? { ...m, ...mediaData } : m
          )
        }));
        
        showNotification("Médium bolo úspešne aktualizované", "success");
      }
      
      setEditingMedia(null);
      setIsNewMedia(false);
      
      // Refresh sessions to update duration
      await fetchSessions();
    } catch (error) {
      console.error('Save media error:', error);
      showNotification("Chyba pri ukladaní média", "error");
    }
  };

  const handleDeleteMedia = async (mediaId: string, sessionId: string) => {
    if (!confirm("Naozaj chcete vymazať toto médium?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("session_media")
        .delete()
        .eq("id", mediaId);
      
      if (error) throw error;
      
      setSessionMedia(prev => ({
        ...prev,
        [sessionId]: prev[sessionId].filter(m => m.id !== mediaId)
      }));
      
      showNotification("Médium bolo úspešne vymazané", "success");
      await fetchSessions();
    } catch (error) {
      console.error('Delete media error:', error);
      showNotification("Chyba pri mazaní média", "error");
    }
  };

  // Media Drag and Drop handlers
  const handleMediaDragStart = (e: React.DragEvent, mediaId: string, sessionId: string) => {
    setDraggedMediaId(mediaId);
    setDraggingInSessionId(sessionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMediaDragOver = (e: React.DragEvent, targetOrder: number, sessionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only show drop indicator if dragging within the same session
    if (draggingInSessionId === sessionId && draggedMediaId) {
      setDragOverMediaIndex(targetOrder);
    }
  };

  const handleMediaDrop = async (e: React.DragEvent, targetOrder: number, sessionId: string) => {
    e.preventDefault();
    
    // Only allow drop within the same session
    if (!draggedMediaId || draggingInSessionId !== sessionId) {
      setDraggedMediaId(null);
      setDragOverMediaIndex(null);
      setDraggingInSessionId(null);
      return;
    }

    const sessionMediaList = sessionMedia[sessionId] || [];
    const draggedMedia = sessionMediaList.find(m => m.id === draggedMediaId);
    
    if (!draggedMedia) {
      setDraggedMediaId(null);
      setDragOverMediaIndex(null);
      setDraggingInSessionId(null);
      return;
    }
    
    if (draggedMedia.media_order === targetOrder) {
      setDraggedMediaId(null);
      setDragOverMediaIndex(null);
      setDraggingInSessionId(null);
      return;
    }

    try {
      // Získajme aktuálny stav médií z databázy
      const { data: currentMedia, error: fetchError } = await supabase
        .from("session_media")
        .select("*")
        .eq("session_id", sessionId)
        .order("media_order");

      if (fetchError) {
        throw fetchError;
      }

      if (!currentMedia || currentMedia.length === 0) {
        throw new Error('No media found');
      }

      const draggedMediaFromDB = currentMedia.find(m => m.id === draggedMediaId);
      
      if (!draggedMediaFromDB) {
        throw new Error(`Media with id ${draggedMediaId} not found`);
      }

      // KROK 1: Presunieme všetky media na dočasné negatívne hodnoty
      for (let i = 0; i < currentMedia.length; i++) {
        const media = currentMedia[i];
        const tempOrder = -(i + 1); // Negatívne hodnoty: -1, -2, -3, atď.
        
        const { error } = await supabase
          .from("session_media")
          .update({ media_order: tempOrder })
          .eq("id", media.id);
        
        if (error) {
          throw error;
        }
        
        // Krátka pauza medzi updates
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      // KROK 2: Vytvoríme nové poradie
      const reorderedMedia = [...currentMedia];
      const draggedIndex = reorderedMedia.findIndex(m => m.id === draggedMediaFromDB.id);
      reorderedMedia.splice(draggedIndex, 1);
      const targetIndex = targetOrder - 1; // targetOrder je 1-based, array je 0-based
      reorderedMedia.splice(targetIndex, 0, draggedMediaFromDB);

      // KROK 3: Nastavíme finálne správne poradie
      for (let i = 0; i < reorderedMedia.length; i++) {
        const media = reorderedMedia[i];
        const newOrder = i + 1;
        
        const { data, error } = await supabase
          .from("session_media")
          .update({ media_order: newOrder })
          .eq("id", media.id)
          .select();
        
        if (error) {
          throw error;
        }
        
        // Krátka pauza medzi updates
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      
      showNotification("Poradie médií bolo úspešne zmenené", "success");
      
      // Refresh media for this session
      await fetchSessionMedia([sessionId]);
      
    } catch (error: any) {
      showNotification(`Chyba pri zmene poradia médií: ${error.message || 'Neznáma chyba'}`, "error");
      
      // V prípade chyby sa pokúsime obnoviť media
      await fetchSessionMedia([sessionId]);
    } finally {
      setDraggedMediaId(null);
      setDragOverMediaIndex(null);
      setDraggingInSessionId(null);
    }
  };

  // Session Drag and Drop handlers (IMPROVED VERSION)
  const handleDragStart = (e: React.DragEvent, sessionOrder: number) => {
    setDraggedSessionOrder(sessionOrder);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetOrder: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(targetOrder);
  };

  const handleDrop = async (e: React.DragEvent, targetOrder: number) => {
    e.preventDefault();
    
    if (draggedSessionOrder === null || draggedSessionOrder === targetOrder) {
      setDraggedSessionOrder(null);
      setDragOverIndex(null);
      return;
    }

    try {
      // Najprv si overíme aktuálny stav z databázy
      const { data: currentSessions, error: fetchError } = await supabase
        .from("program_sessions")
        .select("id, session_order, title, program_id")
        .eq("program_id", programId)
        .order("session_order");

      if (fetchError) {
        throw fetchError;
      }

      if (!currentSessions || currentSessions.length === 0) {
        throw new Error('No sessions found');
      }

      const draggedSession = currentSessions.find(s => s.session_order === draggedSessionOrder);
      
      if (!draggedSession) {
        throw new Error(`Session with order ${draggedSessionOrder} not found`);
      }

      // KROK 1: Presunieme všetky sessions na dočasné negatívne hodnoty aby sme sa vyhli unique constraint konfliktu
      for (let i = 0; i < currentSessions.length; i++) {
        const session = currentSessions[i];
        const tempOrder = -(i + 1); // Negatívne hodnoty: -1, -2, -3, atď.
        
        const { error } = await supabase
          .from("program_sessions")
          .update({ session_order: tempOrder })
          .eq("id", session.id);
        
        if (error) {
          throw error;
        }
        
        // Krátka pauza medzi updates
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      // KROK 2: Vytvoríme nové poradie
      const reorderedSessions = [...currentSessions];
      const draggedIndex = reorderedSessions.findIndex(s => s.id === draggedSession.id);
      reorderedSessions.splice(draggedIndex, 1);
      const targetIndex = targetOrder - 1;
      reorderedSessions.splice(targetIndex, 0, draggedSession);

      // KROK 3: Nastavíme finálne správne poradie
      for (let i = 0; i < reorderedSessions.length; i++) {
        const session = reorderedSessions[i];
        const newOrder = i + 1;
        
        const { data, error } = await supabase
          .from("program_sessions")
          .update({ session_order: newOrder })
          .eq("id", session.id)
          .select();
        
        if (error) {
          throw error;
        }
        
        // Krátka pauza medzi updates
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      
      showNotification("Poradie lekcií bolo úspešne zmenené", "success");
      
      // Obnovíme session data
      await fetchSessions();
      
    } catch (error: any) {
      showNotification(`Chyba pri zmene poradia: ${error.message || 'Neznáma chyba'}`, "error");
      
      // V prípade chyby sa pokúsime obnoviť sessions
      await fetchSessions();
    } finally {
      setDraggedSessionOrder(null);
      setDragOverIndex(null);
    }
  };

  const handleToggleMediaView = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <LoadingSpinner />
          <span className="text-gray-700 font-medium">Načítavam lekcie...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Program nenájdený
          </h2>
          <p className="text-gray-600 mb-4">Požadovaný program sa nenašiel v databáze.</p>
          <button
            onClick={() => router.push('/admin/programs')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Späť na zoznam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/programs')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Správa lekcií: {program.title}
                </h1>
                <p className="text-gray-600">
                  Spravujte lekcie a ich obsah pre tento program
                </p>
              </div>
            </div>
            
            {/* Program Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{program.total_sessions}</div>
                <div className="text-gray-500">Lekcií</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor(program.total_duration_minutes / 60)}h {program.total_duration_minutes % 60}m
                </div>
                <div className="text-gray-500">Celkom</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{program.lang.toUpperCase()}</div>
                <div className="text-gray-500">Jazyk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Play size={20} className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Lekcie programu ({sessions.length})
                </h3>
              </div>
              
              {sessions.length > 0 && (
                <div className="text-sm text-gray-600">
                  Ťahaním zmeníte poradie lekcií a médií
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/programs/${programId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Settings size={16} className="mr-2" />
                Upraviť program
              </button>
              
              <button
                onClick={handleAddSession}
                className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <PlusCircle size={16} className="mr-2" />
                Pridať lekciu
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Video size={64} className="mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Žiadne lekcie
              </h3>
              <p className="text-gray-600 mb-6">
                Tento program ešte neobsahuje žiadne lekcie. Pridajte prvú lekciu a začnite vytvárať obsah.
              </p>
              <button
                onClick={handleAddSession}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <PlusCircle size={20} className="mr-2" />
                Pridať prvú lekciu
              </button>
            </div>
          ) : (
            sessions
              .sort((a, b) => a.session_order - b.session_order)
              .map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={handleEditSession}
                  onDelete={handleDeleteSession}
                  onToggleMedia={handleToggleMediaView}
                  showMedia={expandedSessions.has(session.id!)}
                  media={sessionMedia[session.id!] || []}
                  onMediaAction={handleMediaAction}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedSessionOrder === session.session_order}
                  dragOverIndex={dragOverIndex}
                  onMediaDragStart={handleMediaDragStart}
                  onMediaDragOver={handleMediaDragOver}
                  onMediaDrop={handleMediaDrop}
                  draggedMediaId={draggedMediaId}
                  dragOverMediaIndex={dragOverMediaIndex}
                  draggingInSessionId={draggingInSessionId}
                />
              ))
          )}
        </div>

        {/* Modals */}
        {editingSession && (
          <SessionEditModal
            session={editingSession}
            onSave={handleSaveSession}
            onClose={() => {
              setEditingSession(null);
              setIsNewSession(false);
            }}
            isNew={isNewSession}
          />
        )}

        {editingMedia && (
          <MediaEditModal
            media={editingMedia.media}
            sessionId={editingMedia.sessionId}
            onSave={handleSaveMedia}
            onClose={() => {
              setEditingMedia(null);
              setIsNewMedia(false);
            }}
            isNew={isNewMedia}
          />
        )}
      </div>
    </div>
  );
}
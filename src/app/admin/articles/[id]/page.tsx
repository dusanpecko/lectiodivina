"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { 
  FileText, Type, Image, Video, MapPin, ExternalLink, Upload, Code,
  Plus, Trash2, GripVertical, Save, ArrowLeft, Settings, Tag, User,
  Calendar, Globe, Eye, Heart, X, CheckCircle, AlertCircle
} from "lucide-react";

interface Article {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  status: 'draft' | 'published' | 'archived';
  lang: 'sk' | 'cz' | 'en' | 'es';
  author_id: string;
  category_id: number;
  tags: string[];
  seo_title: string;
  seo_description: string;
  view_count: number;
  like_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'address' | 'button' | 'source';
  position: number;
  data: any;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

type NotificationType = 'success' | 'error' | 'info';

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Návrh", color: "bg-gray-100 text-gray-800", icon: "📝" },
  { value: "published", label: "Publikované", color: "bg-green-100 text-green-800", icon: "✅" },
  { value: "archived", label: "Archivované", color: "bg-red-100 text-red-800", icon: "📦" },
];

const BLOCK_TYPES = [
  { type: 'text', label: 'Text blok', icon: Type, color: 'blue', description: 'Formátovaný text s nadpisom' },
  { type: 'image', label: 'Obrázok', icon: Image, color: 'green', description: 'Galéria obrázkov' },
  { type: 'video', label: 'Video', icon: Video, color: 'purple', description: 'YouTube, Vimeo alebo vlastné video' },
  { type: 'address', label: 'Adresa', icon: MapPin, color: 'red', description: 'Mapa a kontaktné údaje' },
  { type: 'button', label: 'Tlačítko', icon: ExternalLink, color: 'orange', description: 'Akčné tlačítko s odkazom' },
  { type: 'source', label: 'Zdrojový kód', icon: Code, color: 'gray', description: 'HTML, iframe, embed kód' },
];

// Notification komponenta
const Notification = ({ message, type, onClose }: { 
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
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
);

// Text Block Component
const TextBlock = ({ block, updateBlock, deleteBlock }: {
  block: Block;
  updateBlock: (id: string, data: any) => void;
  deleteBlock: (id: string) => void;
}) => {
  const [content, setContent] = useState(block.data.content || '');
  const [heading, setHeading] = useState(block.data.heading || '');
  const editorRef = useRef<HTMLDivElement>(null);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      updateBlock(block.id, { ...block.data, content: editorRef.current.innerHTML });
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      updateBlock(block.id, { ...block.data, content: newContent });
    }
  };

  const handleHeadingChange = (newHeading: string) => {
    setHeading(newHeading);
    updateBlock(block.id, { ...block.data, heading: newHeading });
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Type className="w-5 h-5 text-blue-600" />
          <span className="font-semibold">Text blok</span>
        </div>
        <button onClick={() => deleteBlock(block.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nadpis (voliteľné)</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => handleHeadingChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Nadpis sekcie..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Obsah</label>
          
          {/* Toolbar */}
          <div className="border border-b-0 rounded-t-lg bg-gray-50 p-2 flex gap-2 flex-wrap">
            <button type="button" onClick={() => formatText('bold')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => formatText('italic')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
              <em>I</em>
            </button>
            <button type="button" onClick={() => formatText('underline')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
              <u>U</u>
            </button>
            <div className="w-px bg-gray-300 mx-1" />
            <button type="button" onClick={() => formatText('justifyLeft')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">←</button>
            <button type="button" onClick={() => formatText('justifyCenter')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">↔</button>
            <button type="button" onClick={() => formatText('justifyRight')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">→</button>
            <div className="w-px bg-gray-300 mx-1" />
            <button type="button" onClick={() => formatText('insertUnorderedList')} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">• List</button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="border border-t-0 rounded-b-lg p-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ minHeight: '120px' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Zarovnanie</label>
            <select
              value={block.data.alignment || 'left'}
              onChange={(e) => updateBlock(block.id, { ...block.data, alignment: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="left">Vľavo</option>
              <option value="center">Na stred</option>
              <option value="right">Vpravo</option>
              <option value="justify">Do bloku</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Veľkosť textu</label>
            <select
              value={block.data.size || 'medium'}
              onChange={(e) => updateBlock(block.id, { ...block.data, size: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="small">Malý</option>
              <option value="medium">Stredný</option>
              <option value="large">Veľký</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Block Component
const ImageBlock = ({ block, updateBlock, deleteBlock }: {
  block: Block;
  updateBlock: (id: string, data: any) => void;
  deleteBlock: (id: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    updateBlock(block.id, {
      ...block.data,
      images: [...(block.data.images || []), ...imageUrls]
    });
  };

  const removeImage = (index: number) => {
    const newImages = (block.data.images || []).filter((_: any, i: number) => i !== index);
    updateBlock(block.id, { ...block.data, images: newImages });
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Image className="w-5 h-5 text-green-600" />
          <span className="font-semibold">Obrázok</span>
        </div>
        <button onClick={() => deleteBlock(block.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Popis</label>
          <input
            type="text"
            value={block.data.description || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="Popis galérie..."
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <span className="text-gray-600">Kliknite pre pridanie obrázkov</span>
        </button>

        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />

        {block.data.images && block.data.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {block.data.images.map((img: string, index: number) => (
              <div key={index} className="relative group">
                <img src={img} alt="" className="w-full h-20 object-cover rounded" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Video Block Component
const VideoBlock = ({ block, updateBlock, deleteBlock }: {
  block: Block;
  updateBlock: (id: string, data: any) => void;
  deleteBlock: (id: string) => void;
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Video className="w-5 h-5 text-purple-600" />
          <span className="font-semibold">Video</span>
        </div>
        <button onClick={() => deleteBlock(block.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Typ videa</label>
          <select
            value={block.data.type || 'youtube'}
            onChange={(e) => updateBlock(block.id, { ...block.data, type: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="upload">Vlastné video</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL videa</label>
          <input
            type="url"
            value={block.data.url || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Názov</label>
          <input
            type="text"
            value={block.data.title || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, title: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="Názov videa..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Popis</label>
          <textarea
            value={block.data.description || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, description: e.target.value })}
            className="w-full p-2 border rounded-lg h-20 resize-none"
            placeholder="Popis videa..."
          />
        </div>
      </div>
    </div>
  );
};

// Address Block Component  
const AddressBlock = ({ block, updateBlock, deleteBlock }: {
  block: Block;
  updateBlock: (id: string, data: any) => void;
  deleteBlock: (id: string) => void;
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <MapPin className="w-5 h-5 text-red-600" />
          <span className="font-semibold">Adresa</span>
        </div>
        <button onClick={() => deleteBlock(block.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Názov miesta</label>
          <input
            type="text"
            value={block.data.name || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, name: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="napr. Katedrála sv. Martina"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Adresa</label>
          <textarea
            value={block.data.address || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, address: e.target.value })}
            className="w-full p-2 border rounded-lg h-20 resize-none"
            placeholder="Úplná adresa..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={block.data.latitude || ''}
              onChange={(e) => updateBlock(block.id, { ...block.data, latitude: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="49.2232"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={block.data.longitude || ''}
              onChange={(e) => updateBlock(block.id, { ...block.data, longitude: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="18.7396"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Telefón</label>
            <input
              type="tel"
              value={block.data.phone || ''}
              onChange={(e) => updateBlock(block.id, { ...block.data, phone: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="+421 123 456 789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Web stránka</label>
            <input
              type="url"
              value={block.data.website || ''}
              onChange={(e) => updateBlock(block.id, { ...block.data, website: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.data.showAddress || false}
              onChange={(e) => updateBlock(block.id, { ...block.data, showAddress: e.target.checked })}
            />
            Zobraziť adresu
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.data.showDirections || false}
              onChange={(e) => updateBlock(block.id, { ...block.data, showDirections: e.target.checked })}
            />
            Zobraziť navigáciu
          </label>
        </div>
      </div>
    </div>
  );
};

// Button Block Component
const ButtonBlock = ({ block, updateBlock, deleteBlock }: {
  block: Block;
  updateBlock: (id: string, data: any) => void;
  deleteBlock: (id: string) => void;
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <ExternalLink className="w-5 h-5 text-orange-600" />
          <span className="font-semibold">Tlačítko</span>
        </div>
        <button onClick={() => deleteBlock(block.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Text tlačítka</label>
          <input
            type="text"
            value={block.data.label || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, label: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="napr. Prečítať viac"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL odkaz</label>
          <input
            type="url"
            value={block.data.url || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Štýl</label>
            <select
              value={block.data.style || 'primary'}
              onChange={(e) => updateBlock(block.id, { ...block.data, style: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="primary">Primárny</option>
              <option value="secondary">Sekundárny</option>
              <option value="outline">Obrys</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cieľ</label>
            <select
              value={block.data.target || '_self'}
              onChange={(e) => updateBlock(block.id, { ...block.data, target: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="_self">Rovnaká stránka</option>
              <option value="_blank">Nová stránka</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Source Block Component
const SourceBlock = ({ block, updateBlock, deleteBlock }: {
  block: Block;
  updateBlock: (id: string, data: any) => void;
  deleteBlock: (id: string) => void;
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Code className="w-5 h-5 text-gray-600" />
          <span className="font-semibold">Zdrojový kód</span>
        </div>
        <button onClick={() => deleteBlock(block.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">HTML/Embed kód</label>
          <textarea
            value={block.data.code || ''}
            onChange={(e) => updateBlock(block.id, { ...block.data, code: e.target.value })}
            className="w-full p-3 border rounded-lg h-32 resize-none font-mono text-sm"
            placeholder="<iframe src='...'></iframe>"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Výška (px)</label>
          <input
            type="number"
            value={block.data.height || '400'}
            onChange={(e) => updateBlock(block.id, { ...block.data, height: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="400"
            min="100"
            max="1000"
          />
        </div>
      </div>
    </div>
  );
};

export default function ArticleEditor() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const isNew = id === "new";

  // State
  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("content");

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          supabase.from("article_categories").select("id, name, color"),
          supabase.from("users").select("id, full_name").eq("role", "admin")
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (authorsRes.data) setAuthors(authorsRes.data);
      } catch (error) {
        console.error('Metadata fetch error:', error);
      }
    };

    fetchMetadata();
  }, [supabase]);

  // Fetch article and blocks
  useEffect(() => {
    if (isNew) {
      setArticle({
        title: "",
        slug: "",
        excerpt: "",
        featured_image: "",
        status: "draft",
        lang: appLang,
        author_id: "",
        category_id: categories[0]?.id || 0,
        tags: [],
        seo_title: "",
        seo_description: "",
        view_count: 0,
        like_count: 0,
        published_at: "",
        created_at: "",
        updated_at: "",
      });
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      setLoading(true);
      try {
        // Fetch article
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .single();

        if (articleError) throw articleError;

        // Fetch blocks
        const { data: blocksData, error: blocksError } = await supabase
          .from("article_blocks")
          .select("*")
          .eq("article_id", id)
          .order("position");

        if (blocksError) throw blocksError;

        setArticle(articleData);
        setBlocks(blocksData.map(block => ({
          id: block.id.toString(),
          type: block.type,
          position: block.position,
          data: block.data
        })));

      } catch (error) {
        console.error('Fetch error:', error);
        showNotification("Chyba pri načítavaní článku", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, supabase, isNew, appLang, categories, showNotification]);

  // Block management
  const addBlock = useCallback((type: string) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: type as any,
      position: blocks.length,
      data: {}
    };
    setBlocks(prev => [...prev, newBlock]);
  }, [blocks.length]);

  const updateBlock = useCallback((blockId: string, data: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, data } : block
    ));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  }, []);

  // Save article
  const handleSave = async () => {
    if (!article) return;

    setSaving(true);
    try {
      if (isNew) {
        // Create article
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .insert([{
            ...article,
            author_id: authors[0]?.id || null
          }])
          .select("id")
          .single();

        if (articleError) throw articleError;

        // Create blocks
        const blocksToInsert = blocks.map(block => ({
          article_id: articleData.id,
          type: block.type,
          position: block.position,
          data: block.data
        }));

        if (blocksToInsert.length > 0) {
          const { error: blocksError } = await supabase
            .from("article_blocks")
            .insert(blocksToInsert);

          if (blocksError) throw blocksError;
        }

        showNotification("Článok bol úspešne vytvorený", "success");
        router.replace(`/admin/articles/${articleData.id}`);

      } else {
        // Update article
        const { error: articleError } = await supabase
          .from("articles")
          .update(article)
          .eq("id", id);

        if (articleError) throw articleError;

        // Delete existing blocks
        await supabase
          .from("article_blocks")
          .delete()
          .eq("article_id", id);

        // Insert new blocks
        const blocksToInsert = blocks.map(block => ({
          article_id: parseInt(id),
          type: block.type,
          position: block.position,
          data: block.data
        }));

        if (blocksToInsert.length > 0) {
          const { error: blocksError } = await supabase
            .from("article_blocks")
            .insert(blocksToInsert);

          if (blocksError) throw blocksError;
        }

        showNotification("Článok bol úspešne uložený", "success");
      }

    } catch (error) {
      console.error('Save error:', error);
      showNotification("Chyba pri ukladaní článku", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderBlock = (block: Block) => {
    const props = { block, updateBlock, deleteBlock };
    
    switch (block.type) {
      case 'text':
        return <TextBlock key={block.id} {...props} />;
      case 'image':
        return <ImageBlock key={block.id} {...props} />;
      case 'video':
        return <VideoBlock key={block.id} {...props} />;
      case 'address':
        return <AddressBlock key={block.id} {...props} />;
      case 'button':
        return <ButtonBlock key={block.id} {...props} />;
      case 'source':
        return <SourceBlock key={block.id} {...props} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <LoadingSpinner />
          <span className="text-gray-700 font-medium">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Článok nenájdený</h2>
          <p className="text-gray-600">Požadovaný článok sa nenašiel v databáze.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "content", label: "Obsah a bloky", icon: "📝" },
    { id: "settings", label: "Nastavenia článku", icon: "⚙️" },
    { id: "seo", label: "SEO a publikovanie", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/articles")}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isNew ? "Nový článok" : `Editovať: ${article.title}`}
                </h1>
                <p className="text-gray-600">
                  {isNew ? "Vytvorte nový článok s blokovým editorom" : "Upravte existujúci článok"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {blocks.length} blokov
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size={4} />
                    Ukladám...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Uložiť
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar s blokmi */}
          {activeTab === "content" && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h3 className="font-semibold mb-4 text-gray-800">Pridať bloky</h3>
                
                <div className="space-y-2">
                  {BLOCK_TYPES.map(blockType => {
                    const IconComponent = blockType.icon;
                    return (
                      <button
                        key={blockType.type}
                        onClick={() => addBlock(blockType.type)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={`w-5 h-5 text-${blockType.color}-600 mt-0.5`} />
                          <div>
                            <div className="font-medium text-sm">{blockType.label}</div>
                            <div className="text-xs text-gray-600">{blockType.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={activeTab === "content" ? "lg:col-span-3" : "lg:col-span-4"}>
            
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-6">
                {/* Basic Article Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Základné informácie</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Názov článku *</label>
                      <input
                        type="text"
                        value={article.title}
                        onChange={(e) => setArticle(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg text-lg font-medium"
                        placeholder="Zadajte názov článku..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Perex</label>
                      <textarea
                        value={article.excerpt}
                        onChange={(e) => setArticle(prev => prev ? {...prev, excerpt: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg h-20 resize-none"
                        placeholder="Krátky popis článku..."
                      />
                    </div>
                  </div>
                </div>

                {/* Blocks */}
                {blocks.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Začnite vytvárať obsah</h3>
                    <p className="text-gray-600 mb-4">Pridajte váš prvý blok z bočného panelu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <div key={block.id}>
                        {renderBlock(block)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings size={20} />
                    Nastavenia článku
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kategória</label>
                      <select
                        value={article.category_id}
                        onChange={(e) => setArticle(prev => prev ? {...prev, category_id: parseInt(e.target.value)} : null)}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Vyberte kategóriu</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Jazyk</label>
                      <select
                        value={article.lang}
                        onChange={(e) => setArticle(prev => prev ? {...prev, lang: e.target.value as any} : null)}
                        className="w-full p-3 border rounded-lg"
                      >
                        {LANGUAGE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.flag} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Tagy</label>
                      <input
                        type="text"
                        value={article.tags?.join(', ') || ''}
                        onChange={(e) => setArticle(prev => prev ? {
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        } : null)}
                        className="w-full p-3 border rounded-lg"
                        placeholder="duchovnosť, modlitba, meditation (oddelené čiarkami)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Hlavný obrázok (URL)</label>
                      <input
                        type="url"
                        value={article.featured_image}
                        onChange={(e) => setArticle(prev => prev ? {...prev, featured_image: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    🔍 SEO optimalizácia
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SEO títok</label>
                      <input
                        type="text"
                        value={article.seo_title}
                        onChange={(e) => setArticle(prev => prev ? {...prev, seo_title: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg"
                        placeholder="Optimalizovaný títok pre vyhľadávače..."
                        maxLength={60}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {article.seo_title.length}/60 znakov
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">SEO popis</label>
                      <textarea
                        value={article.seo_description}
                        onChange={(e) => setArticle(prev => prev ? {...prev, seo_description: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg h-20 resize-none"
                        placeholder="Popis pre vyhľadávače..."
                        maxLength={160}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {article.seo_description.length}/160 znakov
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">URL slug</label>
                      <input
                        type="text"
                        value={article.slug}
                        onChange={(e) => setArticle(prev => prev ? {...prev, slug: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg"
                        placeholder="url-slug-clanku"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📅 Publikovanie
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Stav článku</label>
                      <select
                        value={article.status}
                        onChange={(e) => setArticle(prev => prev ? {...prev, status: e.target.value as any} : null)}
                        className="w-full p-3 border rounded-lg"
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.icon} {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Dátum publikovania</label>
                      <input
                        type="datetime-local"
                        value={article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setArticle(prev => prev ? {...prev, published_at: e.target.value} : null)}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                  </div>

                  {!isNew && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                          <Eye size={20} />
                          {article.view_count}
                        </div>
                        <div className="text-sm text-gray-500">Zobrazenia</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                          <Heart size={20} />
                          {article.like_count}
                        </div>
                        <div className="text-sm text-gray-500">Lajky</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {blocks.length}
                        </div>
                        <div className="text-sm text-gray-500">Bloky</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
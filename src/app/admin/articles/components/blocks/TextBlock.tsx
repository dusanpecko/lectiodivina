"use client";

import { useState, useRef, useEffect } from "react";
import { Type, Trash2, GripVertical, Upload, X } from "lucide-react";

interface TextBlockData {
  heading?: string;
  content?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  size?: 'small' | 'medium' | 'large';
  image?: string;
  imagePosition?: 'before' | 'after';
}

interface Block {
  id: string;
  type: string;
  position: number;
  data: TextBlockData;
}

interface TextBlockProps {
  block: Block;
  updateBlock: (id: string, data: TextBlockData) => void;
  deleteBlock: (id: string) => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, updateBlock, deleteBlock }) => {
  const [content, setContent] = useState(block.data.content || '');
  const [heading, setHeading] = useState(block.data.heading || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      updateBlock(block.id, { ...block.data, content: newContent });
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      updateBlock(block.id, { ...block.data, image: imageUrl });
    }
  };

  const removeImage = () => {
    updateBlock(block.id, { ...block.data, image: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toolbarButtons = [
    { command: 'bold', label: 'B', style: 'font-bold' },
    { command: 'italic', label: 'I', style: 'italic' },
    { command: 'underline', label: 'U', style: 'underline' },
    { command: 'separator' },
    { command: 'justifyLeft', label: '←', title: 'Zarovnať vľavo' },
    { command: 'justifyCenter', label: '↔', title: 'Zarovnať na stred' },
    { command: 'justifyRight', label: '→', title: 'Zarovnať vpravo' },
    { command: 'separator' },
    { command: 'insertUnorderedList', label: '• List', title: 'Zoznam s odrážkami' },
    { command: 'insertOrderedList', label: '1. List', title: 'Číslovaný zoznam' },
    { command: 'separator' },
    { command: 'createLink', label: '🔗', title: 'Pridať odkaz' },
  ];

  const handleLinkCommand = () => {
    const url = prompt('Zadajte URL odkazu:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const executeCommand = (command: string) => {
    if (command === 'createLink') {
      handleLinkCommand();
    } else {
      formatText(command);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Type className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">Text blok</span>
        </div>
        <button
          onClick={() => deleteBlock(block.id)}
          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
          title="Vymazať blok"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Heading Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Nadpis (voliteľné)
          </label>
          <input
            type="text"
            value={heading}
            onChange={(e) => handleHeadingChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Nadpis sekcie..."
          />
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Obsah
          </label>
          
          {/* Toolbar */}
          <div className="border border-b-0 rounded-t-lg bg-gray-50 p-2 flex gap-1 flex-wrap">
            {toolbarButtons.map((button, index) => {
              if (button.command === 'separator') {
                return <div key={index} className="w-px bg-gray-300 mx-1" />;
              }

              return (
                <button
                  key={button.command}
                  type="button"
                  onClick={() => executeCommand(button.command)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-200 transition-colors"
                  title={button.title}
                >
                  <span className={button.style}>{button.label}</span>
                </button>
              );
            })}
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onPaste={handlePaste}
            className="border border-t-0 rounded-b-lg p-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            style={{ minHeight: '120px' }}
            data-placeholder="Začnite písať váš obsah..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Obrázok (voliteľné)
          </label>
          
          {!block.data.image ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center gap-2"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-gray-600 text-sm">Kliknite pre pridanie obrázka</span>
            </button>
          ) : (
            <div className="relative inline-block">
              <img 
                src={block.data.image} 
                alt="Block image" 
                className="max-w-full h-40 object-cover rounded-lg border"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Image Position */}
          {block.data.image && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Pozícia obrázka
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateBlock(block.id, { ...block.data, imagePosition: 'before' })}
                  className={`px-3 py-2 border rounded text-sm transition-colors ${
                    block.data.imagePosition === 'before' || !block.data.imagePosition
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Pred textom
                </button>
                <button
                  onClick={() => updateBlock(block.id, { ...block.data, imagePosition: 'after' })}
                  className={`px-3 py-2 border rounded text-sm transition-colors ${
                    block.data.imagePosition === 'after'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Za textom
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Zarovnanie textu
            </label>
            <select
              value={block.data.alignment || 'left'}
              onChange={(e) => updateBlock(block.id, { 
                ...block.data, 
                alignment: e.target.value as TextBlockData['alignment']
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="left">Vľavo</option>
              <option value="center">Na stred</option>
              <option value="right">Vpravo</option>
              <option value="justify">Do bloku</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Veľkosť textu
            </label>
            <select
              value={block.data.size || 'medium'}
              onChange={(e) => updateBlock(block.id, { 
                ...block.data, 
                size: e.target.value as TextBlockData['size']
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Malý</option>
              <option value="medium">Stredný</option>
              <option value="large">Veľký</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        {(heading || content) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm font-medium text-gray-700 mb-2">Náhľad:</div>
            <div 
              className={`
                ${block.data.alignment === 'center' ? 'text-center' : ''}
                ${block.data.alignment === 'right' ? 'text-right' : ''}
                ${block.data.alignment === 'justify' ? 'text-justify' : ''}
                ${block.data.size === 'small' ? 'text-sm' : ''}
                ${block.data.size === 'large' ? 'text-lg' : ''}
              `}
            >
              {heading && (
                <h3 className="font-semibold mb-2 text-gray-900">
                  {heading}
                </h3>
              )}
              {block.data.image && block.data.imagePosition === 'before' && (
                <img 
                  src={block.data.image} 
                  alt="" 
                  className="mb-3 max-w-full h-32 object-cover rounded"
                />
              )}
              {content && (
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
              {block.data.image && block.data.imagePosition === 'after' && (
                <img 
                  src={block.data.image} 
                  alt="" 
                  className="mt-3 max-w-full h-32 object-cover rounded"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextBlock;
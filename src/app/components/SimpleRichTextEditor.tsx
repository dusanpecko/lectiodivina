"use client";

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Youtube } from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, Heading1, Heading2,
  Heading3, Image as ImageIcon, Italic, Link2,
  LinkIcon, List, ListOrdered, Minus,
  Plus, Quote, Redo,
  Strikethrough,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Table as TableIcon, Trash2, Type,
  Underline as UnderlineIcon,
  Undo, Video, X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SimpleRichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
}

export default function SimpleRichTextEditor({
  label,
  value,
  onChange,
  disabled = false,
  minHeight = '200px',
  className = ''
}: SimpleRichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFloat, setImageFloat] = useState<'none' | 'left' | 'right'>('none');
  const [imageWidth, setImageWidth] = useState<string>('');
  const [imageHeight, setImageHeight] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoWidth, setVideoWidth] = useState<string>('640');
  const [videoHeight, setVideoHeight] = useState<string>('480');

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues in Next.js
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        code: false, // Zakázať code blocks
        codeBlock: false,
      }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'editor-video',
        },
      }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Ak je obsah prázdny paragraph, vráť prázdny string
      if (html === '<p></p>') {
        onChange('');
      } else {
        onChange(html);
      }
    },
  });

  // Sync external value changes to editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className={className}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="animate-pulse text-gray-400">Načítavam editor...</div>
        </div>
      </div>
    );
  }

  const ToolbarButton = ({ 
    onClick, 
    active, 
    icon: Icon, 
    title,
    disabled: buttonDisabled = false
  }: { 
    onClick: () => void; 
    active?: boolean; 
    icon: React.ComponentType<{ size?: number; className?: string }>; 
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || buttonDisabled}
      className={`
        p-2 rounded transition-colors
        ${active 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-600 hover:bg-gray-100'
        }
        ${(disabled || buttonDisabled) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  // Získaj plain text pre počítadlo slov
  const plainText = editor.getText();
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-1 flex-wrap items-center">
          {/* Nadpisy */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              icon={Heading1}
              title="Nadpis 1"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              icon={Heading2}
              title="Nadpis 2"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              icon={Heading3}
              title="Nadpis 3"
            />
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Formátovanie textu */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              icon={Bold}
              title="Tučné (Ctrl+B)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              icon={Italic}
              title="Kurzíva (Ctrl+I)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              icon={UnderlineIcon}
              title="Podčiarknuté (Ctrl+U)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              icon={Strikethrough}
              title="Prečiarknuté"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              active={editor.isActive('subscript')}
              icon={SubscriptIcon}
              title="Dolný index (H₂O)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              active={editor.isActive('superscript')}
              icon={SuperscriptIcon}
              title="Horný index (x²)"
            />
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Zoznamy */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              icon={List}
              title="Odrážky"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              icon={ListOrdered}
              title="Číslovaný zoznam"
            />
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Zarovnanie */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              icon={AlignLeft}
              title="Zarovnať vľavo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              icon={AlignCenter}
              title="Zarovnať na stred"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              icon={AlignRight}
              title="Zarovnať vpravo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              active={editor.isActive({ textAlign: 'justify' })}
              icon={AlignJustify}
              title="Zarovnať do bloku"
            />
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Špeciálne */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              icon={Quote}
              title="Citácia"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              icon={Minus}
              title="Horizontálna čiara"
            />
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('URL adresa:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              active={editor.isActive('link')}
              icon={LinkIcon}
              title="Pridať odkaz"
            />
            <ToolbarButton
              onClick={() => setShowImageDialog(true)}
              icon={ImageIcon}
              title="Vložiť obrázok"
            />
            <ToolbarButton
              onClick={() => setShowVideoDialog(true)}
              icon={Video}
              title="Vložiť video"
            />
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Tabuľka */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              icon={TableIcon}
              title="Vložiť tabuľku"
            />
            {editor.isActive('table') && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  icon={Plus}
                  title="Pridať stĺpec vľavo"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  icon={Plus}
                  title="Pridať stĺpec vpravo"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  icon={X}
                  title="Odstrániť stĺpec"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  icon={Plus}
                  title="Pridať riadok hore"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  icon={Plus}
                  title="Pridať riadok dole"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  icon={X}
                  title="Odstrániť riadok"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  icon={Trash2}
                  title="Odstrániť tabuľku"
                />
              </>
            )}
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              icon={Undo}
              title="Späť (Ctrl+Z)"
              disabled={!editor.can().undo()}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              icon={Redo}
              title="Dopredu (Ctrl+Y)"
              disabled={!editor.can().redo()}
            />
          </div>

          {/* Utility buttons */}
          <div className="ml-auto flex items-center gap-2">
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1"
                title="Odstrániť odkaz z vybraného textu"
              >
                <Link2 size={14} />
                Zrušiť link
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().clearNodes().unsetAllMarks().run();
              }}
              className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded flex items-center gap-1"
              title="Odstrániť formátovanie z vybraného textu"
            >
              <Type size={14} />
              Vyčistiť
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Naozaj chcete vymazať celý obsah?')) {
                  editor.commands.clearContent();
                  onChange('');
                }
              }}
              className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center gap-1"
              title="Vymazať celý obsah editora"
              disabled={!plainText}
            >
              <Trash2 size={14} />
              Vymazať
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <EditorContent 
          editor={editor}
          className="simple-rich-editor"
          style={{ minHeight }}
        />
        
        {/* Info bar */}
        <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-600 flex justify-between items-center">
          <span>
            {charCount > 0 && `${charCount} znakov`}
            {charCount > 0 && wordCount > 0 && ' • '}
            {wordCount > 0 && `${wordCount} slov`}
          </span>
          {disabled && (
            <span className="text-gray-400 italic">Iba na čítanie</span>
          )}
        </div>
      </div>

      {/* Placeholder help */}
      {!plainText && (
        <div className="text-xs text-gray-500">
          💡 Tip: Použite <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+B</kbd> pre tučné, 
          <kbd className="px-1 py-0.5 bg-gray-100 rounded ml-1">Ctrl+I</kbd> pre kurzívu
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Vložiť obrázok</h3>
            
            <div className="space-y-4">
              {/* Toggle between URL and Upload */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    uploadMethod === 'url'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔗 URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    uploadMethod === 'upload'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📤 Upload
                </button>
              </div>

              {uploadMethod === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL adresa obrázka
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nahrať obrázok
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploading(true);
                      setUploadError(null);

                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('bucket', 'task-images'); // Použiť existujúci bucket

                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData,
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          setUploadError(data.error || 'Upload failed');
                          console.error('Upload error:', data);
                          return;
                        }

                        setImageUrl(data.url);
                      } catch (error) {
                        setUploadError('Chyba pri nahrávaní obrázka');
                        console.error('Upload error:', error);
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-2">📤 Nahrávam...</p>
                  )}
                  {uploadError && (
                    <p className="text-sm text-red-600 mt-2">❌ {uploadError}</p>
                  )}
                  {imageUrl && !uploading && (
                    <p className="text-sm text-green-600 mt-2">✅ Obrázok nahraný</p>
                  )}
                </div>
              )}

              {/* Rozmery obrázka */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rozmery (voliteľné)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(e.target.value)}
                      placeholder="Šírka (napr. 300px alebo 50%)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(e.target.value)}
                      placeholder="Výška (napr. 200px alebo auto)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nechaj prázdne pre pôvodné rozmery
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obtekanie textu
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageFloat('none')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      imageFloat === 'none'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Žiadne
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFloat('left')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      imageFloat === 'left'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Vľavo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFloat('right')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      imageFloat === 'right'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Vpravo
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Obtekanie umožňuje text okolo obrázka
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (imageUrl) {
                    // Pridať obrázok
                    editor.chain().focus().setImage({ 
                      src: imageUrl,
                    }).run();
                    
                    // Nastaviť vlastnosti (float, rozmery)
                    setTimeout(() => {
                      const { state } = editor;
                      const { tr } = state;
                      const pos = state.selection.$anchor.pos;
                      
                      // Nájdi image node
                      state.doc.nodesBetween(pos - 1, pos + 1, (node, nodePos) => {
                        if (node.type.name === 'image') {
                          // Zostaviť style string
                          const styles: string[] = [];
                          
                          if (imageWidth) {
                            styles.push(`width: ${imageWidth}`);
                          }
                          if (imageHeight) {
                            styles.push(`height: ${imageHeight}`);
                          }
                          if (imageFloat !== 'none') {
                            styles.push(`float: ${imageFloat}`);
                            styles.push(`margin: 0 ${imageFloat === 'left' ? '1rem 1rem 0' : '0 1rem 1rem'}`);
                          }
                          
                          const className = imageFloat !== 'none' 
                            ? `editor-image float-${imageFloat}` 
                            : 'editor-image';
                          
                          tr.setNodeMarkup(nodePos, undefined, {
                            ...node.attrs,
                            class: className,
                            style: styles.length > 0 ? styles.join('; ') : undefined,
                            width: imageWidth || undefined,
                            height: imageHeight || undefined,
                          });
                        }
                      });
                      
                      editor.view.dispatch(tr);
                    }, 10);
                  }
                  setShowImageDialog(false);
                  setImageUrl('');
                  setImageFloat('none');
                  setImageWidth('');
                  setImageHeight('');
                }}
                disabled={!imageUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Vložiť
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                  setImageFloat('none');
                  setImageWidth('');
                  setImageHeight('');
                  setUploadMethod('url');
                  setUploadError(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Vložiť video</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL alebo video ID
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... alebo dQw4w9WgXcQ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Podporované: YouTube, Vimeo, alebo priama URL videa (.mp4, .webm)
                </p>
              </div>

              {/* Rozmery videa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rozmery (voliteľné)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={videoWidth}
                      onChange={(e) => setVideoWidth(e.target.value)}
                      placeholder="Šírka (napr. 640)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={videoHeight}
                      onChange={(e) => setVideoHeight(e.target.value)}
                      placeholder="Výška (napr. 480)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Predvolené: 640x480 pre YouTube
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (videoUrl) {
                    // YouTube embed
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                      editor.chain().focus().setYoutubeVideo({
                        src: videoUrl,
                        width: parseInt(videoWidth) || 640,
                        height: parseInt(videoHeight) || 480,
                      }).run();
                    } else {
                      // Priame video alebo iný provider
                      // Použijeme iframe pre universal support
                      const videoHtml = `<div class="editor-video-container" style="max-width: ${videoWidth}px; margin: 1rem 0;">
                        <video controls style="width: 100%; height: auto; border-radius: 8px;">
                          <source src="${videoUrl}" type="video/mp4">
                          Váš prehliadač nepodporuje video tag.
                        </video>
                      </div>`;
                      
                      // Vložíme ako raw HTML (Tiptap to podporuje cez content)
                      const currentContent = editor.getHTML();
                      editor.commands.setContent(currentContent + videoHtml);
                    }
                  }
                  setShowVideoDialog(false);
                  setVideoUrl('');
                  setVideoWidth('640');
                  setVideoHeight('480');
                }}
                disabled={!videoUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Vložiť
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVideoDialog(false);
                  setVideoUrl('');
                  setVideoWidth('640');
                  setVideoHeight('480');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

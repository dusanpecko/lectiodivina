"use client";

import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic,
    List, ListOrdered,
    Redo, Type,
    Underline as UnderlineIcon,
    Undo
} from 'lucide-react';
import { useEffect } from 'react';

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
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues in Next.js
    extensions: [
      StarterKit.configure({
        heading: false, // Zakázať headings pre jednoduchosť
        code: false, // Zakázať code blocks
        codeBlock: false,
        horizontalRule: false,
        blockquote: false, // Môžeš zapnúť ak chceš citácie
      }),
      Underline
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
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
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

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const text = editor.getText();
                editor.commands.setContent(`<p>${text}</p>`);
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
              title="Odstrániť formátovanie"
            >
              <Type size={14} />
              Plain
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
    </div>
  );
}

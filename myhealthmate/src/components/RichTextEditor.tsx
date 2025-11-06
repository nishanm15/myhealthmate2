// @ts-nocheck
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
  Minus
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('code') ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Inline Code"
      >
        <Code className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Heading */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        }`}
        title="Heading"
      >
        <Heading2 className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('bulletList') ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        }`}
        title="Bullet List"
      >
        <List className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('orderedList') ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Block Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('blockquote') ? 'bg-gray-300 text-purple-600' : 'text-gray-700'
        }`}
        title="Quote"
      >
        <Quote className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
        title="Horizontal Line"
      >
        <Minus className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-5 h-5" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...', className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes (for editing existing entries)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {editor && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
          <span>{editor.storage.characterCount.words()} words</span>
          <span className="mx-2">•</span>
          <span>{editor.storage.characterCount.characters()} characters</span>
        </div>
      )}
    </div>
  );
}

"use client";

import "./styles.css";

import { Editor, EditorContent, useEditor } from "@tiptap/react";
import Placeholder from '@tiptap/extension-placeholder';

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  RemoveFormatting,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CodeSquare,
  Quote,
  Minus,
  Undo,
  Redo,
  Image as ImageIcon,
  X,
  Save,
  ChevronLeft,
} from "lucide-react";
import { MouseEventHandler, useEffect, useState } from "react";
import { useCreateNote, useUpdateNote } from "@/lib/hooks/use-notes";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

type MenuBarProps = {
  editor: Editor | null;
  saveNotesFunc: MouseEventHandler<HTMLButtonElement>;
  saving: boolean;
};

type MenuButtonConfig = {
  icon: React.ElementType;
  title: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
};

const menuButtons: MenuButtonConfig[] = [
  {
    icon: Bold,
    title: "Bold",
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    icon: Italic,
    title: "Italic",
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    icon: Strikethrough,
    title: "Strikethrough",
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
  },
  {
    icon: Heading1,
    title: "Heading 1",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    icon: Heading2,
    title: "Heading 2",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    icon: Heading3,
    title: "Heading 3",
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    icon: Code,
    title: "Inline Code",
    action: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
  },
  {
    icon: CodeSquare,
    title: "Code Block",
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
  {
    icon: Pilcrow,
    title: "Paragraph",
    action: (editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor) => editor.isActive("paragraph"),
  },
  {
    icon: List,
    title: "Bullet List",
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    icon: ListOrdered,
    title: "Ordered List",
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    icon: Quote,
    title: "Blockquote",
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    icon: Minus,
    title: "Horizontal Rule",
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    icon: Undo,
    title: "Undo",
    action: (editor) => editor.chain().focus().undo().run(),
  },
  {
    icon: Redo,
    title: "Redo",
    action: (editor) => editor.chain().focus().redo().run(),
  },
  {
    icon: ImageIcon,
    title: "Insert Image",
    action: (editor) => {
      const url = window.prompt("Enter the URL of the image:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    icon: RemoveFormatting,
    title: "Remove Formatting",
    action: (editor) => editor.chain().focus().unsetAllMarks().run(),
  },
  {
    icon: X,
    title: "Clear Nodes",
    action: (editor) => editor.chain().focus().clearNodes().run(),
  },
];

const MenuBar = ({ editor, saveNotesFunc, saving }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-1 pb-1 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
      {menuButtons.map((button, index) => {
        const Icon = button.icon;

        return (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={() => button.action(editor)}
            className={`menu-item ${button.isActive?.(editor) ? "active" : ""
              }`}
            disabled={saving}
            title={button.title}
          >
            <Icon size={18} />
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="icon"
        onClick={saveNotesFunc}
        disabled={saving}
        title="Save"
        className="menu-item save-button ml-auto"
      >
        <Save size={18} className={saving ? "animate-pulse" : ""} />
      </Button>
    </div>
  );
};

interface NoteProps {
  serverNotes?: string;
  uuid?: string;
  title?: string;
  email?: string;
}

export default function Note({
  serverNotes = "",
  uuid,
  title = "",
  email = "",
}: NoteProps) {
  const [notes, setNotes] = useState(serverNotes);
  const [noteTitle, setNoteTitle] = useState(title);
  const router = useRouter();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const isSaving = createNote.isPending || updateNote.isPending;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: 'Start taking notes! Use the toolbar above to format your notes.',
      }),
    ],
    content: '', // no default content
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
    },
  });

  useEffect(() => {
    if (serverNotes && editor && !editor.isDestroyed) {
      editor.commands.setContent(serverNotes);
    }
  }, [serverNotes, editor]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function saveNotes(e: React.MouseEvent<HTMLButtonElement>) {
    if (uuid) {
      updateNote.mutate(
        {
          uuid,
          notes,
          title: noteTitle,
          email,
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onSuccess: (data) => { },
        }
      );
    } else {
      createNote.mutate(
        {
          notes,
          title: noteTitle,
          email,
        },
        {
          onSuccess: (data) => {
            router.push(`/note/${data.uuid}`);
          },
        }
      );
    }
  }

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col">
      <header className="flex items-center mb-4 pt-4">
        <Link
          href="/"
          className="flex items-center text-zinc-400 hover:text-white mr-4 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          <span className="text-sm">Back</span>
        </Link>

        <h1 className="text-xl font-medium text-zinc-200">
          {uuid ? "Edit Note" : "New Note"}
        </h1>

        <Button
          onClick={saveNotes}
          disabled={isSaving}
          className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm"
        >
          {isSaving ? "Saving..." : "Save"}
          <Save size={16} className="ml-2" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-2xl w-full bg-transparent border-none text-zinc-100 font-medium pb-2 focus:outline-none focus:border-b-2 focus:border-zinc-700 transition-colors"
          />

          <MenuBar
            editor={editor}
            saveNotesFunc={saveNotes}
            saving={isSaving}
          />
        </div>

        <div className="editor-container flex-1 px-4 pb-4 overflow-y-auto">
          <EditorContent
            editor={editor}
            className="prose prose-invert prose-zinc h-full focus:outline-none text-zinc-200"
          />
        </div>
      </div>
    </div>
  );
}
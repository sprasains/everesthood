"use client";
import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, ReactRenderer, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import tippy from "tippy.js";
import MentionList from "./MentionList";
import "tippy.js/dist/tippy.css";
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import UrlPreview from './UrlPreviewExtension';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from '@tiptap/extension-image';

interface RichTextEditorProps {
  initialContent?: any;
  onUpdate: (content: any) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: async (props: { query: string; editor: any }) => {
            const res = await fetch(`/api/v1/friends/search?q=${props.query}`);
            return await res.json();
          },
          render: () => {
            let component: any;
            let popup: any;
            return {
              onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });
                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate(props: any) {
                component.updateProps(props);
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown(props: any) {
                return component.ref?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
      UrlPreview,
      Image,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
  });

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get signed URL
      const res = await fetch('/api/v1/utils/gcs-sign-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `${Date.now()}-${file.name}`, contentType: file.type }),
      });
      const { url, publicUrl, error } = await res.json();
      if (!url || error) throw new Error(error || 'Failed to get upload URL');
      // 2. Upload to GCS
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Failed to upload image');
      // 3. Insert image node
      if (editor && typeof editor.chain().focus().setImage === 'function') {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }
    } catch (err) {
      // Optionally show error
      alert((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
          <Paper elevation={3} sx={{ display: 'flex', p: 0.5, borderRadius: 2 }}>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
              aria-label="Bold"
            >
              <FormatBoldIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
              aria-label="Italic"
            >
              <FormatItalicIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              color={editor.isActive('strike') ? 'primary' : 'default'}
              aria-label="Strikethrough"
            >
              <FormatStrikethroughIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
              aria-label="Blockquote"
            >
              <FormatQuoteIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
              aria-label="Bullet List"
            >
              <FormatListBulletedIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
              aria-label="Ordered List"
            >
              <FormatListNumberedIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              color={uploading ? 'primary' : 'default'}
              aria-label="Upload Image"
              disabled={uploading}
            >
              <CloudUploadIcon />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </Paper>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
      <style>{`.mention { color: #3b82f6; background: #dbeafe; border-radius: 4px; padding: 1px 3px; text-decoration: none; }`}</style>
    </div>
  );
};

export default RichTextEditor; 
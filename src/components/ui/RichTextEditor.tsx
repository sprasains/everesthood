"use client";
import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import tippy from "tippy.js";
import MentionList from "./MentionList";
import "tippy.js/dist/tippy.css";

interface RichTextEditorProps {
  value: any;
  onChange: (content: any) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: async (query: string) => {
            const res = await fetch(`/api/v1/friends/search?q=${query}`);
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
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return (
    <div>
      <EditorContent editor={editor} />
      <style>{`.mention { color: #3b82f6; background: #dbeafe; border-radius: 4px; padding: 1px 3px; text-decoration: none; }`}</style>
    </div>
  );
};

export default RichTextEditor; 
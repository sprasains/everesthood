import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import UrlPreviewCard from './UrlPreviewCard';
import { Plugin } from 'prosemirror-state';

export interface UrlPreviewAttrs {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  loading?: boolean;
  error?: string;
}

export const UrlPreview = Node.create({
  name: 'urlPreview',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      image: { default: '' },
      loading: { default: false },
      error: { default: '' },
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-url-preview]' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-url-preview': 'true' }), ''];
  },
  addNodeView() {
    return ReactNodeViewRenderer(UrlPreviewCard);
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain');
            if (text && /^https?:\/\//.test(text)) {
              // Insert a loading preview node
              const loadingNode = view.state.schema.nodes.urlPreview.create({ url: text, loading: true });
              let tr = view.state.tr.replaceSelectionWith(loadingNode);
              view.dispatch(tr);
              // Async unfurl logic
              setTimeout(async () => {
                try {
                  const res = await fetch('/api/v1/utils/unfurl', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: text }),
                  });
                  if (res.ok) {
                    const meta = await res.json();
                    const { url, title, description, image } = meta;
                    // Replace the loading node with the real preview
                    const node = view.state.schema.nodes.urlPreview.create({ url, title, description, image, loading: false });
                    tr = view.state.tr.replaceRangeWith(
                      tr.selection.from - 1, // -1 to target the loading node
                      tr.selection.from,
                      node
                    );
                    view.dispatch(tr);
                  } else {
                    const error = (await res.json()).error || 'Failed to load preview';
                    const errorNode = view.state.schema.nodes.urlPreview.create({ url: text, error });
                    tr = view.state.tr.replaceRangeWith(
                      tr.selection.from - 1,
                      tr.selection.from,
                      errorNode
                    );
                    view.dispatch(tr);
                  }
                } catch (e: any) {
                  const errorNode = view.state.schema.nodes.urlPreview.create({ url: text, error: e?.message || 'Failed to load preview' });
                  tr = view.state.tr.replaceRangeWith(
                    tr.selection.from - 1,
                    tr.selection.from,
                    errorNode
                  );
                  view.dispatch(tr);
                }
              }, 0);
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export default UrlPreview; 
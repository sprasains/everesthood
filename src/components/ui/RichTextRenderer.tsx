import { Node } from '@tiptap/core';
import { Typography } from '@mui/material';

interface RichTextRendererProps {
  content: any;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  // Simple renderer for TipTap JSON content
  if (!content || typeof content !== 'object') return null;

  function renderNode(node: any, key: number) {
    if (!node) return null;
    switch (node.type) {
      case 'doc':
        return node.content?.map((child: any, i: number) => renderNode(child, i));
      case 'paragraph':
        return <Typography key={key} paragraph sx={{ mb: 1 }}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</Typography>;
      case 'text':
        return node.text;
      case 'bulletList':
        return <ul key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</ul>;
      case 'listItem':
        return <li key={key}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</li>;
      default:
        return null;
    }
  }

  return <div>{renderNode(content, 0)}</div>;
}

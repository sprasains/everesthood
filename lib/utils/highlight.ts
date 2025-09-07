import { createElement, Fragment } from 'react';

export function highlightText(text: string, query: string) {
  if (!query.trim()) {
    return [createElement(Fragment, { key: 'single' }, text)];
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return createElement(
        'mark',
        {
          key: i,
          className: 'bg-yellow-100 dark:bg-yellow-800/30',
        },
        part
      );
    }
    return createElement('span', { key: i }, part);
  });
}

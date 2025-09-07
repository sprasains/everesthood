import { useEffect } from 'react';

export function useSearchKeyboardShortcuts(
  onSearchFocus: () => void,
  onTabChange: (tab: string) => void
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Command/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchFocus();
      }

      // Alt + 1-5 for quick tab switching
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        const tabs = {
          '1': 'all',
          '2': 'posts',
          '3': 'events',
          '4': 'users',
          '5': 'polls',
        };

        if (tabs[e.key as keyof typeof tabs]) {
          e.preventDefault();
          onTabChange(tabs[e.key as keyof typeof tabs]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchFocus, onTabChange]);
}

import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const metaMatches = shortcut.metaKey ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey;
        const shiftMatches = shortcut.shiftKey === undefined ? true : e.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined ? true : e.altKey === shortcut.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          e.preventDefault();
          shortcut.handler(e);
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Common shortcuts helper
export const commonShortcuts = {
  save: (handler: () => void): KeyboardShortcut => ({
    key: "s",
    ctrlKey: true,
    handler: () => handler(),
    description: "Save",
  }),
  new: (handler: () => void): KeyboardShortcut => ({
    key: "n",
    ctrlKey: true,
    handler: () => handler(),
    description: "New",
  }),
  search: (handler: () => void): KeyboardShortcut => ({
    key: "k",
    ctrlKey: true,
    handler: () => handler(),
    description: "Search",
  }),
  delete: (handler: () => void): KeyboardShortcut => ({
    key: "Delete",
    handler: () => handler(),
    description: "Delete",
  }),
  escape: (handler: () => void): KeyboardShortcut => ({
    key: "Escape",
    handler: () => handler(),
    description: "Close",
  }),
};

import React from 'react';
import { Command, HelpCircle } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ + N', desc: 'Create New Note' },
    { key: '⌘ + K', desc: 'Quick Switcher / Command Search' },
    { key: '⌘ + G', desc: 'Toggle Interactive Graph View' },
    { key: '⌘ + B', desc: 'Toggle Left Sidebar' },
    { key: '⌘ + D', desc: 'Open Today\'s Daily Journal' },
    { key: '⌘ + \\', desc: 'Toggle Split View / Live Preview' },
    { key: '[[', desc: 'Trigger Bi-directional Link Autocomplete' },
    { key: '#tag', desc: 'Create Tag Pill' },
    { key: '> [!NOTE]', desc: 'Create Callout Box' },
    { key: '$ math $', desc: 'Render Inline LaTeX Formula' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl p-5 text-xs text-gray-800 dark:text-gray-200 space-y-4 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Command size={18} className="text-accent" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">macOS Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/60 flex justify-between items-center"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-[11px] font-bold text-accent shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-gray-200 dark:border-gray-800">
          All shortcuts are active across Nexus Notes.
        </div>
      </div>
    </div>
  );
};

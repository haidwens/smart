import React, { useEffect, useState } from 'react';
import {
  Search,
  FileText,
  Plus,
  Network,
  Layout,
  Calendar,
  Download,
  Sun,
  Moon,
  Tag,
} from 'lucide-react';
import { Note } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onOpenNote: (noteId: string) => void;
  onCreateNote: () => void;
  onSwitchView: (view: 'editor' | 'graph' | 'canvas' | 'daily') => void;
  onExportVault: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  onOpenNote,
  onCreateNote,
  onSwitchView,
  onExportVault,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      n.content.toLowerCase().includes(query.toLowerCase())
  );

  const commandActions = [
    {
      id: 'cmd-new',
      label: 'Create New Note',
      icon: <Plus size={14} className="text-accent" />,
      action: () => {
        onCreateNote();
        onClose();
      },
    },
    {
      id: 'cmd-graph',
      label: 'Open Interactive Graph View',
      icon: <Network size={14} className="text-purple-500" />,
      action: () => {
        onSwitchView('graph');
        onClose();
      },
    },
    {
      id: 'cmd-canvas',
      label: 'Open Canvas Infinite Board',
      icon: <Layout size={14} className="text-emerald-500" />,
      action: () => {
        onSwitchView('canvas');
        onClose();
      },
    },
    {
      id: 'cmd-daily',
      label: 'Open Today\'s Daily Journal Note',
      icon: <Calendar size={14} className="text-amber-500" />,
      action: () => {
        onSwitchView('daily');
        onClose();
      },
    },
    {
      id: 'cmd-export',
      label: 'Export Vault Backup (ZIP / JSON)',
      icon: <Download size={14} className="text-sky-500" />,
      action: () => {
        onExportVault();
        onClose();
      },
    },
    {
      id: 'cmd-theme',
      label: 'Toggle Dark / Light Theme',
      icon: <Sun size={14} className="text-yellow-500" />,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  const totalItems = commandActions.length + filteredNotes.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < commandActions.length) {
        commandActions[selectedIndex].action();
      } else {
        const noteIndex = selectedIndex - commandActions.length;
        if (filteredNotes[noteIndex]) {
          onOpenNote(filteredNotes[noteIndex].id);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white/95 dark:bg-gray-900/95 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden text-xs text-gray-800 dark:text-gray-200 select-none animate-in zoom-in-95 duration-150"
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search notes, tags, or type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400"
          />
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-[10px] text-gray-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* System Commands */}
          {!query && (
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-2.5 py-1">
                Quick Commands
              </div>
              <div className="space-y-0.5">
                {commandActions.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                      idx === selectedIndex
                        ? 'bg-accent text-white font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {cmd.icon}
                    <span className="flex-1">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-2.5 py-1">
              Notes ({filteredNotes.length})
            </div>
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-400 italic text-xs">
                No matching notes found. Press Enter to create a new note with this title.
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredNotes.map((note, idx) => {
                  const globalIdx = (query ? 0 : commandActions.length) + idx;
                  const isSelected = globalIdx === selectedIndex;

                  return (
                    <button
                      key={note.id}
                      onClick={() => {
                        onOpenNote(note.id);
                        onClose();
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                        isSelected
                          ? 'bg-accent text-white font-medium'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <FileText
                        size={14}
                        className={isSelected ? 'text-white' : 'text-gray-400'}
                      />
                      <div className="flex-1 truncate">
                        <div className="font-semibold">{note.title}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          {note.content.substring(0, 80).replace(/\n/g, ' ')}
                        </div>
                      </div>
                      {note.tags.length > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                          #{note.tags[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center text-[10px] text-gray-400 px-3">
          <span>
            Use <kbd className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">↑</kbd>{' '}
            <kbd className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">↓</kbd> to navigate
          </span>
          <span>
            Press <kbd className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">↵</kbd> to select
          </span>
        </div>
      </div>
    </div>
  );
};

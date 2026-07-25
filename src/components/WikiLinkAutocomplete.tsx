import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { Note } from '../types';

interface WikiLinkAutocompleteProps {
  query: string;
  notes: Note[];
  onSelectNote: (noteTitle: string) => void;
  onCreateNewNote: (newTitle: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const WikiLinkAutocomplete: React.FC<WikiLinkAutocompleteProps> = ({
  query,
  notes,
  onSelectNote,
  onCreateNewNote,
  onClose,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatchExists = notes.some(
    (n) => n.title.toLowerCase() === query.trim().toLowerCase()
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredNotes.length + (!exactMatchExists && query.trim() ? 0 : -1)
            ? prev + 1
            : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0
            ? prev - 1
            : filteredNotes.length + (!exactMatchExists && query.trim() ? 0 : -1)
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (selectedIndex < filteredNotes.length) {
          onSelectNote(filteredNotes[selectedIndex].title);
        } else if (query.trim()) {
          onCreateNewNote(query.trim());
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredNotes, query, exactMatchExists, onSelectNote, onCreateNewNote, onClose]);

  return (
    <div
      style={{
        top: Math.min(position.top, window.innerHeight - 250),
        left: Math.min(position.left, window.innerWidth - 300),
      }}
      className="fixed z-50 w-72 max-h-60 overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl p-1.5 text-xs text-gray-800 dark:text-gray-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 mb-1">
        <Search size={11} />
        <span>Insert Bi-Directional Link [[...]]</span>
      </div>

      <div className="space-y-0.5">
        {filteredNotes.map((note, idx) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.title)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              idx === selectedIndex
                ? 'bg-accent text-white font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FileText size={13} className={idx === selectedIndex ? 'text-white' : 'text-gray-400'} />
            <span className="truncate flex-1">{note.title}</span>
            <span
              className={`text-[10px] ${
                idx === selectedIndex ? 'text-white/80' : 'text-gray-400'
              }`}
            >
              [[link]]
            </span>
          </button>
        ))}

        {/* Option to create new note if no exact match */}
        {query.trim() && !exactMatchExists && (
          <button
            onClick={() => onCreateNewNote(query.trim())}
            onMouseEnter={() => setSelectedIndex(filteredNotes.length)}
            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              selectedIndex === filteredNotes.length
                ? 'bg-amber-500 text-white font-medium'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Plus size={13} />
            <span className="truncate flex-1">Create new note: "<strong>{query}</strong>"</span>
          </button>
        )}

        {filteredNotes.length === 0 && !query.trim() && (
          <div className="p-3 text-center text-gray-400 italic text-[11px]">
            Type note title to link...
          </div>
        )}
      </div>
    </div>
  );
};

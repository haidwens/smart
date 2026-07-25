import React from 'react';
import { ExternalLink, Calendar, Tag, FileText } from 'lucide-react';
import { Note } from '../types';

interface WikiLinkPreviewProps {
  note: Note | null;
  targetTitle: string;
  position: { top: number; left: number };
  onOpenNote: (noteId: string) => void;
  onCreateNewNote: (title: string) => void;
  onClose: () => void;
}

export const WikiLinkPreview: React.FC<WikiLinkPreviewProps> = ({
  note,
  targetTitle,
  position,
  onOpenNote,
  onCreateNewNote,
  onClose,
}) => {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        top: Math.min(position.top + 20, window.innerHeight - 220),
        left: Math.min(position.left, window.innerWidth - 320),
      }}
      className="fixed z-50 w-80 max-h-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-300/80 dark:border-gray-700/80 rounded-xl shadow-2xl p-3 text-xs text-gray-800 dark:text-gray-200 select-none animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {note ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900 dark:text-white truncate">
              <FileText size={15} className="text-accent flex-shrink-0" />
              <span className="truncate">{note.title}</span>
            </div>
            <button
              onClick={() => onOpenNote(note.id)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-white hover:bg-accent/90 text-[11px] font-medium transition-all"
            >
              <span>Open</span>
              <ExternalLink size={10} />
            </button>
          </div>

          {/* Snippet Preview */}
          <div className="line-clamp-4 text-gray-600 dark:text-gray-300 leading-relaxed font-sans text-[11px] bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-200/50 dark:border-gray-700/50">
            {note.content.replace(/#.*$/gm, '').trim() || 'No preview available.'}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <div className="flex items-center gap-1">
              <Calendar size={11} />
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            {note.tags.length > 0 && (
              <div className="flex items-center gap-1 truncate max-w-[150px]">
                <Tag size={10} />
                <span className="truncate">{note.tags.map((t) => `#${t}`).join(' ')}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Note doesn't exist yet */
        <div className="space-y-2 text-center py-2">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Note "<strong>{targetTitle}</strong>" does not exist yet.
          </p>
          <button
            onClick={() => onCreateNewNote(targetTitle)}
            className="w-full py-1.5 px-3 rounded-lg bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 transition-all shadow-2xs"
          >
            Create Note [[{targetTitle}]]
          </button>
        </div>
      )}
    </div>
  );
};

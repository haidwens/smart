import React, { useState } from 'react';
import {
  Link2,
  Unlink,
  ExternalLink,
  List,
  Info,
  Clock,
  Pin,
  Tag,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Note, BacklinkItem } from '../types';
import { findBacklinks, extractHeaders, extractWikiLinks } from '../lib/markdown';

interface RightInspectorProps {
  currentNote: Note | null;
  allNotes: Record<string, Note>;
  onOpenNote: (noteId: string) => void;
  onLinkifyMention: (sourceNoteId: string, mentionText: string) => void;
  onTogglePinNote: (noteId: string) => void;
  onAddTag: (noteId: string, tag: string) => void;
  onRemoveTag: (noteId: string, tag: string) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  currentNote,
  allNotes,
  onOpenNote,
  onLinkifyMention,
  onTogglePinNote,
  onAddTag,
  onRemoveTag,
}) => {
  const [activeTab, setActiveTab] = useState<'backlinks' | 'outline' | 'info'>('backlinks');
  const [newTagInput, setNewTagInput] = useState('');
  const [showUnlinked, setShowUnlinked] = useState(true);

  if (!currentNote) {
    return (
      <div className="w-64 h-full border-l border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 p-4 text-center text-gray-400 text-xs flex items-center justify-center">
        Select or create a note to view backlinks & outline
      </div>
    );
  }

  // Find backlinks
  const { linkedMentions, unlinkedMentions } = findBacklinks(
    currentNote.id,
    currentNote.title,
    allNotes
  );

  // Outgoing links
  const outgoingWikiLinks = extractWikiLinks(currentNote.content);

  // Extract Outline headers
  const headers = extractHeaders(currentNote.content);

  // Stats calculation
  const words = currentNote.content.trim() ? currentNote.content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      onAddTag(currentNote.id, newTagInput.trim().toLowerCase().replace(/^#/, ''));
      setNewTagInput('');
    }
  };

  return (
    <div className="w-72 h-full bg-[#FFFFFF] dark:bg-[#18181A] border-l border-[#E5E5E5] dark:border-[#2C2C2E] flex flex-col select-none text-[12px] text-[#4A4A4A] dark:text-[#A1A1A6]">
      {/* Drawer Mode Switcher Tabs */}
      <div className="flex border-b border-[#F0F0F0] dark:border-[#2C2C2E] bg-[#FAFAFA] dark:bg-[#1C1C1E]">
        <button
          onClick={() => setActiveTab('backlinks')}
          className={`flex-1 py-2.5 text-center text-[12px] transition-all flex items-center justify-center gap-1 ${
            activeTab === 'backlinks'
              ? 'font-semibold border-b-2 border-[#007AFF] text-[#1D1D1F] dark:text-white bg-white dark:bg-[#2C2C2E]'
              : 'font-medium text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title="Backlinks & Linked Mentions"
        >
          <Link2 size={12} />
          <span>Links ({linkedMentions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('outline')}
          className={`flex-1 py-2.5 text-center text-[12px] transition-all flex items-center justify-center gap-1 ${
            activeTab === 'outline'
              ? 'font-semibold border-b-2 border-[#007AFF] text-[#1D1D1F] dark:text-white bg-white dark:bg-[#2C2C2E]'
              : 'font-medium text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title="Table of Contents Outline"
        >
          <List size={12} />
          <span>Outline</span>
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2.5 text-center text-[12px] transition-all flex items-center justify-center gap-1 ${
            activeTab === 'info'
              ? 'font-semibold border-b-2 border-[#007AFF] text-[#1D1D1F] dark:text-white bg-white dark:bg-[#2C2C2E]'
              : 'font-medium text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title="Note Metadata & Tags"
        >
          <Info size={12} />
          <span>Info</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: BACKLINKS & OUTGOING LINKS */}
        {activeTab === 'backlinks' && (
          <div className="space-y-5">
            {/* Linked Mentions */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Backlinks ({linkedMentions.length})</span>
                <Link2 size={12} className="text-[#007AFF]" />
              </div>

              {linkedMentions.length === 0 ? (
                <div className="p-3 bg-[#F8F8F8] dark:bg-[#2C2C2E]/40 rounded-lg border border-[#F0F0F0] dark:border-[#3A3A3C] text-gray-400 text-center italic text-[11px]">
                  No incoming links yet
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedMentions.map((item) => (
                    <div
                      key={item.sourceNoteId}
                      onClick={() => onOpenNote(item.sourceNoteId)}
                      className="group p-3 rounded-lg border border-[#F0F0F0] dark:border-[#2C2C2E] bg-white dark:bg-[#2C2C2E]/30 hover:bg-[#F9F9F9] dark:hover:bg-[#2C2C2E] transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="text-[13px] font-medium text-[#007AFF] mb-1 flex items-center justify-between">
                        <span className="truncate">{item.sourceNoteTitle}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 text-[#007AFF]" />
                      </div>
                      <div className="text-[11px] text-[#6B6B6B] dark:text-[#A1A1A6] line-clamp-2 italic leading-relaxed">
                        "{item.contextSnippet}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unlinked Mentions */}
            <div>
              <div
                onClick={() => setShowUnlinked(!showUnlinked)}
                className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between cursor-pointer hover:text-gray-700"
              >
                <div className="flex items-center gap-1">
                  {showUnlinked ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <span>Unlinked Mentions ({unlinkedMentions.length})</span>
                </div>
                <Unlink size={11} className="text-amber-500" />
              </div>

              {showUnlinked && (
                unlinkedMentions.length === 0 ? (
                  <div className="p-3 bg-[#F8F8F8] dark:bg-[#2C2C2E]/40 rounded-lg border border-[#F0F0F0] dark:border-[#3A3A3C] text-gray-400 text-center italic text-[11px]">
                    No unlinked mentions found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unlinkedMentions.map((item) => (
                      <div
                        key={item.sourceNoteId}
                        className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1"
                      >
                        <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                          <span className="truncate">{item.sourceNoteTitle}</span>
                          <button
                            onClick={() => onLinkifyMention(item.sourceNoteId, currentNote.title)}
                            title="Convert text mention to [[WikiLink]]"
                            className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold hover:bg-amber-600 transition-all shadow-2xs"
                          >
                            Linkify
                          </button>
                        </div>
                        <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 line-clamp-2 italic">
                          "{item.contextSnippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Outgoing Links */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Outgoing Links ({outgoingWikiLinks.length})
              </div>
              {outgoingWikiLinks.length === 0 ? (
                <div className="p-3 bg-[#F8F8F8] dark:bg-[#2C2C2E]/40 rounded-lg border border-[#F0F0F0] dark:border-[#3A3A3C] text-gray-400 text-center italic text-[11px]">
                  No outgoing [[links]] in this note
                </div>
              ) : (
                <div className="space-y-1.5">
                  {outgoingWikiLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded bg-[#F8F8F8] dark:bg-[#2C2C2E] border border-[#F0F0F0] dark:border-[#3A3A3C] flex items-center justify-between text-[11px] font-medium"
                    >
                      <span className="truncate text-[#007AFF]">[[{link.title}]]</span>
                      <span className="text-[9px] text-gray-400 font-mono">Linked</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Local Graph Preview Box */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Local Graph Preview
              </div>
              <div className="w-full aspect-square bg-[#F8F8F8] dark:bg-[#1E1E20] rounded-xl flex items-center justify-center relative overflow-hidden border border-[#F0F0F0] dark:border-[#2C2C2E]">
                <svg width="180" height="180" viewBox="0 0 200 200">
                  <line x1="100" y1="100" x2="60" y2="60" stroke="#D1D1D6" strokeWidth="1" />
                  <line x1="100" y1="100" x2="140" y2="60" stroke="#D1D1D6" strokeWidth="1" />
                  <line x1="100" y1="100" x2="100" y2="160" stroke="#D1D1D6" strokeWidth="1" />
                  <circle cx="100" cy="100" r="6" fill="#007AFF" />
                  <circle cx="60" cy="60" r="4" fill="#8E8E93" />
                  <circle cx="140" cy="60" r="4" fill="#8E8E93" />
                  <circle cx="100" cy="160" r="4" fill="#8E8E93" />
                </svg>
                <div className="absolute bottom-2 left-0 w-full text-center text-[10px] text-[#8E8E93]">
                  {linkedMentions.length + outgoingWikiLinks.length + 1} Nodes Connected
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TABLE OF CONTENTS OUTLINE */}
        {activeTab === 'outline' && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Note Outline
            </div>

            {headers.length === 0 ? (
              <div className="p-4 text-center text-gray-400 italic text-[11px]">
                Add markdown headers (# Header) to generate an outline.
              </div>
            ) : (
              <div className="space-y-1">
                {headers.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                    className="block py-1 pr-2 rounded text-[11px] font-medium text-[#4A4A4A] dark:text-[#A1A1A6] hover:text-[#007AFF] hover:bg-[#F8F8F8] dark:hover:bg-[#2C2C2E] truncate transition-colors"
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INFO & TAGS */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F8F8] dark:bg-[#2C2C2E] border border-[#F0F0F0] dark:border-[#3A3A3C]">
              <span className="font-semibold text-[#1D1D1F] dark:text-gray-200">Pin Note</span>
              <button
                onClick={() => onTogglePinNote(currentNote.id)}
                className={`p-1.5 rounded transition-all ${
                  currentNote.isPinned
                    ? 'bg-[#007AFF] text-white shadow-2xs'
                    : 'bg-[#E5E5E5] dark:bg-[#3A3A3C] text-[#6B6B6B] dark:text-[#A1A1A6]'
                }`}
              >
                <Pin size={14} />
              </button>
            </div>

            {/* Note Stats */}
            <div className="p-3 rounded-lg bg-white dark:bg-[#2C2C2E]/40 border border-[#F0F0F0] dark:border-[#2C2C2E] space-y-2">
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Word & Character Stats
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-[#F8F8F8] dark:bg-[#1E1E20]">
                  <div className="text-sm font-bold text-[#007AFF]">{words}</div>
                  <div className="text-[9px] text-[#8E8E93]">Words</div>
                </div>
                <div className="p-2 rounded bg-[#F8F8F8] dark:bg-[#1E1E20]">
                  <div className="text-sm font-bold text-[#007AFF]">{currentNote.content.length}</div>
                  <div className="text-[9px] text-[#8E8E93]">Characters</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#8E8E93] pt-1">
                <Clock size={12} />
                <span>Est. Reading Time: ~{readingTime} min</span>
              </div>
            </div>

            {/* Tags Manager */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Tags</span>
                <Tag size={11} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[10px] text-[#8E8E93] dark:text-[#A1A1A6] rounded border border-[#E5E5EA] dark:border-[#3A3A3C]"
                  >
                    #{tag}
                    <button
                      onClick={() => onRemoveTag(currentNote.id, tag)}
                      className="hover:text-rose-500 ml-0.5 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddTagSubmit} className="flex gap-1">
                <input
                  type="text"
                  placeholder="Add #tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-[#F8F8F8] dark:bg-[#1C1C1E] border border-[#E0E0E0] dark:border-[#3A3A3C] text-xs"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-[#007AFF] text-white hover:bg-[#0062CC]"
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>

            {/* Dates */}
            <div className="text-[10px] text-[#8E8E93] space-y-1 pt-2 border-t border-[#F0F0F0] dark:border-[#2C2C2E]">
              <div>Created: {new Date(currentNote.createdAt).toLocaleString()}</div>
              <div>Last Edit: {new Date(currentNote.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

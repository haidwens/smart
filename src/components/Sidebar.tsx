import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  Pin,
  Tag,
  Book,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  HardDrive,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';
import { VaultState, Note, Notebook, Section, Folder as FolderType } from '../types';

interface SidebarProps {
  vault: VaultState;
  onSelectNote: (noteId: string) => void;
  onCreateNote: (notebookId?: string, sectionId?: string, folderId?: string) => void;
  onDeleteNote: (noteId: string, e: React.MouseEvent) => void;
  onCreateFolder: (name: string) => void;
  onCreateNotebook: (name: string, color: string) => void;
  onCreateSection: (notebookId: string, name: string) => void;
  onSelectTagFilter: (tag: string | null) => void;
  selectedTag: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  vault,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onCreateFolder,
  onCreateNotebook,
  onCreateSection,
  onSelectTagFilter,
  selectedTag,
}) => {
  const [activeTab, setActiveTab] = useState<'notebooks' | 'folders' | 'tags'>('notebooks');
  const [expandedNotebooks, setExpandedNotebooks] = useState<Record<string, boolean>>({ 'nb-1': true, 'nb-2': true });
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'fold-1': true });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const notesList = Object.values(vault.notes) as Note[];
  const notebooksList = Object.values(vault.notebooks) as Notebook[];
  const sectionsList = Object.values(vault.sections) as Section[];
  const foldersList = Object.values(vault.folders) as FolderType[];

  // Extract all unique tags
  const allTags = Array.from(
    new Set(notesList.flatMap((n) => n.tags || []))
  ).sort();

  // Filter notes by search query or selected tag
  const filteredNotes = notesList.filter((note) => {
    if (selectedTag && !note.tags.includes(selectedTag)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  const pinnedNotes = notesList.filter((n) => n.isPinned);

  const toggleNotebook = (id: string) => {
    setExpandedNotebooks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleAddNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNotebookName.trim()) {
      onCreateNotebook(newNotebookName.trim(), 'bg-accent');
      setNewNotebookName('');
      setShowNewNotebookModal(false);
    }
  };

  return (
    <div className="w-64 h-full bg-[#F8F8F8] dark:bg-[#18181A] border-r border-[#E5E5E5] dark:border-[#2C2C2E] flex flex-col select-none text-[13px] text-[#4A4A4A] dark:text-[#A1A1A6]">
      {/* Header & Vault Name */}
      <div className="p-3 border-b border-[#E5E5E5] dark:border-[#2C2C2E] flex justify-between items-center bg-[#F2F2F2]/50 dark:bg-[#1C1C1E]/50">
        <div className="flex items-center gap-2 font-semibold text-sm text-[#1D1D1F] dark:text-white truncate">
          <span className="p-1 rounded bg-[#007AFF]/10 text-[#007AFF]">🍎</span>
          <span className="truncate">{vault.name}</span>
        </div>
        <button
          onClick={() => onCreateNote()}
          title="Create New Note in Root"
          className="p-1 rounded text-[#6B6B6B] dark:text-[#A1A1A6] hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] transition-all"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-[#E5E5E5] dark:border-[#2C2C2E]">
        <div className="relative flex items-center p-1.5 bg-white dark:bg-[#2C2C2E] border border-[#E0E0E0] dark:border-[#3A3A3C] rounded-md shadow-2xs">
          <Search size={13} className="text-gray-400 shrink-0 mr-1.5" />
          <input
            type="text"
            placeholder="Quick Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[#1D1D1F] dark:text-gray-100 border-0 focus:outline-none text-[12px] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sidebar Mode Tabs: OneNote Notebooks vs Obsidian Folders vs Tags */}
      <div className="flex border-b border-[#E5E5E5] dark:border-[#2C2C2E] bg-[#F2F2F2]/40 dark:bg-[#1C1C1E]/40 p-1 gap-1">
        <button
          onClick={() => setActiveTab('notebooks')}
          className={`flex-1 py-1 rounded text-center text-[12px] font-medium transition-all flex items-center justify-center gap-1 ${
            activeTab === 'notebooks'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title="OneNote Notebook & Section Hierarchy"
        >
          <Book size={12} />
          <span>Notebooks</span>
        </button>
        <button
          onClick={() => setActiveTab('folders')}
          className={`flex-1 py-1 rounded text-center text-[12px] font-medium transition-all flex items-center justify-center gap-1 ${
            activeTab === 'folders'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title="Obsidian Folder Structure"
        >
          <Folder size={12} />
          <span>Folders</span>
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex-1 py-1 rounded text-center text-[12px] font-medium transition-all flex items-center justify-center gap-1 ${
            activeTab === 'tags'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
          title="Tag Index (#tag)"
        >
          <Tag size={12} />
          <span>Tags</span>
        </button>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && !searchQuery && (
        <div className="p-2 border-b border-[#E5E5E5] dark:border-[#2C2C2E]">
          <div className="text-[11px] uppercase font-bold text-gray-400 dark:text-gray-500 px-2 py-1 flex items-center gap-1 tracking-wider">
            <Pin size={11} className="text-[#007AFF]" />
            <span>Pinned Notes</span>
          </div>
          <div className="space-y-0.5 mt-0.5">
            {pinnedNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between group transition-all text-[13px] ${
                  vault.activeNoteId === note.id
                    ? 'bg-[#EBEBEB] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-medium'
                    : 'hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]'
                }`}
              >
                <span className="truncate flex-1">{note.title || 'Untitled Note'}</span>
                <Trash2
                  size={12}
                  onClick={(e) => onDeleteNote(note.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* TAB 1: ONENOTE NOTEBOOKS & SECTIONS */}
        {activeTab === 'notebooks' && (
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                Notebooks & Sections
              </span>
              <button
                onClick={() => setShowNewNotebookModal(true)}
                title="Add Notebook"
                className="p-0.5 text-gray-500 hover:text-accent"
              >
                <Plus size={12} />
              </button>
            </div>

            {notebooksList.map((notebook) => {
              const isExpanded = expandedNotebooks[notebook.id] ?? true;
              const notebookSections = sectionsList.filter((s) => s.notebookId === notebook.id);

              return (
                <div key={notebook.id} className="space-y-0.5">
                  {/* Notebook Header */}
                  <div
                    onClick={() => toggleNotebook(notebook.id)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-200/70 dark:hover:bg-gray-800/70 font-semibold text-gray-900 dark:text-gray-100 transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <div className={`w-2 h-2 rounded-full ${notebook.color || 'bg-blue-500'}`} />
                    <span className="flex-1 truncate">{notebook.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateSection(notebook.id, 'New Section');
                      }}
                      title="Add Section to Notebook"
                      className="p-0.5 text-gray-400 hover:text-accent"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Notebook Sections & Notes */}
                  {isExpanded && (
                    <div className="ml-3 pl-2 border-l border-gray-200 dark:border-gray-800 space-y-1 my-1">
                      {notebookSections.map((sec) => {
                        const sectionNotes = filteredNotes.filter((n) => n.sectionId === sec.id);

                        return (
                          <div key={sec.id} className="space-y-0.5">
                            <div className="flex items-center justify-between px-2 py-0.5 text-gray-600 dark:text-gray-400 font-medium">
                              <span className="truncate">📁 {sec.name}</span>
                              <button
                                onClick={() => onCreateNote(notebook.id, sec.id)}
                                title="Add note to section"
                                className="p-0.5 hover:text-accent text-gray-400"
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            {/* Section Notes */}
                            <div className="ml-2 space-y-0.5">
                              {sectionNotes.map((note) => (
                                <button
                                  key={note.id}
                                  onClick={() => onSelectNote(note.id)}
                                  className={`w-full text-left px-2 py-1 rounded-md flex items-center justify-between group transition-all ${
                                    vault.activeNoteId === note.id
                                      ? 'bg-accent/20 text-accent font-semibold'
                                      : 'hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <span className="truncate flex-1">{note.title || 'Untitled'}</span>
                                  <Trash2
                                    size={11}
                                    onClick={(e) => onDeleteNote(note.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: OBSIDIAN FOLDERS */}
        {activeTab === 'folders' && (
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                Folder Hierarchy
              </span>
              <button
                onClick={() => setShowNewFolderModal(true)}
                title="Add Folder"
                className="p-0.5 text-gray-500 hover:text-accent"
              >
                <FolderPlus size={13} />
              </button>
            </div>

            {foldersList.map((folder) => {
              const isExpanded = expandedFolders[folder.id] ?? true;
              const folderNotes = filteredNotes.filter((n) => n.folderId === folder.id);

              return (
                <div key={folder.id} className="space-y-0.5">
                  <div
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-gray-200/70 dark:hover:bg-gray-800/70 font-semibold text-gray-800 dark:text-gray-200"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      <Folder size={13} className="text-amber-500" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateNote(undefined, undefined, folder.id);
                      }}
                      title="Add note to folder"
                      className="p-0.5 text-gray-400 hover:text-accent"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-4 space-y-0.5 my-1">
                      {folderNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => onSelectNote(note.id)}
                          className={`w-full text-left px-2 py-1 rounded-md flex items-center justify-between group transition-all ${
                            vault.activeNoteId === note.id
                              ? 'bg-accent/20 text-accent font-semibold'
                              : 'hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="truncate flex-1">{note.title || 'Untitled'}</span>
                          <Trash2
                            size={11}
                            onClick={(e) => onDeleteNote(note.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Uncategorized Root Notes */}
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-1 mb-1">
                Root Notes
              </div>
              {filteredNotes
                .filter((n) => !n.folderId && !n.sectionId)
                .map((note) => (
                  <button
                    key={note.id}
                    onClick={() => onSelectNote(note.id)}
                    className={`w-full text-left px-2 py-1 rounded-md flex items-center justify-between group transition-all ${
                      vault.activeNoteId === note.id
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="truncate flex-1">{note.title || 'Untitled'}</span>
                    <Trash2
                      size={11}
                      onClick={(e) => onDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                    />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: TAGS */}
        {activeTab === 'tags' && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-1 mb-1">
              Tag Index
            </div>

            {selectedTag && (
              <button
                onClick={() => onSelectTagFilter(null)}
                className="w-full text-left px-2 py-1 mb-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md font-medium flex items-center justify-between"
              >
                <span>Clear filter: #{selectedTag}</span>
                <span>×</span>
              </button>
            )}

            {allTags.map((tag) => {
              const tagCount = notesList.filter((n) => n.tags.includes(tag)).length;

              return (
                <button
                  key={tag}
                  onClick={() => onSelectTagFilter(selectedTag === tag ? null : tag)}
                  className={`w-full text-left px-2 py-1 rounded-md flex items-center justify-between transition-all ${
                    selectedTag === tag
                      ? 'bg-accent text-white font-semibold'
                      : 'hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="truncate">#{tag}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-500">
                    {tagCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <form onSubmit={handleAddFolder} className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-200/50 dark:bg-gray-800/50">
          <div className="text-xs font-semibold mb-1 text-gray-900 dark:text-white">New Folder Name</div>
          <input
            type="text"
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="e.g. Research Papers"
            className="w-full px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs mb-2"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowNewFolderModal(false)}
              className="px-2 py-1 text-[11px] rounded bg-gray-300 dark:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-[11px] rounded bg-accent text-white font-medium"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* New Notebook Modal */}
      {showNewNotebookModal && (
        <form onSubmit={handleAddNotebook} className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-200/50 dark:bg-gray-800/50">
          <div className="text-xs font-semibold mb-1 text-gray-900 dark:text-white">New Notebook Name</div>
          <input
            type="text"
            autoFocus
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="e.g. 📗 Personal Projects"
            className="w-full px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs mb-2"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowNewNotebookModal(false)}
              className="px-2 py-1 text-[11px] rounded bg-gray-300 dark:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-[11px] rounded bg-accent text-white font-medium"
            >
              Create Notebook
            </button>
          </div>
        </form>
      )}

      {/* Footer: Storage Engine Status */}
      <div className="p-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-200/40 dark:bg-gray-800/40 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <HardDrive size={13} className="text-emerald-500" />
          <span>Offline IndexedDB</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">
          Saved
        </span>
      </div>
    </div>
  );
};

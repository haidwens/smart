import React, { useState, useEffect, useCallback } from 'react';
import { VaultState, Note } from './types';
import { loadVault, saveVault, generateDefaultVault } from './lib/storage';
import { MacTitlebar } from './components/MacTitlebar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { RightInspector } from './components/RightInspector';
import { GraphView } from './components/GraphView';
import { CanvasView } from './components/CanvasView';
import { DailyNotesCalendar } from './components/DailyNotesCalendar';
import { CommandPalette } from './components/CommandPalette';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';

export default function App() {
  const [vault, setVault] = useState<VaultState>(() => loadVault());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Save vault state whenever it changes
  useEffect(() => {
    saveVault(vault);
  }, [vault]);

  // Active note helper
  const activeNote = vault.activeNoteId ? vault.notes[vault.activeNoteId] || null : null;

  // Create new note
  const handleCreateNote = useCallback(
    (notebookId?: string, sectionId?: string, folderId?: string, initialTitle?: string) => {
      const now = new Date().toISOString();
      const newId = `note-${Date.now()}`;
      const title = initialTitle || 'Untitled Note';

      const newNote: Note = {
        id: newId,
        title,
        content: `# ${title}\n\nStart writing your note or link to another note using [[WikiLink]]...`,
        notebookId: notebookId || 'nb-1',
        sectionId: sectionId || 'sec-1',
        folderId,
        createdAt: now,
        updatedAt: now,
        tags: [],
        isPinned: false,
      };

      setVault((prev) => ({
        ...prev,
        notes: { ...prev.notes, [newId]: newNote },
        activeNoteId: newId,
        activeView: 'editor',
      }));
    },
    []
  );

  // Create Daily Note
  const handleCreateDailyNote = useCallback((dateStr: string) => {
    const existing = (Object.values(vault.notes) as Note[]).find(
      (n) => n.dailyDate === dateStr || n.title.includes(dateStr)
    );

    if (existing) {
      setVault((prev) => ({ ...prev, activeNoteId: existing.id, activeView: 'editor' }));
    } else {
      const now = new Date().toISOString();
      const newId = `note-daily-${dateStr}`;
      const title = `Daily Note - ${dateStr}`;

      const newNote: Note = {
        id: newId,
        title,
        content: `# 📓 ${title}\n\nReflections and logs for ${dateStr}.\n\n## 🎯 Goals\n- [ ] Task 1\n\n> [!TIP]\n> "Knowledge is connected." #journal #daily`,
        notebookId: 'nb-1',
        sectionId: 'sec-1',
        createdAt: now,
        updatedAt: now,
        tags: ['journal', 'daily'],
        isDailyNote: true,
        dailyDate: dateStr,
      };

      setVault((prev) => ({
        ...prev,
        notes: { ...prev.notes, [newId]: newNote },
        activeNoteId: newId,
        activeView: 'editor',
      }));
    }
  }, [vault.notes]);

  // Update Note
  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setVault((prev) => {
      const existing = prev.notes[id];
      if (!existing) return prev;

      return {
        ...prev,
        notes: {
          ...prev.notes,
          [id]: { ...existing, ...updates },
        },
      };
    });
  };

  // Delete Note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this note permanently?')) {
      setVault((prev) => {
        const nextNotes = { ...prev.notes };
        delete nextNotes[id];
        const remainingIds = Object.keys(nextNotes);
        const nextActiveId = prev.activeNoteId === id ? (remainingIds[0] || null) : prev.activeNoteId;

        return {
          ...prev,
          notes: nextNotes,
          activeNoteId: nextActiveId,
        };
      });
    }
  };

  // Select Note by Title or Create
  const handleOpenNoteByTitle = (targetTitle: string) => {
    const trimmed = targetTitle.trim().toLowerCase();
    const matched = (Object.values(vault.notes) as Note[]).find(
      (n) => n.title.trim().toLowerCase() === trimmed
    );

    if (matched) {
      setVault((prev) => ({ ...prev, activeNoteId: matched.id, activeView: 'editor' }));
    } else {
      handleCreateNote(undefined, undefined, undefined, targetTitle);
    }
  };

  // Convert plain text unlinked mention to [[WikiLink]]
  const handleLinkifyMention = (sourceNoteId: string, mentionText: string) => {
    setVault((prev) => {
      const source = prev.notes[sourceNoteId];
      if (!source) return prev;

      const regex = new RegExp(`\\b${mentionText}\\b`, 'gi');
      const updatedContent = source.content.replace(regex, `[[${mentionText}]]`);

      return {
        ...prev,
        notes: {
          ...prev.notes,
          [sourceNoteId]: {
            ...source,
            content: updatedContent,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  // Pin Note Toggle
  const handleTogglePinNote = (noteId: string) => {
    setVault((prev) => {
      const n = prev.notes[noteId];
      if (!n) return prev;
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [noteId]: { ...n, isPinned: !n.isPinned },
        },
      };
    });
  };

  // Add Tag
  const handleAddTag = (noteId: string, tag: string) => {
    setVault((prev) => {
      const n = prev.notes[noteId];
      if (!n || n.tags.includes(tag)) return prev;
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [noteId]: { ...n, tags: [...n.tags, tag] },
        },
      };
    });
  };

  // Remove Tag
  const handleRemoveTag = (noteId: string, tag: string) => {
    setVault((prev) => {
      const n = prev.notes[noteId];
      if (!n) return prev;
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [noteId]: { ...n, tags: n.tags.filter((t) => t !== tag) },
        },
      };
    });
  };

  // Add Folder
  const handleCreateFolder = (name: string) => {
    const newId = `fold-${Date.now()}`;
    setVault((prev) => ({
      ...prev,
      folders: {
        ...prev.folders,
        [newId]: { id: newId, name, icon: 'Folder' },
      },
    }));
  };

  // Add Notebook
  const handleCreateNotebook = (name: string, color: string) => {
    const newId = `nb-${Date.now()}`;
    setVault((prev) => ({
      ...prev,
      notebooks: {
        ...prev.notebooks,
        [newId]: { id: newId, name, color },
      },
    }));
  };

  // Add Section
  const handleCreateSection = (notebookId: string, name: string) => {
    const newId = `sec-${Date.now()}`;
    setVault((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [newId]: { id: newId, notebookId, name, color: 'text-accent' },
      },
    }));
  };

  // Add Canvas Element
  const handleAddCanvasElement = (elem: Omit<VaultState['canvasElements'][0], 'id'>) => {
    const newElem = { ...elem, id: `canvas-${Date.now()}` };
    setVault((prev) => ({
      ...prev,
      canvasElements: [...prev.canvasElements, newElem],
    }));
  };

  // Update Canvas Element
  const handleUpdateCanvasElement = (id: string, updates: Partial<VaultState['canvasElements'][0]>) => {
    setVault((prev) => ({
      ...prev,
      canvasElements: prev.canvasElements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  };

  // Delete Canvas Element
  const handleDeleteCanvasElement = (id: string) => {
    setVault((prev) => ({
      ...prev,
      canvasElements: prev.canvasElements.filter((el) => el.id !== id),
    }));
  };

  // Import Markdown File
  const handleImportMarkdownFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const title = file.name.replace(/\.md$/i, '');
      handleCreateNote(undefined, undefined, undefined, title);

      // Set content after created
      setTimeout(() => {
        setVault((prev) => {
          if (!prev.activeNoteId) return prev;
          return {
            ...prev,
            notes: {
              ...prev.notes,
              [prev.activeNoteId]: {
                ...prev.notes[prev.activeNoteId],
                content: text,
              },
            },
          };
        });
      }, 50);
    };
    reader.readAsText(file);
  };

  // Global Keyboard Shortcuts (Cmd+K, Cmd+N, Cmd+G, Cmd+B, Cmd+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (cmdKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
      } else if (cmdKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setVault((prev) => ({
          ...prev,
          activeView: prev.activeView === 'graph' ? 'editor' : 'graph',
        }));
      } else if (cmdKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      } else if (cmdKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setVault((prev) => ({ ...prev, activeView: 'daily' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote]);

  const isDark = vault.theme === 'mac-dark';

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col font-sans ${isDark ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* macOS Window Titlebar */}
      <MacTitlebar
        vault={vault}
        onViewChange={(view) => setVault((prev) => ({ ...prev, activeView: view }))}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAIAssistant={() => setIsAiAssistantOpen(true)}
        onOpenExportImport={() => setIsExportModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onToggleTheme={() =>
          setVault((prev) => ({
            ...prev,
            theme: prev.theme === 'mac-dark' ? 'mac-light' : 'mac-dark',
          }))
        }
        onCreateNewNote={() => handleCreateNote()}
        sidebarOpen={sidebarOpen}
      />

      {/* Main macOS Application Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <Sidebar
            vault={vault}
            onSelectNote={(noteId) => setVault((prev) => ({ ...prev, activeNoteId: noteId, activeView: 'editor' }))}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
            onCreateFolder={handleCreateFolder}
            onCreateNotebook={handleCreateNotebook}
            onCreateSection={handleCreateSection}
            onSelectTagFilter={(tag) => setSelectedTag(tag)}
            selectedTag={selectedTag}
          />
        )}

        {/* Center Workspace Content */}
        <div className="flex-1 h-full overflow-hidden flex relative bg-white dark:bg-gray-950">
          {vault.activeView === 'editor' && (
            <Editor
              note={activeNote}
              allNotes={vault.notes}
              onUpdateNote={handleUpdateNote}
              onOpenNoteByTitle={handleOpenNoteByTitle}
              onCreateNewNoteWithTitle={(title) => handleCreateNote(undefined, undefined, undefined, title)}
              editorMode={vault.editorMode}
              onChangeEditorMode={(mode) => setVault((prev) => ({ ...prev, editorMode: mode }))}
            />
          )}

          {vault.activeView === 'graph' && (
            <GraphView
              notes={vault.notes}
              activeNoteId={vault.activeNoteId}
              onOpenNote={(noteId) => setVault((prev) => ({ ...prev, activeNoteId: noteId, activeView: 'editor' }))}
              theme={vault.theme}
            />
          )}

          {vault.activeView === 'canvas' && (
            <CanvasView
              elements={vault.canvasElements}
              connections={vault.canvasConnections}
              notes={vault.notes}
              onAddElement={handleAddCanvasElement}
              onUpdateElement={handleUpdateCanvasElement}
              onDeleteElement={handleDeleteCanvasElement}
              onOpenNote={(noteId) => setVault((prev) => ({ ...prev, activeNoteId: noteId, activeView: 'editor' }))}
            />
          )}

          {vault.activeView === 'daily' && (
            <DailyNotesCalendar
              notes={Object.values(vault.notes)}
              onOpenNote={(noteId) => setVault((prev) => ({ ...prev, activeNoteId: noteId, activeView: 'editor' }))}
              onCreateDailyNote={handleCreateDailyNote}
            />
          )}
        </div>

        {/* Right Inspector Drawer (Active in Editor Mode) */}
        {inspectorOpen && vault.activeView === 'editor' && (
          <RightInspector
            currentNote={activeNote}
            allNotes={vault.notes}
            onOpenNote={(noteId) => setVault((prev) => ({ ...prev, activeNoteId: noteId }))}
            onLinkifyMention={handleLinkifyMention}
            onTogglePinNote={handleTogglePinNote}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />
        )}
      </div>

      {/* Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={Object.values(vault.notes)}
        onOpenNote={(noteId) => setVault((prev) => ({ ...prev, activeNoteId: noteId, activeView: 'editor' }))}
        onCreateNote={() => handleCreateNote()}
        onSwitchView={(view) => setVault((prev) => ({ ...prev, activeView: view }))}
        onExportVault={() => setIsExportModalOpen(true)}
        onToggleTheme={() =>
          setVault((prev) => ({
            ...prev,
            theme: prev.theme === 'mac-dark' ? 'mac-light' : 'mac-dark',
          }))
        }
      />

      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currentNote={activeNote}
        allNotes={Object.values(vault.notes)}
        onAppendToNote={(noteId, text) => {
          const n = vault.notes[noteId];
          if (n) {
            handleUpdateNote(noteId, { content: n.content + text });
          }
        }}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        vault={vault}
        onResetVault={() => {
          const fresh = generateDefaultVault();
          setVault(fresh);
        }}
        onImportMarkdownFile={handleImportMarkdownFile}
      />

      <ShortcutsHelpModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

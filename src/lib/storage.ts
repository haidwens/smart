import JSZip from 'jszip';
import { VaultState, Note, Folder, Notebook, Section, CanvasElement, CanvasConnection } from '../types';

const VAULT_STORAGE_KEY = 'nexus_mac_vault_v1';

export const DEFAULT_NOTEBOOKS: Notebook[] = [
  { id: 'nb-1', name: '🧠 Knowledge Base', color: 'bg-blue-500' },
  { id: 'nb-2', name: '💼 Work & Projects', color: 'bg-purple-500' },
  { id: 'nb-3', name: '🎨 Ideas & Creative', color: 'bg-emerald-500' },
];

export const DEFAULT_SECTIONS: Section[] = [
  { id: 'sec-1', notebookId: 'nb-1', name: 'Getting Started', color: 'text-blue-500' },
  { id: 'sec-2', notebookId: 'nb-1', name: 'Concepts & Links', color: 'text-sky-500' },
  { id: 'sec-3', notebookId: 'nb-2', name: 'Architecture 2026', color: 'text-purple-500' },
  { id: 'sec-4', notebookId: 'nb-2', name: 'Meetings', color: 'text-indigo-500' },
];

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'fold-1', name: '01 - Core Guides', icon: 'Folder' },
  { id: 'fold-2', name: '02 - System Specs', icon: 'Cpu' },
  { id: 'fold-3', name: '03 - Journal Logs', icon: 'BookOpen' },
];

export function generateDefaultVault(): VaultState {
  const now = new Date().toISOString();
  const todayStr = new Date().toISOString().split('T')[0];

  const defaultNotes: Note[] = [
    {
      id: 'note-welcome',
      title: 'Welcome to Nexus Notes (Mac)',
      content: `# 🍎 Welcome to Nexus Notes for Mac

Nexus Notes is a next-generation macOS knowledge management application that bridges **Obsidian's bi-directional graph** with **OneNote's intuitive notebook hierarchy** and offline-first performance.

> [!NOTE] Quick Start
> All your notes are saved **100% locally** in your browser offline storage. You can export your vault as Markdown files or a ZIP archive at any time.

---

## 🔗 Key Capabilities

### 1. Bi-Directional Linking
Connect notes effortlessly using wiki syntax:
Try clicking or hovering over this link: [[Obsidian vs OneNote Synthesis]] or [[Architecture Spec]].

If you reference a note that doesn't exist yet, like [[Future Vision 2030]], Nexus Notes will let you create it with one click!

### 2. Dual Views: Graph & OneNote Canvas
- Click **Graph View** (or press \`Cmd+G\`) in the toolbar to see an interactive physics visualization of note connections.
- Click **Canvas Board** to organize floating cards, stickies, and connections on an infinite surface.

### 3. Rich Markdown & Math
- Math Equations: $E = mc^2$ and $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
- Task Lists:
  - [x] Launch Nexus Notes Mac App
  - [x] Configure Bi-Directional Links engine
  - [ ] Connect daily journaling with [[Journal Entry]]

> [!TIP] Pro Keyboard Shortcut
> Press \`Cmd+K\` (or \`Ctrl+K\`) anywhere to launch the macOS Quick Switcher command palette!`,
      notebookId: 'nb-1',
      sectionId: 'sec-1',
      folderId: 'fold-1',
      createdAt: now,
      updatedAt: now,
      tags: ['guide', 'mac', 'obsidian', 'onenote'],
      isPinned: true,
    },
    {
      id: 'note-synthesis',
      title: 'Obsidian vs OneNote Synthesis',
      content: `# 🧠 Obsidian + OneNote Paradigm

Why choose between a **flexible canvas notebook** and a **graph of connected ideas**? Nexus Notes combines both into a seamless macOS desktop experience.

## 🔗 Connected Notes
This note is linked from [[Welcome to Nexus Notes (Mac)]] and references [[Architecture Spec]].

> [!SUCCESS] Highlights
> 1. **Obsidian Powers**: Markdown-first format, \`[[wikilinks]]\`, backlinks inspector, interactive graph view, tag filtering (#knowledge).
> 2. **OneNote Powers**: Notebook > Section > Page hierarchy, sticky notes canvas, tabbed layouts, and color coding.

## 💡 Use Cases
- Research knowledge graphs
- Software engineering specs
- Meeting minutes with [[Meeting Notes - July 2026]]
- Daily thoughts in [[Journal Entry]]`,
      notebookId: 'nb-1',
      sectionId: 'sec-2',
      folderId: 'fold-1',
      createdAt: now,
      updatedAt: now,
      tags: ['knowledge', 'architecture', 'graph'],
      isPinned: true,
    },
    {
      id: 'note-architecture',
      title: 'Architecture Spec',
      content: `# 🏗️ Nexus Architecture Specification

This specification outlines the client-side architecture powering Nexus Notes.

## ⚙️ Core Technical Modules
\`\`\`typescript
interface KnowledgeEngine {
  parseWikiLinks(markdown: string): WikiLink[];
  calculateBacklinks(noteId: string): Backlinks;
  renderPhysicsGraph(nodes: GraphNode[]): void;
  exportVaultToZip(): Promise<Blob>;
}
\`\`\`

## 📊 Performance Benchmark
| Component | Storage Type | Latency | Status |
| :--- | :--- | :--- | :--- |
| Vault Engine | IndexedDB / LocalStorage | < 2ms | ⚡ Instant |
| Link Parsing | Regex & AST | < 1ms | 🚀 Realtime |
| Physics Graph | HTML5 Canvas | 60 FPS | 🎨 Smooth |

Linked back to [[Welcome to Nexus Notes (Mac)]] and [[Obsidian vs OneNote Synthesis]].`,
      notebookId: 'nb-2',
      sectionId: 'sec-3',
      folderId: 'fold-2',
      createdAt: now,
      updatedAt: now,
      tags: ['tech', 'architecture', 'spec'],
      isPinned: false,
    },
    {
      id: 'note-meeting',
      title: 'Meeting Notes - July 2026',
      content: `# 📅 Team Sync - July 2026

**Attendees**: Alex, Sophia, Marcus
**Topic**: Product Launch for Mac Native App

## 📝 Key Discussion Points
1. Finalize offline storage sync with local backups.
2. Confirm [[Architecture Spec]] support for LaTeX formulas.
3. Prepare marketing demo linked to [[Welcome to Nexus Notes (Mac)]].

> [!WARNING] Action Item
> Marcus to verify export to Markdown ZIP archive.`,
      notebookId: 'nb-2',
      sectionId: 'sec-4',
      createdAt: now,
      updatedAt: now,
      tags: ['meeting', 'work'],
      isPinned: false,
    },
    {
      id: `note-daily-${todayStr}`,
      title: `Daily Note - ${todayStr}`,
      content: `# 📓 Journal Entry: ${todayStr}

Today's focus and reflections logged in Nexus Notes.

## 🎯 Today's Goals
- [x] Review [[Architecture Spec]]
- [x] Test bi-directional link navigation
- [ ] Write summary in [[Obsidian vs OneNote Synthesis]]

> [!TIP] Reflection
> "Knowledge grows when linked together." #journal #daily`,
      notebookId: 'nb-1',
      sectionId: 'sec-1',
      folderId: 'fold-3',
      createdAt: now,
      updatedAt: now,
      tags: ['journal', 'daily'],
      isDailyNote: true,
      dailyDate: todayStr,
      isPinned: false,
    },
  ];

  const notesRecord: Record<string, Note> = {};
  defaultNotes.forEach((n) => {
    notesRecord[n.id] = n;
  });

  const foldersRecord: Record<string, Folder> = {};
  DEFAULT_FOLDERS.forEach((f) => {
    foldersRecord[f.id] = f;
  });

  const notebooksRecord: Record<string, Notebook> = {};
  DEFAULT_NOTEBOOKS.forEach((nb) => {
    notebooksRecord[nb.id] = nb;
  });

  const sectionsRecord: Record<string, Section> = {};
  DEFAULT_SECTIONS.forEach((sec) => {
    sectionsRecord[sec.id] = sec;
  });

  const defaultCanvasElements: CanvasElement[] = [
    {
      id: 'canvas-1',
      type: 'sticky',
      x: 100,
      y: 80,
      width: 220,
      height: 160,
      title: '📌 Core Philosophy',
      content: 'Bi-directional graph meets OneNote canvas!',
      color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100',
    },
    {
      id: 'canvas-2',
      type: 'note',
      x: 380,
      y: 80,
      width: 280,
      height: 180,
      noteId: 'note-welcome',
      title: 'Welcome Note',
      content: 'Click to view or double click to edit note.',
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100',
    },
    {
      id: 'canvas-3',
      type: 'sticky',
      x: 240,
      y: 300,
      width: 240,
      height: 140,
      title: '⚡ Offline First',
      content: 'All data stays on your Mac in local browser storage.',
      color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100',
    },
  ];

  const defaultCanvasConnections: CanvasConnection[] = [
    { id: 'conn-1', fromId: 'canvas-1', toId: 'canvas-2', label: 'Powers', color: '#3b82f6' },
    { id: 'conn-2', fromId: 'canvas-2', toId: 'canvas-3', label: 'Guarantees', color: '#10b981' },
  ];

  return {
    id: 'vault-default',
    name: 'Nexus Mac Vault',
    notes: notesRecord,
    folders: foldersRecord,
    notebooks: notebooksRecord,
    sections: sectionsRecord,
    canvasElements: defaultCanvasElements,
    canvasConnections: defaultCanvasConnections,
    activeNoteId: 'note-welcome',
    activeView: 'editor',
    editorMode: 'split',
    theme: 'mac-dark',
  };
}

/**
 * Load Vault State from LocalStorage
 */
export function loadVault(): VaultState {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) {
      const initial = generateDefaultVault();
      saveVault(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as VaultState;
    return parsed;
  } catch (err) {
    console.error('Failed to load vault from localStorage, resetting:', err);
    const initial = generateDefaultVault();
    saveVault(initial);
    return initial;
  }
}

/**
 * Save Vault State to LocalStorage
 */
export function saveVault(vault: VaultState): void {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
  } catch (err) {
    console.error('Failed to save vault to localStorage:', err);
  }
}

/**
 * Export entire Vault as a ZIP file containing Markdown files
 */
export async function exportVaultToZip(vault: VaultState): Promise<void> {
  const zip = new JSZip();

  // Root folder
  const vaultFolder = zip.folder(vault.name || 'NexusVault')!;

  // Group notes into subfolders or root
  Object.values(vault.notes).forEach((note) => {
    let folderPath = '';
    if (note.folderId && vault.folders[note.folderId]) {
      folderPath = vault.folders[note.folderId].name + '/';
    } else if (note.notebookId && vault.notebooks[note.notebookId]) {
      const nbName = vault.notebooks[note.notebookId].name.replace(/[^\w\s-]/gi, '').trim();
      folderPath = `${nbName}/`;
    }

    const sanitizedTitle = note.title.replace(/[\\/:*?"<>|]/g, '_') || 'Untitled';
    const fileName = `${folderPath}${sanitizedTitle}.md`;

    // Metadata frontmatter
    const frontmatter = `---
title: "${note.title.replace(/"/g, '\\"')}"
created: ${note.createdAt}
updated: ${note.updatedAt}
tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]
---

`;

    vaultFolder.file(fileName, frontmatter + note.content);
  });

  // Save vault backup JSON inside zip too
  vaultFolder.file('nexus_vault_backup.json', JSON.stringify(vault, null, 2));

  // Generate blob and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(vault.name || 'NexusVault').toLowerCase().replace(/\s+/g, '_')}_export.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Vault as a standalone JSON backup
 */
export function exportVaultJson(vault: VaultState): void {
  const jsonStr = JSON.stringify(vault, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string; // Optional folder path
  notebookId?: string; // OneNote style notebook grouping
  sectionId?: string; // OneNote style section grouping
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPinned?: boolean;
  isDailyNote?: boolean;
  dailyDate?: string; // YYYY-MM-DD
  color?: string; // Optional accent color
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Section {
  id: string;
  notebookId: string;
  name: string;
  color: string;
}

export interface BacklinkItem {
  sourceNoteId: string;
  sourceNoteTitle: string;
  contextSnippet: string; // Excerpt around the [[link]]
  isUnlinked?: boolean; // True if plain text match instead of [[link]]
}

export interface GraphNode {
  id: string;
  title: string;
  backlinkCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  color?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface CanvasElement {
  id: string;
  type: 'note' | 'text' | 'sticky' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  content: string;
  color?: string;
  noteId?: string;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

export interface VaultState {
  id: string;
  name: string;
  notes: Record<string, Note>;
  folders: Record<string, Folder>;
  notebooks: Record<string, Notebook>;
  sections: Record<string, Section>;
  canvasElements: CanvasElement[];
  canvasConnections: CanvasConnection[];
  activeNoteId: string | null;
  activeView: 'editor' | 'graph' | 'canvas' | 'daily' | 'search';
  editorMode: 'live' | 'split' | 'edit' | 'preview';
  theme: 'mac-dark' | 'mac-light';
}

export interface SearchFilter {
  query: string;
  tag?: string;
  folderId?: string;
  notebookId?: string;
  onlyDaily?: boolean;
}

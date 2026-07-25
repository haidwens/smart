import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Code,
  Quote,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Link2,
  Mic,
  MicOff,
  Image as ImageIcon,
  Columns,
  Eye,
  Edit3,
  Sparkles,
  Paperclip,
  Calculator,
  AlertTriangle,
} from 'lucide-react';
import { Note } from '../types';
import { renderMarkdownToHtml } from '../lib/markdown';
import { WikiLinkAutocomplete } from './WikiLinkAutocomplete';
import { WikiLinkPreview } from './WikiLinkPreview';

interface EditorProps {
  note: Note | null;
  allNotes: Record<string, Note>;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onOpenNoteByTitle: (title: string) => void;
  onCreateNewNoteWithTitle: (title: string) => void;
  editorMode: 'live' | 'split' | 'edit' | 'preview';
  onChangeEditorMode: (mode: 'live' | 'split' | 'edit' | 'preview') => void;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  allNotes,
  onUpdateNote,
  onOpenNoteByTitle,
  onCreateNewNoteWithTitle,
  editorMode,
  onChangeEditorMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // WikiLink Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePos, setAutocompletePos] = useState({ top: 0, left: 0 });

  // WikiLink Hover Preview state
  const [hoverPreviewNote, setHoverPreviewNote] = useState<Note | null>(null);
  const [hoverTargetTitle, setHoverTargetTitle] = useState('');
  const [hoverPreviewPos, setHoverPreviewPos] = useState({ top: 0, left: 0 });

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!note) {
    return (
      <div className="flex-1 h-full bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center text-gray-400 select-none">
        <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4 text-2xl font-bold">
          🍎
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Nexus Notes for Mac</h2>
        <p className="max-w-md text-xs leading-relaxed text-gray-500 mb-6">
          Select an existing note from the sidebar or press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-mono text-gray-700 dark:text-gray-300">Cmd+N</kbd> to create a new note with bi-directional links.
        </p>
      </div>
    );
  }

  const existingNoteTitles = new Set(
    (Object.values(allNotes) as Note[]).map((n) => n.title.toLowerCase().trim())
  );

  // Handle Textarea change & WikiLink detection
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onUpdateNote(note.id, { content: val, updatedAt: new Date().toISOString() });

    // Check cursor position for [[ autocomplete
    const cursor = e.target.selectionStart;
    const textBefore = val.substring(0, cursor);
    const lastDoubleBracket = textBefore.lastIndexOf('[[');

    if (lastDoubleBracket !== -1 && lastDoubleBracket >= cursor - 30) {
      const query = textBefore.substring(lastDoubleBracket + 2);
      if (!query.includes(']]') && !query.includes('\n')) {
        setAutocompleteQuery(query);
        setShowAutocomplete(true);

        // Approximate position
        if (textareaRef.current) {
          const rect = textareaRef.current.getBoundingClientRect();
          setAutocompletePos({
            top: rect.top + 120,
            left: rect.left + 40,
          });
        }
        return;
      }
    }

    setShowAutocomplete(false);
  };

  // Insert markdown snippet into editor
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = note.content;
    const selected = current.substring(start, end);

    const replacement = `${before}${selected || 'text'}${after}`;
    const updated = current.substring(0, start) + replacement + current.substring(end);

    onUpdateNote(note.id, { content: updated, updatedAt: new Date().toISOString() });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selected ? selected.length : 4)
      );
    }, 50);
  };

  // Select item from WikiLink Autocomplete
  const handleSelectAutocomplete = (title: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const val = note.content;
    const cursor = textarea.selectionStart;
    const textBefore = val.substring(0, cursor);
    const lastDoubleBracket = textBefore.lastIndexOf('[[');

    if (lastDoubleBracket !== -1) {
      const updated =
        val.substring(0, lastDoubleBracket) +
        `[[${title}]]` +
        val.substring(cursor);

      onUpdateNote(note.id, { content: updated, updatedAt: new Date().toISOString() });
    }

    setShowAutocomplete(false);
  };

  // Handle click on rendered [[WikiLinks]] or #tags
  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikilinkEl = target.closest('.wikilink') as HTMLElement | null;

    if (wikilinkEl) {
      const rawTitle = wikilinkEl.getAttribute('data-wikilink-title');
      if (rawTitle) {
        const decodedTitle = decodeURIComponent(rawTitle);
        onOpenNoteByTitle(decodedTitle);
      }
    }
  };

  // Handle Mouseover for Hover Preview
  const handlePreviewMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const wikilinkEl = target.closest('.wikilink') as HTMLElement | null;

    if (wikilinkEl) {
      const rawTitle = wikilinkEl.getAttribute('data-wikilink-title');
      if (rawTitle) {
        const title = decodeURIComponent(rawTitle);
        const matchedNote = (Object.values(allNotes) as Note[]).find(
          (n) => n.title.toLowerCase().trim() === title.toLowerCase().trim()
        );

        setHoverTargetTitle(title);
        setHoverPreviewNote(matchedNote || null);

        const rect = wikilinkEl.getBoundingClientRect();
        setHoverPreviewPos({ top: rect.bottom, left: rect.left });
      }
    }
  };

  // Voice Note Recorder Logic
  const toggleRecordVoiceNote = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Append audio element markdown to note
          const audioMarkdown = `\n\n🎙️ **Voice Note (${new Date().toLocaleTimeString()})**:\n<audio controls src="${audioUrl}" class="w-full my-2"></audio>\n`;
          onUpdateNote(note.id, {
            content: note.content + audioMarkdown,
            updatedAt: new Date().toISOString(),
          });
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert('Microphone access unavailable or denied in browser.');
      }
    }
  };

  const renderedHtml = renderMarkdownToHtml(note.content, existingNoteTitles);

  return (
    <div className="flex-1 h-full bg-white dark:bg-[#121212] flex flex-col overflow-hidden select-text relative">
      {/* Editor Header Path & Breadcrumbs */}
      <div className="h-10 px-6 sm:px-8 flex items-center justify-between border-b border-[#F0F0F0] dark:border-[#2C2C2E] shrink-0 bg-white dark:bg-[#121212]">
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="text-[11px] text-gray-400 font-mono truncate">
            {note.folderId ? `Vault / Folder / ${note.title}.md` : `Vault / ${note.title}.md`}
          </span>
          <div className="px-2 py-0.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded text-[10px] text-[#5856D6] dark:text-[#A5A6F6] font-medium uppercase tracking-tight shrink-0">
            Markdown
          </div>
        </div>

        {/* Editor Mode Switcher Pills */}
        <div className="flex items-center bg-[#F2F2F2] dark:bg-[#2C2C2E] p-0.5 rounded border border-[#E0E0E0] dark:border-[#3A3A3C]">
          <button
            onClick={() => onChangeEditorMode('split')}
            className={`p-1 rounded transition-all ${
              editorMode === 'split'
                ? 'bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-2xs'
                : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
            title="Split Mode (Side-by-side Edit & Live Preview)"
          >
            <Columns size={13} />
          </button>
          <button
            onClick={() => onChangeEditorMode('edit')}
            className={`p-1 rounded transition-all ${
              editorMode === 'edit'
                ? 'bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-2xs'
                : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
            title="Markdown Source Edit Mode"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={() => onChangeEditorMode('preview')}
            className={`p-1 rounded transition-all ${
              editorMode === 'preview'
                ? 'bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-2xs'
                : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
            title="Rendered Document Preview Mode"
          >
            <Eye size={13} />
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="h-9 border-b border-[#F0F0F0] dark:border-[#2C2C2E] px-4 flex items-center justify-between bg-[#FAFAFA] dark:bg-[#18181A] select-none text-[12px]">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => insertMarkdown('**', '**')}
            title="Bold (**text**)"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Bold size={13} />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            title="Italic (*text*)"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Italic size={13} />
          </button>
          <button
            onClick={() => insertMarkdown('# ')}
            title="Header 1"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Heading1 size={13} />
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            title="Header 2"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Heading2 size={13} />
          </button>

          <div className="h-3.5 w-[1px] bg-[#E0E0E0] dark:bg-[#3A3A3C] mx-1" />

          <button
            onClick={() => insertMarkdown('[[', ']]')}
            title="Insert Bi-directional WikiLink [[Note]]"
            className="px-2 py-0.5 rounded bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 text-[11px] font-semibold flex items-center gap-1"
          >
            <Link2 size={12} />
            <span>[[WikiLink]]</span>
          </button>

          <button
            onClick={() => insertMarkdown('- [ ] ')}
            title="Insert Checkbox List"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <CheckSquare size={13} />
          </button>

          <button
            onClick={() => insertMarkdown('> [!NOTE] ')}
            title="Insert Callout Block"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Quote size={13} />
          </button>

          <button
            onClick={() => insertMarkdown('```typescript\n', '\n```')}
            title="Insert Code Block"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Code size={13} />
          </button>

          <button
            onClick={() => insertMarkdown('$$ ', ' $$')}
            title="Insert LaTeX Math Equation"
            className="p-1 rounded hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]"
          >
            <Calculator size={13} />
          </button>

          {/* Voice Memo Recorder */}
          <button
            onClick={toggleRecordVoiceNote}
            title={isRecording ? "Stop Recording Voice Memo" : "Record Voice Memo Audio"}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] text-[#4A4A4A] dark:text-[#A1A1A6]'
            }`}
          >
            {isRecording ? <MicOff size={12} /> : <Mic size={12} />}
            <span>{isRecording ? 'Recording...' : 'Voice Note'}</span>
          </button>
        </div>
      </div>

      {/* Main Writing / Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Main Source Textarea */}
        {(editorMode === 'split' || editorMode === 'edit') && (
          <div className="flex-1 h-full px-8 md:px-12 pt-8 pb-20 overflow-y-auto">
            <input
              type="text"
              value={note.title}
              onChange={(e) =>
                onUpdateNote(note.id, {
                  title: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              placeholder="Note Title..."
              className="w-full text-3xl md:text-4xl font-bold bg-transparent border-0 outline-none text-[#1D1D1F] dark:text-white placeholder-gray-300 dark:placeholder-gray-700 tracking-tight mb-6"
            />
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={handleContentChange}
              placeholder="Type markdown, equations, or [[WikiLinks]] here..."
              className="w-full h-[calc(100%-4rem)] bg-transparent border-0 outline-none resize-none font-mono text-[14px] leading-relaxed text-[#3A3A3C] dark:text-[#E5E5EA] placeholder-gray-400 dark:placeholder-gray-600"
            />
          </div>
        )}

        {/* Right/Main Rendered Preview */}
        {(editorMode === 'split' || editorMode === 'preview') && (
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            onMouseOver={handlePreviewMouseOver}
            className={`flex-1 h-full px-8 md:px-16 pt-8 pb-20 overflow-y-auto border-[#F0F0F0] dark:border-[#2C2C2E] ${
              editorMode === 'split' ? 'border-l' : ''
            }`}
          >
            {editorMode === 'preview' && (
              <h1 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] dark:text-white mb-6 tracking-tight">
                {note.title}
              </h1>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              className="prose dark:prose-invert max-w-none text-[16px] leading-relaxed text-[#3A3A3C] dark:text-[#E5E5EA]"
            />
          </div>
        )}
      </div>

      {/* WikiLink Autocomplete Dropdown */}
      {showAutocomplete && (
        <WikiLinkAutocomplete
          query={autocompleteQuery}
          notes={Object.values(allNotes)}
          onSelectNote={handleSelectAutocomplete}
          onCreateNewNote={(title) => {
            onCreateNewNoteWithTitle(title);
            setShowAutocomplete(false);
          }}
          onClose={() => setShowAutocomplete(false)}
          position={autocompletePos}
        />
      )}

      {/* WikiLink Hover Preview */}
      {hoverTargetTitle && (
        <WikiLinkPreview
          note={hoverPreviewNote}
          targetTitle={hoverTargetTitle}
          position={hoverPreviewPos}
          onOpenNote={(targetId) => {
            onOpenNoteByTitle(allNotes[targetId]?.title || hoverTargetTitle);
            setHoverTargetTitle('');
          }}
          onCreateNewNote={(title) => {
            onCreateNewNoteWithTitle(title);
            setHoverTargetTitle('');
          }}
          onClose={() => setHoverTargetTitle('')}
        />
      )}
    </div>
  );
};

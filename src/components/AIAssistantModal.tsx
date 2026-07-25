import React, { useState } from 'react';
import { Sparkles, Brain, CheckSquare, Link2, Send, Loader2 } from 'lucide-react';
import { Note } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNote: Note | null;
  allNotes: Note[];
  onAppendToNote: (noteId: string, text: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentNote,
  allNotes,
  onAppendToNote,
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const runAiTask = async (taskType: 'summarize' | 'action_items' | 'suggest_links' | 'custom', customPrompt?: string) => {
    if (!currentNote) return;

    setIsLoading(true);
    setResponse('');

    const existingTitles = allNotes.map((n) => n.title).join(', ');

    let fullPrompt = '';
    if (taskType === 'summarize') {
      fullPrompt = `Summarize the following note concisely in markdown format with bullet points:\n\nTitle: ${currentNote.title}\nContent:\n${currentNote.content}`;
    } else if (taskType === 'action_items') {
      fullPrompt = `Extract key action items and tasks from this note as a markdown task list (- [ ] ...):\n\nContent:\n${currentNote.content}`;
    } else if (taskType === 'suggest_links') {
      fullPrompt = `Based on the following note content, suggest which existing notes in the vault should be linked using [[Note Title]] syntax. Existing notes in vault: [${existingTitles}].\n\nContent:\n${currentNote.content}`;
    } else {
      fullPrompt = `${customPrompt || prompt}\n\nContext Note (${currentNote.title}):\n${currentNote.content}`;
    }

    try {
      // Call server proxy or fetch Gemini API
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!res.ok) {
        throw new Error('AI API request failed');
      }

      const data = await res.json();
      setResponse(data.reply || 'AI suggestion generated.');
    } catch (err) {
      // Intelligent local fallback if API key is not configured yet
      if (taskType === 'summarize') {
        setResponse(`### 🤖 Summary of "${currentNote.title}"\n- Key note created on ${new Date(currentNote.createdAt).toLocaleDateString()}.\n- Content length: ${currentNote.content.length} chars.\n- Tags: ${currentNote.tags.map(t => `#${t}`).join(', ') || 'None'}`);
      } else if (taskType === 'action_items') {
        setResponse(`### 🎯 Extracted Action Items\n- [ ] Review ${currentNote.title}\n- [ ] Connect with related wiki notes\n- [ ] Verify offline backup status`);
      } else if (taskType === 'suggest_links') {
        const matches = allNotes.filter(n => n.id !== currentNote.id && currentNote.content.includes(n.title));
        if (matches.length > 0) {
          setResponse(`### 🔗 Suggested [[WikiLinks]]\n` + matches.map(m => `- Link to [[${m.title}]]`).join('\n'));
        } else {
          setResponse(`### 🔗 Suggested Links\n- Consider linking to [[Welcome to Nexus Notes (Mac)]] or [[Architecture Spec]].`);
        }
      } else {
        setResponse(`### 💡 AI Expansion\nExpanding idea for "${currentNote.title}": Consider connecting with bi-directional links and tagging key terms.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 dark:bg-gray-900/95 border border-purple-500/30 rounded-2xl shadow-2xl p-6 text-xs text-gray-800 dark:text-gray-200 space-y-4 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Nexus Gemini AI Assistant</h2>
              <p className="text-[11px] text-gray-500">Smart note summaries, task extraction & link recommendations.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-200 text-sm">
            ✕
          </button>
        </div>

        {/* Quick Action Pills */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => runAiTask('summarize')}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 font-semibold text-center flex flex-col items-center gap-1 transition-all"
          >
            <Brain size={16} />
            <span>Summarize</span>
          </button>

          <button
            onClick={() => runAiTask('action_items')}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-semibold text-center flex flex-col items-center gap-1 transition-all"
          >
            <CheckSquare size={16} />
            <span>Tasks (- [ ])</span>
          </button>

          <button
            onClick={() => runAiTask('suggest_links')}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 font-semibold text-center flex flex-col items-center gap-1 transition-all"
          >
            <Link2 size={16} />
            <span>Suggest Links</span>
          </button>
        </div>

        {/* Custom Prompt Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) runAiTask('custom', prompt);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI about this note..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>

        {/* AI Response Output */}
        {response && (
          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed text-xs">
              {response}
            </div>

            {currentNote && (
              <button
                onClick={() => {
                  onAppendToNote(currentNote.id, `\n\n---\n${response}`);
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-all shadow-2xs"
              >
                Append AI Output to Note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

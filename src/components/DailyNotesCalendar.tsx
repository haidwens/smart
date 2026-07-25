import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Note } from '../types';

interface DailyNotesCalendarProps {
  notes: Note[];
  onOpenNote: (noteId: string) => void;
  onCreateDailyNote: (dateStr: string) => void;
}

export const DailyNotesCalendar: React.FC<DailyNotesCalendarProps> = ({
  notes,
  onOpenNote,
  onCreateDailyNote,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const dailyNotes = notes.filter((n) => n.isDailyNote || n.tags.includes('daily') || n.tags.includes('journal'));

  const matchedNote = dailyNotes.find(
    (n) => n.dailyDate === selectedDate || n.title.includes(selectedDate)
  );

  const handleOpenOrCreate = () => {
    if (matchedNote) {
      onOpenNote(matchedNote.id);
    } else {
      onCreateDailyNote(selectedDate);
    }
  };

  return (
    <div className="flex-1 h-full bg-white dark:bg-gray-950 p-6 overflow-y-auto select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Daily Journal & Calendar</h1>
              <p className="text-xs text-gray-500">Capture daily thoughts, reflections, and tasks linked to your vault.</p>
            </div>
          </div>

          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setSelectedDate(today);
              onCreateDailyNote(today);
            }}
            className="px-3.5 py-2 rounded-xl bg-accent text-white font-semibold text-xs flex items-center gap-2 hover:bg-accent/90 shadow-2xs transition-all"
          >
            <Plus size={14} />
            <span>Today's Daily Note</span>
          </button>
        </div>

        {/* Date Selector Card */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
            />
            <span className="text-xs text-gray-500">Selected Date Log</span>
          </div>

          <button
            onClick={handleOpenOrCreate}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              matchedNote
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {matchedNote ? 'Open Note for ' + selectedDate : 'Create Daily Note for ' + selectedDate}
          </button>
        </div>

        {/* Existing Journal Entries List */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            <span>Recent Journal Entries</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dailyNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onOpenNote(note.id)}
                className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-accent/50 cursor-pointer transition-all shadow-2xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {note.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">
                    {note.dailyDate || 'Journal'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {note.content.replace(/#.*$/gm, '').trim() || 'Empty journal entry.'}
                </p>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={11} />
                  <span>Last edit {new Date(note.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

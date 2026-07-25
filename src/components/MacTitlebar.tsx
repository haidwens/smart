import React from 'react';
import {
  FileText,
  Network,
  Layout,
  Calendar,
  Search,
  Download,
  Moon,
  Sun,
  Sparkles,
  HelpCircle,
  Sidebar as SidebarIcon,
  Plus,
} from 'lucide-react';
import { VaultState } from '../types';

interface MacTitlebarProps {
  vault: VaultState;
  onViewChange: (view: VaultState['activeView']) => void;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenAIAssistant: () => void;
  onOpenExportImport: () => void;
  onOpenShortcuts: () => void;
  onToggleTheme: () => void;
  onCreateNewNote: () => void;
  sidebarOpen: boolean;
}

export const MacTitlebar: React.FC<MacTitlebarProps> = ({
  vault,
  onViewChange,
  onToggleSidebar,
  onOpenCommandPalette,
  onOpenAIAssistant,
  onOpenExportImport,
  onOpenShortcuts,
  onToggleTheme,
  onCreateNewNote,
  sidebarOpen,
}) => {
  const isDark = vault.theme === 'mac-dark';

  return (
    <div className="h-10 border-b select-none flex items-center justify-between px-4 bg-[#F2F2F2] dark:bg-[#1C1C1E] border-[#E5E5E5] dark:border-[#2C2C2E] transition-colors z-20 sticky top-0 shrink-0">
      {/* Left: Traffic Lights & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {/* macOS Traffic Light Buttons */}
        <div className="flex items-center gap-2 group">
          <button
            title="Close Window"
            className="w-3 h-3 rounded-full bg-[#FF5F57] flex items-center justify-center transition-all"
          >
            <span className="text-[8px] text-rose-950 font-bold opacity-0 group-hover:opacity-100">×</span>
          </button>
          <button
            title="Minimize Window"
            className="w-3 h-3 rounded-full bg-[#FFBD2E] flex items-center justify-center transition-all"
          >
            <span className="text-[8px] text-amber-950 font-bold opacity-0 group-hover:opacity-100">−</span>
          </button>
          <button
            title="Expand Window"
            className="w-3 h-3 rounded-full bg-[#28C840] flex items-center justify-center transition-all"
          >
            <span className="text-[8px] text-emerald-950 font-bold opacity-0 group-hover:opacity-100">+</span>
          </button>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Hide Sidebar (Cmd+B)" : "Show Sidebar (Cmd+B)"}
          className={`p-1 rounded text-[#6B6B6B] dark:text-[#A1A1A6] hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] transition-all ${
            sidebarOpen ? 'bg-[#E5E5E5] dark:bg-[#2C2C2E]' : ''
          }`}
        >
          <SidebarIcon size={14} />
        </button>

        {/* Quick New Note Button */}
        <button
          onClick={onCreateNewNote}
          title="New Note (Cmd+N)"
          className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-md bg-[#007AFF] text-white hover:bg-[#0062CC] transition-all active:scale-95"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>

      {/* Center: Title / View Mode Switcher Pills */}
      <div className="flex items-center bg-[#E5E5E5]/60 dark:bg-[#2C2C2E]/60 p-0.5 rounded-md border border-[#E0E0E0] dark:border-[#3A3A3C]">
        <button
          onClick={() => onViewChange('editor')}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium transition-all ${
            vault.activeView === 'editor'
              ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#6B6B6B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
        >
          <FileText size={13} />
          <span>Editor</span>
        </button>

        <button
          onClick={() => onViewChange('graph')}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium transition-all ${
            vault.activeView === 'graph'
              ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#6B6B6B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
        >
          <Network size={13} />
          <span>Graph</span>
        </button>

        <button
          onClick={() => onViewChange('canvas')}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium transition-all ${
            vault.activeView === 'canvas'
              ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#6B6B6B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
        >
          <Layout size={13} />
          <span className="hidden md:inline">Canvas</span>
        </button>

        <button
          onClick={() => onViewChange('daily')}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium transition-all ${
            vault.activeView === 'daily'
              ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white shadow-2xs'
              : 'text-[#6B6B6B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
          }`}
        >
          <Calendar size={13} />
          <span className="hidden md:inline">Daily</span>
        </button>
      </div>

      {/* Right: Quick Search, AI Assistant, Export & Theme Toggle */}
      <div className="flex items-center gap-1.5">
        {/* Cmd+K Quick Search Palette */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-[#2C2C2E] border border-[#E0E0E0] dark:border-[#3A3A3C] text-[12px] text-[#6B6B6B] dark:text-[#A1A1A6] hover:bg-[#F8F8F8] dark:hover:bg-[#3A3A3C] transition-all shadow-2xs"
          title="Quick Switcher / Search (Cmd+K)"
        >
          <Search size={13} className="text-gray-400" />
          <span className="hidden lg:inline text-gray-400">Search notes...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-[#F2F2F2] dark:bg-[#1C1C1E] text-[10px] rounded text-[#8E8E93] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIAssistant}
          className="p-1 rounded-md text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-all"
          title="Nexus AI Smart Assistant"
        >
          <Sparkles size={14} />
        </button>

        {/* Export / Backup Vault */}
        <button
          onClick={onOpenExportImport}
          className="p-1 rounded-md text-[#6B6B6B] dark:text-[#A1A1A6] hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] transition-all"
          title="Export / Backup Vault (ZIP/JSON)"
        >
          <Download size={14} />
        </button>

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={onOpenShortcuts}
          className="p-1 rounded-md text-[#6B6B6B] dark:text-[#A1A1A6] hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] transition-all"
          title="Mac Shortcuts Guide (Cmd+?)"
        >
          <HelpCircle size={14} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1 rounded-md text-[#6B6B6B] dark:text-[#A1A1A6] hover:bg-[#EBEBEB] dark:hover:bg-[#2C2C2E] transition-all"
          title={isDark ? "Switch to Mac Light Mode" : "Switch to Mac Dark Mode"}
        >
          {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-500" />}
        </button>
      </div>
    </div>
  );
};

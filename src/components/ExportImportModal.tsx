import React, { useState } from 'react';
import { Download, Upload, HardDrive, RefreshCw, AlertCircle, FileArchive } from 'lucide-react';
import { VaultState } from '../types';
import { exportVaultToZip, exportVaultJson } from '../lib/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: VaultState;
  onResetVault: () => void;
  onImportMarkdownFile: (file: File) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  vault,
  onResetVault,
  onImportMarkdownFile,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleZipExport = async () => {
    setIsExporting(true);
    await exportVaultToZip(vault);
    setIsExporting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        onImportMarkdownFile(files[i]);
      }
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 dark:bg-gray-900/95 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl p-6 text-xs text-gray-800 dark:text-gray-200 space-y-5 animate-in zoom-in-95 duration-150"
      >
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/15 text-accent">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Vault Offline Backup & Sync</h2>
              <p className="text-[11px] text-gray-500">100% offline local storage in your Mac browser.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">
            ✕
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
            Export Options
          </div>

          <button
            onClick={handleZipExport}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl bg-accent text-white font-semibold flex items-center justify-between hover:bg-accent/90 shadow-2xs transition-all active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <FileArchive size={18} />
              <div className="text-left">
                <div className="text-xs font-bold">Export Vault as ZIP Archive</div>
                <div className="text-[10px] opacity-80">Contains standard .md Markdown files with YAML metadata</div>
              </div>
            </div>
            <Download size={16} />
          </button>

          <button
            onClick={() => exportVaultJson(vault)}
            className="w-full p-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Download size={18} className="text-sky-500" />
              <div className="text-left">
                <div className="text-xs font-bold">Export JSON Backup</div>
                <div className="text-[10px] text-gray-400">Single JSON backup file for instant restoration</div>
              </div>
            </div>
          </button>
        </div>

        {/* Import Option */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
            Import Local Markdown Files
          </div>

          <label className="w-full p-3.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-accent flex items-center justify-center gap-2 cursor-pointer bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
            <Upload size={16} className="text-accent" />
            <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">
              Select .md files to import into vault
            </span>
            <input
              type="file"
              accept=".md,.markdown,.text"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Danger Reset */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <AlertCircle size={13} className="text-amber-500" />
            <span>Vault contains {Object.keys(vault.notes).length} notes</span>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset entire vault to default initial notes? All edits will be replaced.')) {
                onResetVault();
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/20 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            <span>Reset Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};

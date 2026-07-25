import React, { useState } from 'react';
import { Download, Upload, HardDrive, RefreshCw, AlertCircle, FileArchive, Apple, Smartphone, PackageCheck } from 'lucide-react';
import { VaultState } from '../types';
import { exportVaultToZip, exportVaultJson } from '../lib/storage';
import { exportMacDeploymentPackage, exportAndroidDeploymentPackage } from '../lib/deployPackage';

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
  const [downloadingMac, setDownloadingMac] = useState(false);
  const [downloadingAndroid, setDownloadingAndroid] = useState(false);

  if (!isOpen) return null;

  const handleZipExport = async () => {
    setIsExporting(true);
    await exportVaultToZip(vault);
    setIsExporting(false);
  };

  const handleMacExport = async () => {
    setDownloadingMac(true);
    await exportMacDeploymentPackage();
    setDownloadingMac(false);
  };

  const handleAndroidExport = async () => {
    setDownloadingAndroid(true);
    await exportAndroidDeploymentPackage();
    setDownloadingAndroid(false);
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
        className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-[#2C2C2E] rounded-2xl shadow-2xl p-6 text-xs text-[#1D1D1F] dark:text-gray-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] dark:border-[#2C2C2E]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] dark:text-white">Vault Sync & Native Apps</h2>
              <p className="text-[11px] text-gray-500">100% offline local vault & cross-platform deployment packages.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">
            ✕
          </button>
        </div>

        {/* Native App Downloads (Mac & Android) */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
            Native App Downloads (Mac & Android)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Mac Package Button */}
            <button
              onClick={handleMacExport}
              disabled={downloadingMac}
              className="p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-[#E0E0E0] dark:border-[#3A3A3C] hover:border-[#007AFF] text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                  <Apple size={16} />
                </div>
                <Download size={14} className="text-[#007AFF] group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-[12px] text-[#1D1D1F] dark:text-white">macOS Desktop Package</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">v1.0.0 (.zip installer for Mac)</div>
              </div>
            </button>

            {/* Android Package Button */}
            <button
              onClick={handleAndroidExport}
              disabled={downloadingAndroid}
              className="p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-[#E0E0E0] dark:border-[#3A3A3C] hover:border-[#34C759] text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-1.5 rounded-lg bg-[#34C759] text-white">
                  <Smartphone size={16} />
                </div>
                <Download size={14} className="text-[#34C759] group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-[12px] text-[#1D1D1F] dark:text-white">Android Mobile Package</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">v1.0.0 (.zip APK / PWA manifest)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Vault Data Export Options */}
        <div className="space-y-2 pt-2 border-t border-[#E5E5E5] dark:border-[#2C2C2E]">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
            Vault Backup & Markdown Export
          </div>

          <button
            onClick={handleZipExport}
            disabled={isExporting}
            className="w-full p-3 rounded-xl bg-[#007AFF] text-white font-semibold flex items-center justify-between hover:bg-[#0062CC] shadow-2xs transition-all active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <FileArchive size={16} />
              <div className="text-left">
                <div className="text-xs font-bold">Export Vault as Markdown ZIP</div>
                <div className="text-[10px] opacity-80">Contains standard .md Markdown files with YAML metadata</div>
              </div>
            </div>
            <Download size={16} />
          </button>

          <button
            onClick={() => exportVaultJson(vault)}
            className="w-full p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-semibold flex items-center justify-between hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <PackageCheck size={16} className="text-sky-500" />
              <div className="text-left">
                <div className="text-xs font-bold">Export JSON Backup</div>
                <div className="text-[10px] text-gray-400">Single JSON backup file for instant restoration</div>
              </div>
            </div>
            <Download size={15} className="text-gray-400" />
          </button>
        </div>

        {/* Import Option */}
        <div className="space-y-2 pt-2 border-t border-[#E5E5E5] dark:border-[#2C2C2E]">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
            Import Local Markdown Files
          </div>

          <label className="w-full p-3 rounded-xl border-2 border-dashed border-[#E0E0E0] dark:border-[#3A3A3C] hover:border-[#007AFF] flex items-center justify-center gap-2 cursor-pointer bg-[#FAFAFA] dark:bg-[#2C2C2E]/40 transition-colors">
            <Upload size={16} className="text-[#007AFF]" />
            <span className="font-semibold text-xs text-[#1D1D1F] dark:text-gray-300">
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
        <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#2C2C2E] flex justify-between items-center">
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


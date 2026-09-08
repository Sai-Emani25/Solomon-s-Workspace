
import React, { useRef } from 'react';
import { Crown, Sparkles, Menu, Download, Upload } from 'lucide-react';
import { CalendarItem, Hackathon } from '../types';
import { sanitizeCalendarItems, sortHackathonsByDeadline } from '../utils/calendarUtils';

const BACKUP_VERSION = '3.0';
const storageFields = [
  ['hubData', 'solomon_hub_v2'],
  ['hackathons', 'solomon_hackathons'],
  ['orderCalendar', 'solomon_order_calendar'],
  ['studyData', 'solomon_study'],
  ['streakData', 'solomon_streak'],
] as const;

type BackupPayload = Record<string, unknown> & { data?: Record<string, unknown> };

const toStorageValue = (storageKey: string, value: unknown): string | null => {
  if (typeof value === 'string') {
    value = JSON.parse(value);
  }
  if (value === undefined || value === null) return null;

  if (storageKey === 'solomon_hackathons') {
    if (!Array.isArray(value)) throw new Error('The hackathons section is not a list.');
    return JSON.stringify(sortHackathonsByDeadline(value as Hackathon[]));
  }
  if (storageKey === 'solomon_order_calendar') {
    if (!Array.isArray(value)) throw new Error('The calendar tasks section is not a list.');
    return JSON.stringify(sanitizeCalendarItems(value as CalendarItem[]));
  }
  return JSON.stringify(value);
};

const readBackup = (payload: BackupPayload) => {
  const source = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const restored: { key: string; value: string }[] = [];

  storageFields.forEach(([backupKey, storageKey]) => {
    const value = source[backupKey];
    if (value === undefined || value === null) return;
    const serialized = toStorageValue(storageKey, value);
    if (serialized !== null) restored.push({ key: storageKey, value: serialized });
  });

  if (restored.length === 0) {
    throw new Error('This file does not contain any Solomon Workspace data.');
  }
  return restored;
};

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      format: 'solomon-workspace-backup',
      version: BACKUP_VERSION,
      exportDate: new Date().toISOString(),
      data: Object.fromEntries(storageFields.map(([backupKey, storageKey]) => [backupKey, localStorage.getItem(storageKey)])),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solomon-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json) as BackupPayload;
        const restored = readBackup(data);
        const hackathonData = restored.find((section) => section.key === 'solomon_hackathons');
        const calendarData = restored.find((section) => section.key === 'solomon_order_calendar');
        const hackathonCount = hackathonData ? JSON.parse(hackathonData.value).length : 0;
        const taskCount = calendarData ? JSON.parse(calendarData.value).length : 0;

        if (confirm(`Restore ${restored.length} workspace sections from this backup? This replaces the current saved data.`)) {
          restored.forEach(({ key, value }) => localStorage.setItem(key, value));

          alert(`Data imported successfully: ${hackathonCount} hackathons and ${taskCount} scheduled task${taskCount === 1 ? '' : 's'} restored. Refreshing page...`);
          window.location.reload();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Please check the file format.';
        alert(`Failed to import data: ${message}`);
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <a 
          href="https://sai-emani25.github.io/Portfolio/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 group transition-all hover:opacity-80"
        >
          <Crown className="w-7 h-7 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform" />
          <h1 className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tight hidden sm:block">
            SOLOMON
          </h1>
        </a>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            title="Export all data"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Import Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
            title="Import data from file"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Daily Suite v2.2
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

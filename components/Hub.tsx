
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  FolderPlus, 
  ExternalLink, 
  Trash2, 
  Folder, 
  ChevronRight, 
  ChevronDown,
  Globe,
  Search,
  X,
  Download,
  Upload as UploadIcon,
  Navigation,
  Trophy,
  BookOpen,
  Settings2,
  Smartphone
} from 'lucide-react';
import { HubFolder, HubLink, AppTab } from '../types';

interface HubProps {
  onNavigate?: (tab: AppTab) => void;
}

const Hub: React.FC<HubProps> = ({ onNavigate }) => {
  const [folders, setFolders] = useState<HubFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  
  const [showAddLink, setShowAddLink] = useState<{folderId: string | null} | null>(null);
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('solomon_hub_v2');
    if (saved) {
      try {
        setFolders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved hub data", e);
      }
    } else {
      const initial: HubFolder[] = [
        {
          id: 'default-1',
          name: 'Core Workflows',
          links: [
            { id: 'l1', name: "Solomon's Order", url: 'https://sai-emani25.github.io/Solomon-s-Order/' },
            { id: 'l2', name: 'Portfolio', url: 'https://sai-emani25.github.io/Portfolio/' }
          ]
        }
      ];
      setFolders(initial);
      setOpenFolders({ 'default-1': true });
    }
  }, []);

  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem('solomon_hub_v2', JSON.stringify(folders));
    }
  }, [folders]);

  // Tab navigation shortcuts
  const navigationShortcuts = useMemo(() => [
    { id: 'hackathons' as AppTab, label: 'Hackathons', icon: Trophy, color: 'text-amber-400' },
    { id: 'study' as AppTab, label: 'Study Master', icon: BookOpen, color: 'text-blue-400' },
    { id: 'tools' as AppTab, label: 'File Tools', icon: Settings2, color: 'text-purple-400' },
    { id: 'app-maker' as AppTab, label: 'APK Generator', icon: Smartphone, color: 'text-emerald-400' },
    { id: 'hub' as AppTab, label: 'Home / Hub', icon: Globe, color: 'text-indigo-400' },
  ], []);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Filter folders and links
    const filteredFolders = folders.map(f => {
      const folderMatches = f.name.toLowerCase().includes(query);
      const matchingLinks = f.links.filter(l => 
        l.name.toLowerCase().includes(query) || 
        l.url.toLowerCase().includes(query)
      );

      if (folderMatches || matchingLinks.length > 0) {
        return {
          ...f,
          links: matchingLinks.length > 0 ? matchingLinks : f.links,
          _folderMatches: folderMatches
        };
      }
      return null;
    }).filter(Boolean) as (HubFolder & { _folderMatches: boolean })[];

    // Filter tab shortcuts
    const filteredTabs = query ? navigationShortcuts.filter(t => 
      t.label.toLowerCase().includes(query)
    ) : [];

    return { filteredFolders, filteredTabs };
  }, [folders, searchQuery, navigationShortcuts]);

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const folder: HubFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      links: []
    };
    setFolders([...folders, folder]);
    setNewFolderName('');
    setShowAddFolder(false);
    setOpenFolders(prev => ({ ...prev, [folder.id]: true }));
  };

  const deleteFolder = (id: string) => {
    if (confirm('Delete this folder and all its links?')) {
      setFolders(folders.filter(f => f.id !== id));
    }
  };

  const addLink = () => {
    if (!newLink.name.trim() || !newLink.url.trim() || !showAddLink?.folderId) return;
    const formattedUrl = newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`;
    
    const updatedFolders = folders.map(f => {
      if (f.id === showAddLink.folderId) {
        return {
          ...f,
          links: [...f.links, { id: Date.now().toString(), name: newLink.name, url: formattedUrl }]
        };
      }
      return f;
    });
    
    setFolders(updatedFolders);
    setNewLink({ name: '', url: '' });
    setShowAddLink(null);
  };

  const deleteLink = (folderId: string, linkId: string) => {
    setFolders(folders.map(f => {
      if (f.id === folderId) {
        return { ...f, links: f.links.filter(l => l.id !== linkId) };
      }
      return f;
    }));
  };

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(folders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `solomon_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedFolders = JSON.parse(content);
        if (Array.isArray(importedFolders)) {
          if (confirm('This will overwrite your current workspace links. Continue?')) {
            setFolders(importedFolders);
            const newOpen: Record<string, boolean> = {};
            importedFolders.forEach(f => newOpen[f.id] = true);
            setOpenFolders(newOpen);
          }
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        alert('Error reading the file.');
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Dynamic Search / Command Bar */}
      <div className="relative group max-w-2xl mx-auto mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input 
          type="text"
          className="block w-full pl-12 pr-12 py-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xl"
          placeholder="Search links, folders or type a tab name (e.g. 'Study')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-400" />
          Command Center
        </h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
          <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700">
            <UploadIcon className="w-3.5 h-3.5" /> Import
          </button>
          <button onClick={exportData} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => setShowAddFolder(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20">
            <FolderPlus className="w-4 h-4" /> Add Folder
          </button>
        </div>
      </div>

      {/* Quick Navigation Results */}
      {filteredData.filteredTabs.length > 0 && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-2">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Navigation className="w-3 h-3" /> Quick Jump
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredData.filteredTabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => onNavigate?.(tab.id)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl transition-all group"
              >
                <tab.icon className={`w-4 h-4 ${tab.color}`} />
                <span className="text-sm font-bold text-slate-200 group-hover:text-white">Go to {tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Content */}
      <div className="grid grid-cols-1 gap-6">
        {filteredData.filteredFolders.map(folder => (
          <div key={folder.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div 
              className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors ${folder._folderMatches ? 'bg-indigo-500/5' : ''}`}
              onClick={() => toggleFolder(folder.id)}
            >
              <div className="flex items-center gap-3">
                {(openFolders[folder.id] || searchQuery) ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                <Folder className={`w-5 h-5 ${folder.links.length > 0 ? 'text-amber-500 fill-amber-500/20' : 'text-slate-600'}`} />
                <h3 className="font-bold text-slate-200">
                  {folder.name}
                  {folder._folderMatches && searchQuery && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">Match</span>}
                </h3>
                <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-mono">{folder.links.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowAddLink({ folderId: folder.id }); }} 
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-all text-xs font-bold border border-indigo-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Link
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {(openFolders[folder.id] || searchQuery) && (
              <div className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folder.links.map(link => (
                    <div key={link.id} className="group relative">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-xl transition-all group-hover:shadow-md h-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-slate-700/50 flex items-center justify-center rounded-lg group-hover:bg-indigo-500/20 transition-colors shrink-0">
                            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-200 truncate">{link.name}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">{link.url.replace(/^https?:\/\//, '')}</p>
                          </div>
                        </div>
                      </a>
                      <button onClick={() => deleteLink(folder.id, link.id)} className="absolute -top-1.5 -right-1.5 p-1.5 bg-slate-900 border border-slate-700 text-slate-500 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Dedicated Add Link Card */}
                  <button 
                    onClick={() => setShowAddLink({ folderId: folder.id })}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-800/50 flex items-center justify-center rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                      <Plus className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-300">Add New Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredData.filteredFolders.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
             <div className="p-4 bg-slate-800 rounded-full mb-4">
                <Globe className="w-8 h-8 text-slate-600" />
             </div>
             <p className="text-slate-500 font-medium">{searchQuery ? 'No results found for your search.' : 'Your command center is empty.'}</p>
          </div>
        )}
      </div>

      {/* Add Folder Modal */}
      {showAddFolder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Create New Folder</h3>
            <input autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6" placeholder="e.g., Development Tools" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFolder()} />
            <div className="flex gap-3">
              <button onClick={() => setShowAddFolder(false)} className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={addFolder} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddLink && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Add Link to Folder</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Link Name</label>
                <input autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Google" value={newLink.name} onChange={(e) => setNewLink({...newLink, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">URL</label>
                <input className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., google.com" value={newLink.url} onChange={(e) => setNewLink({...newLink, url: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && addLink()} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddLink(null)} className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={addLink} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">Add Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hub;

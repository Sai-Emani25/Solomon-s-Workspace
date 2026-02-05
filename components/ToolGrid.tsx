
import React, { useState } from 'react';
import { 
  FileText, 
  FileCode, 
  Presentation, 
  Image as ImageIcon, 
  Video, 
  ArrowRight,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Download
} from 'lucide-react';
import { ToolType, FileProcessingState } from '../types';

const tools = [
  { id: ToolType.PPT_TO_PDF, icon: Presentation, targetIcon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: ToolType.PPT_TO_WORD, icon: Presentation, targetIcon: FileCode, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: ToolType.PDF_TO_PPT, icon: FileText, targetIcon: Presentation, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: ToolType.PDF_TO_WORD, icon: FileText, targetIcon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: ToolType.IMAGE_COMPRESS, icon: ImageIcon, targetIcon: null, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: ToolType.VIDEO_COMPRESS, icon: Video, targetIcon: null, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

const ToolGrid: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [fileState, setFileState] = useState<FileProcessingState>({
    isProcessing: false,
    progress: 0,
    resultUrl: null,
    error: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileState({ isProcessing: true, progress: 0, resultUrl: null, error: null });

    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        clearInterval(interval);
        setFileState({
          isProcessing: false,
          progress: 100,
          resultUrl: URL.createObjectURL(file), // Mock result URL
          error: null
        });
      } else {
        setFileState(prev => ({ ...prev, progress: Math.min(progress, 99) }));
      }
    }, 400);
  };

  const reset = () => {
    setFileState({ isProcessing: false, progress: 0, resultUrl: null, error: null });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); reset(); }}
            className={`group p-6 rounded-2xl border transition-all hover:scale-[1.02] text-left relative overflow-hidden ${
              activeTool === tool.id 
                ? `${tool.bg} ${tool.border.replace('/20', '/50')} shadow-lg shadow-black/20` 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${tool.bg} ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              {tool.targetIcon && (
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div className={`p-3 rounded-xl bg-slate-800 text-slate-300`}>
                    <tool.targetIcon className="w-6 h-6" />
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-white/90">
              {tool.id}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {tool.id.includes('Compress') ? 'Reduce file size quickly.' : 'High-fidelity conversion.'}
            </p>
          </button>
        ))}
      </div>

      {activeTool && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                {tools.find(t => t.id === activeTool)?.icon && 
                 React.createElement(tools.find(t => t.id === activeTool)!.icon, { className: 'w-6 h-6' })}
              </span>
              Processing: {activeTool}
            </h2>
            <button 
              onClick={() => setActiveTool(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-xl mx-auto">
            {!fileState.isProcessing && !fileState.resultUrl && (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-800 border-dashed rounded-3xl cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="mb-2 text-sm text-slate-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">
                    Supported formats: {activeTool.split(' ')[0]}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            {fileState.isProcessing && (
              <div className="flex flex-col items-center py-12">
                <div className="relative mb-6">
                  <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {Math.round(fileState.progress)}%
                  </div>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Processing your file...</h3>
                <p className="text-slate-500 text-sm">Please do not close this window</p>
                
                <div className="w-full bg-slate-800 h-2 rounded-full mt-8 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${fileState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {fileState.resultUrl && (
              <div className="flex flex-col items-center py-8 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="p-4 bg-emerald-500/10 rounded-full mb-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conversion Complete!</h3>
                <p className="text-slate-400 mb-8 max-w-sm">
                  Your file has been processed successfully. Click the button below to download your result.
                </p>
                <div className="flex gap-4">
                  <a 
                    href={fileState.resultUrl} 
                    download={`converted_${activeTool.replace(/\s+/g, '_')}`}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all hover:scale-105"
                  >
                    <Download className="w-5 h-5" />
                    Download Now
                  </a>
                  <button 
                    onClick={reset}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                  >
                    Start New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolGrid;

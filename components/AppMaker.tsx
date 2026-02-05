
import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Globe, 
  Upload, 
  Settings, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Download, 
  AlertCircle,
  Terminal,
  FileCode
} from 'lucide-react';

const AppMaker: React.FC = () => {
  const [step, setStep] = useState<'config' | 'building' | 'result'>('config');
  const [config, setConfig] = useState({
    appName: '',
    packageName: 'com.solomon.myapp',
    version: '1.0.0',
    sourceType: 'url' as 'url' | 'folder',
    url: '',
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const startBuild = () => {
    if (!config.appName) return;
    setStep('building');
    setLogs(['[SYSTEM] Initializing Solomon Build Environment...', '[SYSTEM] Checking dependencies...']);
    setProgress(0);

    const buildSteps = [
      { msg: '[GRADLE] Resolving Android SDK (API 34)...', p: 10 },
      { msg: '[SOURCE] Fetching manifest configuration...', p: 20 },
      { msg: '[ASSETS] Optimizing web resources...', p: 35 },
      { msg: '[COMPILER] Converting JS to bytecode...', p: 50 },
      { msg: '[APK] Bundling resources into .apk container...', p: 65 },
      { msg: '[SIGNER] Applying V2 signature (Solomon-Release-Key)...', p: 80 },
      { msg: '[OPTIMIZER] Running zipalign...', p: 95 },
      { msg: '[SUCCESS] Build completed. Generating download link.', p: 100 },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < buildSteps.length) {
        setLogs(prev => [...prev, buildSteps[currentStep].msg]);
        setProgress(buildSteps[currentStep].p);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStep('result'), 800);
      }
    }, 1200);
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setConfig({ ...config, sourceType: 'folder' });
      setLogs(prev => [...prev, `[FILE] Selected ${e.target.files?.length} files for app source.`]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-emerald-400" />
          APK Generator
        </h2>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Beta Tool
        </div>
      </div>

      {step === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Project Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">App Name</label>
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., My Awesome App"
                  value={config.appName}
                  onChange={e => setConfig({...config, appName: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Package ID</label>
                  <input 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="com.solomon.app"
                    value={config.packageName}
                    onChange={e => setConfig({...config, packageName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Version</label>
                  <input 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="1.0.0"
                    value={config.version}
                    onChange={e => setConfig({...config, version: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Source Method</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfig({...config, sourceType: 'url'})}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${config.sourceType === 'url' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-xs font-bold">Web URL</span>
                </button>
                <button 
                  onClick={() => setConfig({...config, sourceType: 'folder'})}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${config.sourceType === 'folder' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-bold">Local Folder</span>
                </button>
              </div>
              
              {config.sourceType === 'url' ? (
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://your-website.com"
                  value={config.url}
                  onChange={e => setConfig({...config, url: e.target.value})}
                />
              ) : (
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-300">Select Website Folder</span>
                  </div>
                  <input type="file" className="hidden" webkitdirectory="" directory="" multiple onChange={handleFolderUpload} />
                </label>
              )}
            </div>

            <button 
              onClick={startBuild}
              disabled={!config.appName || (config.sourceType === 'url' && !config.url)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 mt-8 shadow-xl shadow-indigo-500/20"
            >
              <Zap className="w-5 h-5 fill-current" />
              BUILD APK PACKAGE
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Smartphone className="w-48 h-48 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-6">How it works</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">1</div>
                <div>
                  <h4 className="font-bold text-slate-200">Containerize</h4>
                  <p className="text-sm text-slate-500 mt-1">We wrap your web code in a high-performance native WebView container.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">2</div>
                <div>
                  <h4 className="font-bold text-slate-200">Compile</h4>
                  <p className="text-sm text-slate-500 mt-1">Solomon optimizes your assets and compiles them into a standard Android package.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">3</div>
                <div>
                  <h4 className="font-bold text-slate-200">Install</h4>
                  <p className="text-sm text-slate-500 mt-1">Download the signed APK, transfer to your device, and install instantly.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-500/80 leading-relaxed">
                Ensure your web app is mobile-responsive and has a valid manifest.json for the best experience as a native application.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'building' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <div>
                <h3 className="text-xl font-bold text-white">Compiling Build...</h3>
                <p className="text-slate-500 text-sm">Building {config.appName} for Android ARM64</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">{progress}%</span>
            </div>
          </div>
          
          <div className="bg-black/40 p-6 font-mono text-sm space-y-2 h-[400px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-3 ${log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[SYSTEM]') ? 'text-indigo-400' : 'text-slate-400'}`}>
                <span className="opacity-30 select-none">[{i+1}]</span>
                <span>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="max-w-2xl mx-auto py-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex p-6 bg-emerald-500/10 rounded-full mb-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">APK Package Ready!</h2>
          <p className="text-slate-400 text-lg mb-12">
            The build for <span className="text-white font-bold">{config.appName}</span> has been signed and optimized. You can now download and install it on your Android device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Download started... (Simulated)'); }}
              className="flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
            >
              <Download className="w-6 h-6" />
              DOWNLOAD APK
            </a>
            <button 
              onClick={() => setStep('config')}
              className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
            >
              Build Another
            </button>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8">
             <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <Terminal className="w-6 h-6 text-slate-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">View Build Logs</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                   <Settings className="w-6 h-6 text-slate-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Config APK</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMaker;


import React, { useState } from 'react';
import { AppState, AnalysisRequest, AnalysisResult } from './types';
import { analyzeTool } from './services/geminiService';
import { RiskScoreGauge } from './components/RiskScoreGauge';
import { RiskBadge } from './components/RiskBadge';
import { Shield, Search, Info, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Lock, Globe, FileText, Zap, XCircle, AlertCircle, Copy, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [request, setRequest] = useState<AnalysisRequest>({ toolName: '', website: '', useCase: '' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.toolName) return;
    setState(AppState.LOADING);
    setError(null);
    try {
      const analysis = await analyzeTool(request);
      setResult(analysis);
      setState(AppState.RESULT);
    } catch (err: any) {
      setError(err.message);
      setState(AppState.ERROR);
    }
  };

  const getVerdictTheme = (rec: string) => {
    switch (rec) {
      case 'Restricted': return { bg: 'bg-red-600', text: 'text-white', icon: <XCircle className="w-12 h-12" />, label: 'STOP: DO NOT USE' };
      case 'Conditional': return { bg: 'bg-amber-500', text: 'text-white', icon: <AlertCircle className="w-12 h-12" />, label: 'CAUTION: USE WITH LIMITS' };
      default: return { bg: 'bg-emerald-600', text: 'text-white', icon: <CheckCircle className="w-12 h-12" />, label: 'GO: APPROVED FOR WORK' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10 py-4">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setState(AppState.IDLE)}>
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight italic">GuardAI</h1>
          </div>
          <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600 uppercase tracking-widest">
            Manager's Toolkit
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        {state === AppState.IDLE && (
          <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-top-4">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-slate-900 leading-tight">Can your team use this free tool?</h2>
              <p className="text-xl text-slate-500 font-medium">
                Find out what data you are accidentally giving away.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Which tool are they using?</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ChatGPT, Claude, Gamma, Runway"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-inner"
                    value={request.toolName}
                    onChange={(e) => setRequest({ ...request, toolName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">What is the use case?</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Asking AI to summarize internal meeting transcripts..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-inner resize-none"
                    value={request.useCase}
                    onChange={(e) => setRequest({ ...request, useCase: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
                Run Safety Check
              </button>
              <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                Analyzes Privacy Policies & Cyber-Threat Logs Automatically
              </p>
            </form>
          </div>
        )}

        {state === AppState.LOADING && (
          <div className="max-w-xl mx-auto text-center py-20 space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Search className="w-12 h-12 text-indigo-500 animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900">Scanning Policies...</h3>
              <p className="text-slate-500 font-medium">Checking if {request.toolName} uses your data for training.</p>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {/* BIG VERDICT CARD */}
            <div className={`rounded-[3rem] p-10 shadow-2xl overflow-hidden relative ${getVerdictTheme(result.recommendation).bg} ${getVerdictTheme(result.recommendation).text}`}>
              <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                {getVerdictTheme(result.recommendation).icon}
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-white/20 p-6 rounded-3xl backdrop-blur-sm">
                  {getVerdictTheme(result.recommendation).icon}
                </div>
                <div className="text-center md:text-left space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">The Verdict for {result.toolName}</span>
                  <h2 className="text-5xl font-black leading-none">{getVerdictTheme(result.recommendation).label}</h2>
                  <p className="text-xl font-medium opacity-90 max-w-xl">{result.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: THE RISK (The Compromise) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                    What you give up for "Free"
                  </h3>
                  <div className="space-y-3">
                    {result.dataCompromisePoints?.map((point, idx) => (
                      <div key={idx} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-sm flex-shrink-0">
                          <span className="text-red-500 font-black text-sm">{idx + 1}</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 leading-tight group-hover:text-slate-900">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-indigo-600" />
                    Manager's Team Guidance
                  </h3>
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 relative group">
                    <button className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors border" title="Copy to clipboard">
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                    <p className="text-indigo-900 font-medium italic leading-relaxed">
                      "Team, we checked <strong>{result.toolName}</strong>'s free tier policy. {result.trainingPolicy} {result.recommendation === 'Restricted' ? 'Please avoid using this tool for any work-related tasks immediately.' : 'You can use it only for non-sensitive public work.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT: THE SCORECARD */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Risk Scorecard</h4>
                  <RiskScoreGauge score={result.overallRiskScore} />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Security</p>
                      <p className="text-lg font-black text-slate-900">{result.overallRiskScore > 70 ? 'Low' : result.overallRiskScore > 40 ? 'Mid' : 'High'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Privacy</p>
                      <p className="text-lg font-black text-slate-900">{result.categories?.[0]?.status || 'Warning'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" /> Fact Check
                  </h4>
                  <div className="space-y-4 text-sm font-medium text-slate-500">
                    <div className="pb-4 border-b">
                      <p className="text-slate-900 font-bold mb-1">Breach History</p>
                      <p>{result.breachHistory}</p>
                    </div>
                    <div className="pb-4 border-b">
                      <p className="text-slate-900 font-bold mb-1">Safety Standard</p>
                      <p>{result.complianceStatus}</p>
                    </div>
                  </div>
                  {result.sources?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Data Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {result.sources.slice(0, 3).map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                            {s.title.substring(0, 15)}... <ExternalLink className="w-2 h-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setState(AppState.IDLE)}
                  className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Check Another Tool
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Build for Managers. Designed for Safety.
        </p>
      </footer>
    </div>
  );
};

export default App;

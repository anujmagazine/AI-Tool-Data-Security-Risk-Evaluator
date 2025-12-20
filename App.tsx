
import React, { useState } from 'react';
import { AppState, AnalysisRequest, AnalysisResult, RiskPoint, RiskTableRow } from './types';
import { analyzeTool } from './services/geminiService';
import { Shield, Search, Info, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Zap, XCircle, AlertCircle, FileText, Globe, Link as LinkIcon, Cpu } from 'lucide-react';

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
    const cleanRec = rec.toLowerCase();
    if (cleanRec.includes('restricted') || cleanRec.includes('stop')) {
      return { bg: 'bg-red-600', text: 'text-white', icon: <XCircle className="w-12 h-12" />, label: 'RESTRICTED: DO NOT USE' };
    }
    if (cleanRec.includes('conditional') || cleanRec.includes('caution')) {
      return { bg: 'bg-amber-500', text: 'text-white', icon: <AlertCircle className="w-12 h-12" />, label: 'CONDITIONAL: USE CAUTIOUSLY' };
    }
    return { bg: 'bg-emerald-600', text: 'text-white', icon: <CheckCircle className="w-12 h-12" />, label: 'APPROVED: SAFE FOR WORK' };
  };

  const SeverityBadge = ({ severity }: { severity: RiskTableRow['severity'] }) => {
    const styles = {
      High: 'bg-red-100 text-red-700',
      Medium: 'bg-amber-100 text-amber-700',
      Low: 'bg-blue-100 text-blue-700'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setState(AppState.IDLE)}>
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight italic">GuardAI</h1>
          </div>
          <div className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest border">
            Security Auditor v2.0
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {state === AppState.IDLE && (
          <div className="max-w-2xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-top-4">
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter">Check any AI tool before your team uses it.</h2>
              <p className="text-xl text-slate-500 font-medium">Instantly audit privacy policies, data training rules, and security risks.</p>
            </div>
            <form onSubmit={handleAnalyze} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tool Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ChatGPT, Claude, Gamma"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-xl font-bold shadow-inner"
                    value={request.toolName}
                    onChange={(e) => setRequest({ ...request, toolName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tool Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example-ai.com"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-inner"
                    value={request.website}
                    onChange={(e) => setRequest({ ...request, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Use Case (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Summarizing meeting notes, code assistance..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-inner resize-none"
                    value={request.useCase}
                    onChange={(e) => setRequest({ ...request, useCase: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black text-xl py-6 rounded-3xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-xl">
                <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
                Run Security Audit
              </button>
            </form>
          </div>
        )}

        {state === AppState.LOADING && (
          <div className="max-w-xl mx-auto text-center py-32 space-y-8">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Search className="w-10 h-10 text-indigo-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Auditing Policies...</h3>
              <p className="text-slate-500 font-medium">Conducting exhaustive risk analysis for {request.toolName}...</p>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            {/* TOOL HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-white rounded-3xl border shadow-sm">
                     <Cpu className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                      Analysis for <span className="text-indigo-600">{result.toolName}</span>
                    </h2>
                    {/* TOOL DESCRIPTION */}
                    <p className="text-slate-600 font-medium text-lg leading-tight mt-1 max-w-2xl">
                      {result.toolDescription}
                    </p>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Audit conducted in real-time</p>
                  </div>
               </div>
               <button onClick={() => setState(AppState.IDLE)} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors">
                 <ArrowLeft className="w-4 h-4" /> Start New Audit
               </button>
            </div>

            {/* BIG VERDICT CARD */}
            <div className={`rounded-[3rem] p-10 shadow-xl relative ${getVerdictTheme(result.recommendation).bg} ${getVerdictTheme(result.recommendation).text}`}>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-white/20 p-6 rounded-3xl backdrop-blur-sm">
                  {getVerdictTheme(result.recommendation).icon}
                </div>
                <div className="text-center md:text-left space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">Security Audit Result</span>
                  <h2 className="text-5xl font-black leading-none tracking-tighter">{getVerdictTheme(result.recommendation).label}</h2>
                  <p className="text-xl font-medium opacity-90 max-w-2xl">{result.summary}</p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {/* TOP TRADE-OFFS */}
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">Critical Trade-offs</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.topRisks?.slice(0, 6).map((risk, idx) => (
                    <div key={idx} className="flex gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm flex-shrink-0">
                        <span className="text-slate-900 font-black text-lg">{idx + 1}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-lg font-bold text-slate-700 leading-snug group-hover:text-slate-900">{risk.point}</p>
                        {risk.sourceUrl && (
                          <a href={risk.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">
                            <ExternalLink className="w-3 h-3" /> View Source
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DETAILED RISK TABLE - EXHAUSTIVE */}
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm space-y-8 overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">Full Security Profile</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">#</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Risk Category</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">What this means</th>
                        <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.riskTable?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-5 px-4 font-black text-slate-900 whitespace-nowrap">{row.category}</td>
                          <td className="py-5 px-4 text-sm font-medium text-slate-600 leading-relaxed max-w-md">{row.description}</td>
                          <td className="py-5 px-4 text-right">
                            <SeverityBadge severity={row.severity} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-white font-bold text-lg leading-tight">
                    🛡️ Security Policy: Use {result.toolName} only for experimental use cases without uploading any sensitive files or private data.
                  </p>
                  <button onClick={() => setState(AppState.IDLE)} className="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/20 transition-all flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> New Audit
                  </button>
                </div>
              </div>

              {/* SOURCES SECTION */}
              <div id="sources" className="bg-white p-10 rounded-[3rem] border shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-slate-400" />
                  <h4 className="text-xl font-black tracking-tight">Sources & Reference Documents</h4>
                </div>
                <p className="text-sm text-slate-500 font-medium px-1">
                  The security assessment for <strong>{result.toolName}</strong> above was generated by analyzing the following official policies, technical documentation, and grounding sources:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.sources && result.sources.length > 0 ? (
                    result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between hover:border-indigo-200 hover:bg-white transition-all group shadow-sm">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">{s.title}</span>
                          <span className="text-[10px] text-slate-400 font-bold truncate mt-1">{s.uri}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 flex-shrink-0 ml-4" />
                      </a>
                    ))
                  ) : (
                    <div className="col-span-full p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 font-bold">Official {result.toolName} Privacy Policy & Terms of Service</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {state === AppState.ERROR && error && (
          <div className="max-w-xl mx-auto py-20 text-center space-y-6">
             <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold">
               {error}
             </div>
             <button onClick={() => setState(AppState.IDLE)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black">
               Return to Home
             </button>
          </div>
        )}
      </main>

      <footer className="py-10 border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">GuardAI | Corporate AI Security Intelligence</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

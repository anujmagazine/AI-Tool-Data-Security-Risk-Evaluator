
import React, { useState } from 'react';
import { AppState, AnalysisRequest, AnalysisResult, RiskPoint } from './types';
import { analyzeTool } from './services/geminiService';
import { RiskScoreGauge } from './components/RiskScoreGauge';
import { Shield, Search, Info, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Lock, Globe, Zap, XCircle, AlertCircle, Copy, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [request, setRequest] = useState<AnalysisRequest>({ toolName: '', website: '', useCase: '' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMoreRisks, setShowMoreRisks] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.toolName) return;
    setState(AppState.LOADING);
    setError(null);
    setShowMoreRisks(false);
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

  // Fixed RiskItem component typing to resolve "Type '{ key: any; risk: any; index: any; }' is not assignable" error
  const RiskItem: React.FC<{ risk: RiskPoint; index: number }> = ({ risk, index }) => (
    <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-sm flex-shrink-0">
          <span className="text-slate-400 font-black text-sm">{index + 1}</span>
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-lg font-bold text-slate-800 leading-tight group-hover:text-slate-900">{risk.point}</p>
          {risk.sourceUrl && (
            <a 
              href={risk.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 px-2.5 py-1 rounded-full border border-indigo-100 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Source Reference
            </a>
          )}
        </div>
      </div>
    </div>
  );

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
            Corporate Decision Engine
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        {state === AppState.IDLE && (
          <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-top-4">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-slate-900 leading-tight">Can your team use this free tool?</h2>
              <p className="text-xl text-slate-500 font-medium">Find out what data you're sacrificing for a free account.</p>
            </div>
            <form onSubmit={handleAnalyze} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Tool Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ChatGPT, Claude, Gamma"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-inner"
                    value={request.toolName}
                    onChange={(e) => setRequest({ ...request, toolName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">What will they do with it?</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Summarizing client notes..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-inner resize-none"
                    value={request.useCase}
                    onChange={(e) => setRequest({ ...request, useCase: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black text-xl py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg">
                <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
                Audit Tool Safety
              </button>
            </form>
          </div>
        )}

        {state === AppState.LOADING && (
          <div className="max-w-xl mx-auto text-center py-20 space-y-8">
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Search className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Conducting Stricter Safety Check...</h3>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {/* VERDICT CARD */}
            <div className={`rounded-[3rem] p-10 shadow-2xl relative ${getVerdictTheme(result.recommendation).bg} ${getVerdictTheme(result.recommendation).text}`}>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-white/20 p-6 rounded-3xl backdrop-blur-sm">
                  {getVerdictTheme(result.recommendation).icon}
                </div>
                <div className="text-center md:text-left space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">Final Security Verdict</span>
                  <h2 className="text-5xl font-black leading-none">{getVerdictTheme(result.recommendation).label}</h2>
                  <p className="text-xl font-medium opacity-90">{result.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                {/* TOP 5 RISKS */}
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                    Top Data Trade-offs
                  </h3>
                  <div className="space-y-4">
                    {result.topRisks?.slice(0, 5).map((risk, idx) => (
                      <RiskItem key={idx} risk={risk} index={idx} />
                    ))}
                  </div>

                  {result.additionalRisks?.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => setShowMoreRisks(!showMoreRisks)}
                        className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        {showMoreRisks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        {showMoreRisks ? 'Hide Additional Risks' : `See ${result.additionalRisks.length} More Risks`}
                      </button>
                      
                      {showMoreRisks && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-top-4">
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center py-2">Extended Risk Profile</p>
                          {result.additionalRisks.map((risk, idx) => (
                            <RiskItem key={idx} risk={risk} index={idx + 5} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-indigo-600" />
                    Copy-Paste Team Notice
                  </h3>
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 relative group">
                    <button className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm hover:bg-slate-100 border transition-all">
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                    <p className="text-indigo-900 font-medium italic leading-relaxed">
                      "Team, we audited <strong>{result.toolName}</strong>'s free tier. <strong>{result.summary}</strong> Specifically, {result.trainingPolicy.toLowerCase()} This tool is {result.recommendation.toLowerCase().includes('restricted') ? 'NOT permitted for use with corporate data.' : 'only permitted for public-facing, non-sensitive work.'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Risk Severity</h4>
                  <RiskScoreGauge score={result.overallRiskScore} />
                  <p className="mt-4 text-lg font-black text-slate-900">
                    {result.overallRiskScore > 70 ? 'Critical Risk' : result.overallRiskScore > 40 ? 'Moderate Risk' : 'Low Risk'}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" /> Audit Evidence
                  </h4>
                  <div className="space-y-4 text-sm font-medium text-slate-500">
                    <div className="pb-4 border-b">
                      <p className="text-slate-900 font-bold mb-1">Company Safety Grade</p>
                      <p>{result.complianceStatus}</p>
                    </div>
                    <div className="pb-4 border-b">
                      <p className="text-slate-900 font-bold mb-1">Leak & Breach Context</p>
                      <p>{result.breachHistory}</p>
                    </div>
                  </div>
                  {result.sources?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Primary Reference Links</p>
                      <div className="flex flex-wrap gap-2">
                        {result.sources.slice(0, 3).map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                            {s.title.substring(0, 12)}... <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setState(AppState.IDLE)}
                  className="w-full py-5 rounded-2xl border-2 border-slate-200 text-slate-500 font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Reset Auditor
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

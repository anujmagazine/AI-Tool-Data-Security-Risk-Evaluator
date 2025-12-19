
import React, { useState } from 'react';
import { AppState, AnalysisRequest, AnalysisResult } from './types';
import { analyzeTool } from './services/geminiService';
import { RiskScoreGauge } from './components/RiskScoreGauge';
import { RiskBadge } from './components/RiskBadge';
import { Shield, Search, Info, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Lock, Globe, FileText, Zap } from 'lucide-react';

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

  const reset = () => {
    setState(AppState.IDLE);
    setRequest({ toolName: '', website: '', useCase: '' });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GuardAI</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block px-3 py-1 bg-amber-50 rounded-full border border-amber-100 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Free-Tier Policy Auditor
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {state === AppState.IDLE && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900">Are Free AI Tools safe?</h2>
              <p className="text-lg text-slate-600">
                Audit the <span className="font-bold text-indigo-600 underline decoration-indigo-200">Free/Public tiers</span> of AI software. 
                Discover hidden data-for-training clauses and security gaps before your team uses them.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tool Name (Auditing Free Tier) <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ChatGPT (Free), Midjourney, Claude..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={request.toolName}
                    onChange={(e) => setRequest({ ...request, toolName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={request.website}
                    onChange={(e) => setRequest({ ...request, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Specific Work Context (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Employee uploading source code to get help with debugging..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                    value={request.useCase}
                    onChange={(e) => setRequest({ ...request, useCase: e.target.value })}
                  />
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Notice:</strong> This audit specifically targets <strong>Free, Individual, and Public tiers</strong>. Risks identified here may be mitigated in paid "Enterprise" versions.
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Analyze Free-Tier Security
              </button>
            </form>
          </div>
        )}

        {state === AppState.LOADING && (
          <div className="max-w-xl mx-auto text-center py-20 space-y-6 animate-pulse">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
              <Shield className="w-20 h-20 text-indigo-600 relative mx-auto" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Auditing Free-Tier Terms...</h3>
              <p className="text-slate-500">Searching for data-for-training clauses and security exemptions for <strong>{request.toolName}</strong>.</p>
            </div>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="max-w-xl mx-auto py-20 text-center">
            <div className="bg-red-50 p-8 rounded-3xl space-y-4 border border-red-100">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
              <h3 className="text-xl font-bold text-red-900">Audit Failed</h3>
              <p className="text-red-700">{error}</p>
              <button onClick={() => setState(AppState.IDLE)} className="text-indigo-600 font-semibold underline">Try again</button>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setState(AppState.IDLE)}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> New Audit
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-indigo-600" />
                Free-Tier Focused Report
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">{result.toolName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500 text-sm">{request.website || 'Public Version'}</span>
                      </div>
                    </div>
                    <RiskBadge status={result.recommendation} />
                  </div>

                  <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Free Version Risk Summary
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-lg font-medium">"{result.summary}"</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 font-bold text-slate-800">
                        <Lock className="w-4 h-4 text-indigo-500" /> 
                        Free Tier Audit Pillars
                      </h4>
                      {result.categories?.map((cat, idx) => (
                        <div key={idx} className="p-4 border rounded-xl bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-700">{cat.name}</span>
                            <RiskBadge status={cat.status} />
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 font-bold text-slate-800">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Unintended Compromises
                      </h4>
                      <div className="space-y-2">
                        {result.dataCompromisePoints?.map((point, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="mt-1 flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="text-sm text-red-700">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" /> Training & Security Context
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">How they use your data (Free Version)</h4>
                      <p className="text-slate-600 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 leading-relaxed">{result.trainingPolicy}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Historical Security Incidents</h4>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">{result.breachHistory}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm text-center">
                  <RiskScoreGauge score={result.overallRiskScore} />
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Corporate Verdict</h4>
                    <p className="text-lg font-black text-slate-900">{result.recommendation}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Free-Tier Compliance
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.complianceStatus ? result.complianceStatus.split(',').map((status, idx) => (
                      <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100 uppercase">
                        {status.trim()}
                      </span>
                    )) : <span className="text-slate-400 text-sm italic">No verified certifications for free tier</span>}
                  </div>
                </div>

                {result.sources?.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4">Verification Sources</h4>
                    <div className="space-y-3">
                      {result.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                          <span className="text-xs text-slate-600 group-hover:text-indigo-600 line-clamp-2">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>© 2024 GuardAI Security Systems. Focus: Free-Tier Audit.</p>
          <div className="flex gap-6">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-indigo-600 transition-colors">Billing Policy Info</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Corporate Safety</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

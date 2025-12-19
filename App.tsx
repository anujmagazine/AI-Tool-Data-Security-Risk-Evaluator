
import React, { useState } from 'react';
import { AppState, AnalysisRequest, AnalysisResult } from './types';
import { analyzeTool } from './services/geminiService';
import { RiskScoreGauge } from './components/RiskScoreGauge';
import { RiskBadge } from './components/RiskBadge';
import { Shield, Search, Info, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Lock, Globe, FileText } from 'lucide-react';

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
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Enterprise AI Risk Intelligence
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {state === AppState.IDLE && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900">Is your data safe?</h2>
              <p className="text-lg text-slate-600">
                Audit any AI tool's privacy, security, and data handling practices instantly. 
                Protect your organization from unintended data compromises.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">AI Tool Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ChatGPT, Midjourney, Claude"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={request.toolName}
                    onChange={(e) => setRequest({ ...request, toolName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tool Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={request.website}
                    onChange={(e) => setRequest({ ...request, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Intended Use Case (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Analyzing internal customer support logs..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                    value={request.useCase}
                    onChange={(e) => setRequest({ ...request, useCase: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Analyze Tool Security
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
              <h3 className="text-2xl font-bold text-slate-900">Conducting Audit...</h3>
              <p className="text-slate-500">Researching privacy policies, breach history, and compliance standards for <strong>{request.toolName}</strong>.</p>
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
            {/* Summary Banner */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <button 
                onClick={() => setState(AppState.IDLE)}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to search
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Report Column */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">{result.toolName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500 text-sm">{request.website || 'Official Website'}</span>
                      </div>
                    </div>
                    <RiskBadge status={result.recommendation} />
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
                    <p className="text-slate-700 leading-relaxed text-lg italic">"{result.summary}"</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 font-bold text-slate-800">
                        <Lock className="w-4 h-4 text-indigo-500" /> 
                        Data Security Pillars
                      </h4>
                      {result.categories.map((cat, idx) => (
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
                        Specific Compromise Risks
                      </h4>
                      <div className="space-y-2">
                        {result.dataCompromisePoints.map((point, idx) => (
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
                    <Info className="w-5 h-5 text-indigo-600" /> Detailed Findings
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Training & Retainment Policy</h4>
                      <p className="text-slate-600 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">{result.trainingPolicy}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Historical Breach/Security Data</h4>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{result.breachHistory}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Score Column */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm text-center">
                  <RiskScoreGauge score={result.overallRiskScore} />
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Status</h4>
                    <p className="text-lg font-black text-slate-900">{result.recommendation}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Compliance Coverage
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.complianceStatus.split(',').map((status, idx) => (
                      <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100 uppercase">
                        {status.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {result.sources.length > 0 && (
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

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>© 2024 GuardAI Security Systems. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Security Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

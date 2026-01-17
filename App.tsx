
import React, { useState } from 'react';
import { AppState, AnalysisRequest, AnalysisResult, RiskTableRow } from './types';
import { analyzeTool } from './services/geminiService';
import { Shield, Search, Info, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Zap, XCircle, AlertCircle, FileText, Globe, Link as LinkIcon, Cpu, Download, Calendar, Flame, Lightbulb } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [request, setRequest] = useState<AnalysisRequest>({ toolName: '', website: '', useCase: '' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!result) return;
    setIsDownloading(true);
    
    const element = document.getElementById('report-container');
    
    const opt = {
      margin: 10,
      filename: `${result.toolName.replace(/\s+/g, '_')}_Security_Audit.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      enableLinks: true 
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed', err);
    } finally {
      setIsDownloading(false);
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
      <header className="bg-white border-b py-4 sticky top-0 z-20 shadow-sm no-print">
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
            {/* ACTION HEADER (Web only) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 no-print">
               <div className="flex items-center gap-2 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                 <Cpu className="w-4 h-4" /> Real-time Audit Profile
               </div>
               <div className="flex items-center gap-3">
                 <button 
                  onClick={handleDownloadPDF} 
                  disabled={isDownloading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                 >
                   {isDownloading ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <Download className="w-4 h-4" />
                   )}
                   {isDownloading ? 'Generating PDF...' : 'Download Report (PDF)'}
                 </button>
                 <button onClick={() => setState(AppState.IDLE)} className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors">
                   <ArrowLeft className="w-4 h-4" /> Start New Audit
                 </button>
               </div>
            </div>

            {/* MAIN REPORT CONTENT WRAPPER */}
            <div id="report-container" className="space-y-12 bg-white rounded-[3rem] p-8 md:p-12 shadow-sm">
              
              {/* PRIMARY HEADER */}
              <div className="mb-10 border-b-2 border-slate-900 pb-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black italic">GuardAI</span>
                  </div>
                  <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Corporate Security Audit | {new Date().toLocaleDateString()}
                  </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
                  Analysis for {result.toolName} (Free Version)
                </h1>
                <p className="text-xl font-medium text-slate-600 leading-tight max-w-4xl">
                  {result.toolDescription}
                </p>
                <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Assessment Profile: Data Privacy & Security Compliance Audit
                </div>
              </div>

              {/* CREATIVE WARNING / TRUTH BOMB */}
              <div className="relative overflow-hidden bg-orange-50 border-4 border-orange-500 rounded-[2.5rem] p-8 md:p-10 shadow-lg transform -rotate-1">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Flame className="w-32 h-32 text-orange-600" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0 bg-orange-500 p-4 rounded-2xl shadow-md transform rotate-3">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 shadow-sm">
                      Hard Truth: Free Tier Reality Check
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-orange-900 italic tracking-tight leading-tight">
                      "{result.creativeWarning}"
                    </h3>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-orange-200 text-[10px] font-bold text-orange-600 uppercase tracking-widest text-center md:text-left">
                   Caution: Data Sovereignty is compromised in the free tier
                </div>
              </div>

              {/* BIG VERDICT CARD */}
              <div className={`rounded-[3rem] p-10 shadow-xl relative ${getVerdictTheme(result.recommendation).bg} ${getVerdictTheme(result.recommendation).text}`}>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 bg-white/20 p-6 rounded-3xl backdrop-blur-sm">
                    {getVerdictTheme(result.recommendation).icon}
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Final Security Verdict</span>
                    <h2 className="text-5xl font-black leading-none tracking-tighter">{getVerdictTheme(result.recommendation).label}</h2>
                    <p className="text-xl font-medium opacity-90 max-w-2xl">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* DETAILED RISK TABLE */}
              <div className="p-2 space-y-8 overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">Full Security Breakdown</h3>
                </div>
                
                <div className="overflow-x-auto border rounded-[2rem]">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                        <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Risk Category</th>
                        <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Security Impact & User Scenario</th>
                        <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.riskTable?.map((row, idx) => (
                        <tr key={idx} className="align-top hover:bg-slate-50/30 transition-colors">
                          <td className="py-6 px-6 font-black text-slate-900 whitespace-nowrap">{row.category}</td>
                          <td className="py-6 px-6 space-y-3 max-w-xl">
                            <div className="text-sm font-medium text-slate-700 leading-relaxed">
                              {row.description}
                            </div>
                            {row.scenario && (
                              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex gap-3 items-start group">
                                <Lightbulb className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 group-hover:animate-pulse" />
                                <div className="text-xs font-bold text-indigo-800 italic leading-relaxed">
                                  <span className="uppercase text-[9px] font-black not-italic block mb-1 opacity-60">Relatable Scenario:</span>
                                  {row.scenario}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-6 px-6 text-right whitespace-nowrap">
                            <SeverityBadge severity={row.severity} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SOURCES SECTION */}
              <div id="sources" className="p-2 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                    <Globe className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">Sources & Reference Documents</h3>
                </div>
                
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
                  <p className="text-sm font-bold text-slate-500 mb-6">
                    This report was generated by analyzing the following real-time documentation and privacy statements for <strong>{result.toolName}</strong>:
                  </p>
                  
                  <div className="space-y-6">
                    {result.sources && result.sources.length > 0 ? (
                      result.sources.map((s, i) => (
                        <div key={i} className="pb-6 border-b border-slate-200 last:border-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                             <div className="text-sm font-black text-slate-900">{s.title}</div>
                             {s.lastUpdated && (
                               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-slate-100 self-start">
                                 <Calendar className="w-3 h-3" />
                                 Last Updated: {s.lastUpdated}
                               </div>
                             )}
                          </div>
                          <a 
                            href={s.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-indigo-600 underline font-medium break-all block py-1 hover:text-indigo-800 transition-colors"
                          >
                            {s.uri}
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400 font-bold italic">Official {result.toolName} Documentation & Privacy Statements</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* PDF Footer */}
              <div className="hidden print:block text-center pt-10 border-t border-slate-200 mt-10">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Confidential Risk Report Generated by GuardAI</p>
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
               Back to Start
             </button>
          </div>
        )}
      </main>

      <footer className="py-10 border-t bg-white no-print">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">GuardAI Security Intelligence</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

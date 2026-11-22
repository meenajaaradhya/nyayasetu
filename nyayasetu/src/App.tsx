import { useState } from "react";
import { Scale, ExternalLink, BookOpen, CheckCircle2, Circle, MapPin, ShieldCheck, FileSignature, Building2 } from "lucide-react";
import { CIVIL_CATEGORIES, STATES } from "./data/civilData";
import type { CivilCategory } from "./data/civilData";
import { LegalChatbot } from "./components/LegalChatbot";

export function App() {
  const [activeTabId, setActiveTabId] = useState(CIVIL_CATEGORIES[0].id);
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const activeCategory: CivilCategory = CIVIL_CATEGORIES.find((c) => c.id === activeTabId) || CIVIL_CATEGORIES[0];
  const stateSpecificPortal =
    activeCategory.statePortals.find((s) => s.state === selectedState) ||
    activeCategory.statePortals.find((s) => s.state === "All India (Default)");

  const completedCount = activeCategory.nationalPortal.documents.filter((_, idx) => checkedDocs[`${activeCategory.id}-${idx}`]).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs"><Scale className="w-5 h-5" /></div>
            <div><h1 className="font-bold text-lg tracking-tight text-slate-900">NyayaSetu <span className="text-indigo-600 font-medium text-sm">Civil Portal Navigator</span></h1><p className="text-xs text-slate-500">Bare Acts + National & State e-Filing Router</p></div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <MapPin className="w-4 h-4 text-indigo-600" /><label htmlFor="state-select" className="text-xs font-medium text-slate-600">Jurisdiction State:</label>
            <select id="state-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="text-sm font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer">
              {STATES.map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1.5 overflow-x-auto pb-2.5 pt-1">
          {CIVIL_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory.id;
            return <button key={cat.id} onClick={() => setActiveTabId(cat.id)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${isActive ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}>{cat.shortTitle}</button>;
          })}
        </nav>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2"><ShieldCheck className="w-3.5 h-3.5" /> {activeCategory.laypersonReadiness}</span><h2 className="text-xl font-bold text-slate-900">{activeCategory.title}</h2><p className="text-sm text-slate-600 mt-1">{activeCategory.description}</p></div>
              <a href={activeCategory.indiaCodeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition"><BookOpen className="w-4 h-4 text-indigo-600" /> Read Bare Act ({activeCategory.bareAct.split(",")[0]}) <ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-indigo-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div><div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">Primary National e-Filing Portal</div><h3 className="font-bold text-base text-slate-900">{activeCategory.nationalPortal.name}</h3><p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeCategory.nationalPortal.jurisdictionAndFee}</p></div>
              <a href={activeCategory.nationalPortal.url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition">Launch Official Portal <ExternalLink className="w-4 h-4" /></a>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div><div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1"><Building2 className="w-3.5 h-3.5" /> {selectedState} Portal Integration</div>
                {stateSpecificPortal ? <><h3 className="font-bold text-base text-slate-900">{stateSpecificPortal.portalName}</h3><p className="text-xs text-slate-600 mt-2 leading-relaxed">{stateSpecificPortal.note}</p></> : <><h3 className="font-bold text-base text-slate-900">Centralized National Filing Applies</h3><p className="text-xs text-slate-600 mt-2 leading-relaxed">For {selectedState}, disputes in this category route directly through the National Portal on the left.</p></>}
              </div>
              <a href={stateSpecificPortal ? stateSpecificPortal.url : activeCategory.nationalPortal.url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition">Open {selectedState} / State Link <ExternalLink className="w-4 h-4" /></a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div><h3 className="font-bold text-sm text-slate-900 mb-3">Step-by-Step Filing Procedure (Party-in-Person)</h3><ol className="space-y-2">{activeCategory.nationalPortal.steps.map((step, index) => <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"><span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5">{index + 1}</span><span>{step}</span></li>)}</ol></div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5"><h3 className="font-bold text-sm text-slate-900">Pre-Filing Document Readiness</h3><span className="text-xs font-semibold text-indigo-600">{completedCount} / {activeCategory.nationalPortal.documents.length} Ready</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCategory.nationalPortal.documents.map((doc, idx) => {
                  const key = `${activeCategory.id}-${idx}`;
                  const checked = !!checkedDocs[key];
                  return <button key={key} onClick={() => setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }))} className={`flex items-center gap-2 text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${checked ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}>{checked ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className="w-4 h-4 text-slate-400 shrink-0" />}<span>{doc}</span></button>;
                })}
              </div>
              <button onClick={() => setExternalPrompt(`Draft a formal pre-filing complaint summary for a ${activeCategory.title} dispute in ${selectedState}.`)} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl transition cursor-pointer"><FileSignature className="w-4 h-4" /> Ask AI Chatbot to Draft My Complaint Summary</button>
            </div>
          </div>
        </section>
        <aside className="lg:col-span-5"><LegalChatbot selectedState={selectedState} activeCategory={activeCategory} onSelectCategory={(cat) => setActiveTabId(cat.id)} externalPrompt={externalPrompt} onClearExternalPrompt={() => setExternalPrompt(null)} /></aside>
      </main>
    </div>
  );
}

export default App;

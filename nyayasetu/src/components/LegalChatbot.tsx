import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bot, ExternalLink, FileText, Send, Sparkles, User } from "lucide-react";
import { CIVIL_CATEGORIES } from "../data/civilData";
import type { CivilCategory } from "../data/civilData";

interface Message { id: string; role: "user" | "assistant"; text: string; matchedCategory?: CivilCategory; draftText?: string; }
interface LegalChatbotProps { selectedState: string; activeCategory: CivilCategory; onSelectCategory: (cat: CivilCategory) => void; externalPrompt: string | null; onClearExternalPrompt: () => void; }

const classifyLocally = (query: string): CivilCategory => {
  const q = query.toLowerCase();
  if (q.includes("rent") || q.includes("deposit") || q.includes("landlord") || q.includes("tenant") || q.includes("evict")) return CIVIL_CATEGORIES.find((c) => c.id === "rental")!;
  if (q.includes("builder") || q.includes("rera") || q.includes("flat") || q.includes("possession") || q.includes("apartment")) return CIVIL_CATEGORIES.find((c) => c.id === "realestate")!;
  if (q.includes("salary") || q.includes("hr") || q.includes("employer") || q.includes("job") || q.includes("terminat") || q.includes("pf") || q.includes("wage")) return CIVIL_CATEGORIES.find((c) => c.id === "workplace")!;
  if (q.includes("invoice") || q.includes("contract") || q.includes("cheque") || q.includes("loan") || q.includes("client") || q.includes("payment")) return CIVIL_CATEGORIES.find((c) => c.id === "contracts")!;
  if (q.includes("trademark") || q.includes("copyright") || q.includes("logo") || q.includes("patent") || q.includes("brand")) return CIVIL_CATEGORIES.find((c) => c.id === "ip")!;
  if (q.includes("free lawyer") || q.includes("legal aid") || q.includes("lok adalat") || q.includes("mediat") || q.includes("afford")) return CIVIL_CATEGORIES.find((c) => c.id === "legalaid")!;
  return CIVIL_CATEGORIES.find((c) => c.id === "consumer")!;
};

const generateDraftTemplate = (category: CivilCategory, userQuery: string, state: string) => {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `FORMAL PRE-FILING COMPLAINT / NOTICE SUMMARY
Date: ${today}
Jurisdiction / State: ${state}
Applicable Law: ${category.bareAct}
Target Portal: ${category.nationalPortal.name} (${category.nationalPortal.url})

1. FACTUAL SUMMARY OF DISPUTE:
"${userQuery}"

2. PROCEDURAL CHRONOLOGY (FILL DATES BEFORE UPLOAD):
- Date of Transaction / Agreement: [DD/MM/YYYY]
- Date Cause of Action Arose: [DD/MM/YYYY]
- Date of Written Grievance to Opposite Party: [DD/MM/YYYY]

3. RELIEF SOUGHT:
- Principal Refund / Claim Amount: ₹[Enter Amount]
- Compensation for Harassment / Delay & Litigation Costs: ₹[Enter Amount]

4. ATTACHED EVIDENCE CHECKLIST:
${category.nationalPortal.documents.map((d) => `- [ ] ${d}`).join("\n")}`;
};

export const LegalChatbot: React.FC<LegalChatbotProps> = ({ selectedState, onSelectCategory, externalPrompt, onClearExternalPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: `Namaste! Describe your civil dispute in plain language (e.g., "My landlord in ${selectedState} is holding my ₹80,000 deposit" or "Online store refused refund for a broken phone"). I will identify the right law, link the exact government portal, and draft your complaint summary.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: textToSend }]);
    if (!overrideText) setInput("");
    setLoading(true);
    const lower = textToSend.toLowerCase();
    if (lower.includes("murder") || lower.includes("assault") || lower.includes("knife") || lower.includes("robbery") || lower.includes("kidnap")) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: "⚠️ Urgent Criminal Matter Detected: This portal covers Civil Law only. Physical assault, robbery, or violent crime requires immediate police intervention. Please dial 112 (National Emergency) or file an FIR at your nearest police station immediately." }]);
      setLoading(false); return;
    }
    const matched = classifyLocally(textToSend);
    onSelectCategory(matched);
    const wantsDraft = lower.includes("draft") || lower.includes("notice") || lower.includes("complaint") || lower.includes("write");
    let geminiUnavailable = false;
    try {
      const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, selectedState, categoryId: matched.id }),
      });
      if (!response.ok) throw new Error(`Gemini function returned HTTP ${response.status}`);
      const data: unknown = await response.json();
      const aiReply = data !== null && typeof data === "object" && "text" in data && typeof data.text === "string"
        ? data.text
        : undefined;
      if (!aiReply) throw new Error("Gemini function returned no response text");
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: aiReply, matchedCategory: matched, draftText: wantsDraft ? generateDraftTemplate(matched, textToSend, selectedState) : undefined }]);
      setLoading(false);
      return;
    } catch (error) {
      console.error("Gemini request failed; using local guidance instead.", error);
      geminiUnavailable = true;
    }
    const stateSpecific = matched.statePortals.find((s) => s.state === selectedState);
    const replyText = `${geminiUnavailable ? "Gemini is unavailable; showing local guidance instead.\n\n" : ""}` +
      `I've mapped your issue to **${matched.title}** under the **${matched.bareAct}** and switched your workspace tab.\n\n` +
      `• **Where to File:** ${stateSpecific ? `${stateSpecific.portalName} (${stateSpecific.note})` : matched.nationalPortal.name}\n` +
      `• **Jurisdiction & Fee:** ${matched.nationalPortal.jurisdictionAndFee}\n` +
      `• **Next Step:** Gather the ${matched.nationalPortal.documents.length} required PDFs shown in the checklist on the left before clicking Launch Portal.`;
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: replyText, matchedCategory: matched, draftText: generateDraftTemplate(matched, textToSend, selectedState) }]);
    setLoading(false);
  }, [input, onSelectCategory, selectedState]);

  useEffect(() => {
    if (externalPrompt) {
      void handleSendMessage(externalPrompt);
      onClearExternalPrompt();
    }
  }, [externalPrompt, handleSendMessage, onClearExternalPrompt]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[520px] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5"><div className="p-1.5 bg-indigo-500 rounded-lg"><Bot className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-sm leading-tight">NyayaSetu AI Triage</h3><p className="text-xs text-slate-300">Auto-routes to National & {selectedState} Portals</p></div></div>
        <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">Live Router</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5"><Bot className="w-4 h-4" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs"}`}>
              <div className="whitespace-pre-line">{m.text}</div>
              {m.matchedCategory && <div className="mt-3 pt-2.5 border-t border-slate-100"><a href={m.matchedCategory.nationalPortal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition">Open {m.matchedCategory.nationalPortal.name.split("(")[0]} <ExternalLink className="w-3.5 h-3.5" /></a></div>}
              {m.draftText && <details className="mt-2.5 bg-slate-900 text-slate-100 rounded-xl p-2.5 text-xs"><summary className="cursor-pointer font-medium text-indigo-300 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> View Ready-to-Copy Filing Draft</summary><pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-slate-200 overflow-x-auto">{m.draftText}</pre></details>}
            </div>
            {m.role === "user" && <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5"><User className="w-4 h-4" /></div>}
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-xs text-slate-500 pl-9"><Sparkles className="w-4 h-4 animate-spin text-indigo-600" /> Analyzing jurisdiction & portal rules...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="bg-amber-50 border-t border-amber-200 px-3 py-1.5 flex items-center gap-1.5 text-[11px] text-amber-800"><AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" /><span>Procedural navigation tool only — not formal legal advice. Verify details on official .gov.in portals.</span></div>
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Describe your issue in ${selectedState}...`} className="flex-1 text-sm border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl flex items-center justify-center transition cursor-pointer"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
};

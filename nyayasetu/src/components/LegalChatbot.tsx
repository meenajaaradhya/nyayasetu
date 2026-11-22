import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bot, ExternalLink, FileText, Search, Sparkles, User, X } from "lucide-react";
import { CIVIL_CATEGORIES } from "../data/civilData";
import { PRACTICAL_GUIDES } from "../data/practicalGuides";
import type { CivilCategory } from "../data/civilData";

interface Message { id: string; role: "user" | "assistant"; text: string; matchedCategory?: CivilCategory; draftText?: string; }
interface LegalChatbotProps { selectedState: string; onSelectCategory: (cat: CivilCategory) => void; }

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

const generateFirstContactTemplate = (category: CivilCategory, userQuery: string, state: string) => {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `INITIAL WRITTEN REQUEST — REVIEW BEFORE SENDING
Date: ${today}
State: ${state}
Topic: ${category.title}

To: [Name / customer support / HR / other contact]
Subject: Request to resolve [brief issue]

Hello,

I am contacting you about the following issue:
"${userQuery}"

Relevant dates or reference numbers: [Add only what is needed]
What I am requesting: [State the practical outcome you want]
Please let me know the next steps and expected response timeline.

I can provide relevant supporting records through a secure channel if needed.

Thank you,
[Your name]`;
};

export const LegalChatbot: React.FC<LegalChatbotProps> = ({ selectedState, onSelectCategory }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: `Namaste! Describe what happened in ${selectedState}. I can help organize practical next steps, records to keep, and questions to ask. Avoid sharing identifying or financial details.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend) return;
    setIsOpen(true);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: textToSend }]);
    if (!overrideText) setInput("");
    setLoading(true);
    const lower = textToSend.toLowerCase();
    if (lower.includes("murder") || lower.includes("assault") || lower.includes("knife") || lower.includes("robbery") || lower.includes("kidnap")) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: "This sounds urgent and may involve immediate danger. Call 112 in India or contact local emergency services now. This app can’t handle emergencies." }]);
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
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: aiReply, matchedCategory: matched, draftText: wantsDraft ? generateFirstContactTemplate(matched, textToSend, selectedState) : undefined }]);
      setLoading(false);
      return;
    } catch (error) {
      console.error("Gemini request failed; using local guidance instead.", error);
      geminiUnavailable = true;
    }
    const guide = PRACTICAL_GUIDES[matched.id];
    const replyText = `${geminiUnavailable ? "Gemini is unavailable; showing local guidance instead.\n\n" : ""}` +
      `This sounds like **${matched.title}**. You’re now viewing practical guidance for that topic.\n\n` +
      guide.firstSteps.slice(0, 3).map((step, index) => `${index + 1}. ${step}`).join("\n\n") +
      `\n\nOfficial starting point: ${guide.supportLabel}.`;
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: replyText, matchedCategory: matched, draftText: wantsDraft ? generateFirstContactTemplate(matched, textToSend, selectedState) : undefined }]);
    setLoading(false);
  }, [input, onSelectCategory, selectedState]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-6xl px-3 pb-3 sm:px-4">
        {isOpen && (
          <section aria-label="NyayaSetu chat" className="pointer-events-auto ml-auto mb-3 flex max-h-[65vh] max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between bg-civic-navy px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-civic-indigo p-1.5"><Bot className="h-5 w-5" /></span>
                <span><span className="block text-sm font-semibold">Ask NyayaSetu</span><span className="block text-xs text-slate-300">Practical next steps · {selectedState}</span></span>
              </div>
              <button type="button" aria-label="Close chat" onClick={() => setIsOpen(false)} className="rounded-lg p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </header>
            <div role="log" aria-live="polite" className="space-y-4 overflow-y-auto bg-civic-paper p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-civic-indigo"><Bot className="h-4 w-4" /></div>}
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${m.role === "user" ? "rounded-br-none bg-civic-indigo text-white" : "rounded-bl-none border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
                    <div className="whitespace-pre-line">{m.text}</div>
                    {m.matchedCategory && <div className="mt-3 border-t border-slate-100 pt-2.5"><a href={PRACTICAL_GUIDES[m.matchedCategory.id].supportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-civic-indigo hover:bg-indigo-100">{PRACTICAL_GUIDES[m.matchedCategory.id].supportLabel}<ExternalLink className="h-3.5 w-3.5" /></a></div>}
                    {m.draftText && <details className="mt-2.5 rounded-xl bg-civic-navy p-2.5 text-xs text-slate-100"><summary className="flex cursor-pointer items-center gap-1.5 font-medium text-indigo-200"><FileText className="h-3.5 w-3.5" /> View message template</summary><pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-slate-200">{m.draftText}</pre></details>}
                  </div>
                  {m.role === "user" && <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700"><User className="h-4 w-4" /></div>}
                </div>
              ))}
              {loading && <div className="flex items-center gap-2 pl-9 text-xs text-slate-500"><Sparkles className="h-4 w-4 animate-spin text-civic-indigo" /> Thinking through the next steps…</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-900">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
              <span>General information only—not legal advice. Don’t include passwords, Aadhaar, bank details, or private documents.</span>
            </div>
          </section>
        )}
        <form onSubmit={(event) => { event.preventDefault(); handleSendMessage(); }} className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-indigo-300 bg-indigo-50 p-2 shadow-xl shadow-indigo-200/50">
          <button type="button" aria-label={isOpen ? "Close chat" : "Open chat"} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-civic-navy text-white hover:bg-slate-800">
            <Bot className="h-5 w-5" />
          </button>
          <input id="chat-input" aria-label="Ask NyayaSetu a question" type="text" value={input} onFocus={() => setIsOpen(true)} onChange={(event) => setInput(event.target.value)} placeholder="Ask a question…" className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-civic-indigo" />
          <button type="submit" disabled={loading || !input.trim()} aria-label="Send question" className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-civic-indigo px-4 text-sm font-semibold text-white shadow-xs hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Search className="h-4 w-4" /><span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};

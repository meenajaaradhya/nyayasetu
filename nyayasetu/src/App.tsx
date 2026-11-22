import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CircleHelp,
  Download,
  FolderOpen,
  LogIn,
  MessageCircle,
  Newspaper,
  Scale,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { CIVIL_CATEGORIES, STATES } from "./data/civilData";
import type { CivilCategory } from "./data/civilData";
import { PRACTICAL_GUIDES } from "./data/practicalGuides";
import { LegalChatbot } from "./components/LegalChatbot";

type ExploreService = "know" | "updates" | "news" | "community" | "records" | "settings";
type NavigationItem =
  | { kind: "category"; id: string; title: string; description: string }
  | { kind: "service"; id: ExploreService; title: string; description: string };

interface LegalNewsArticle {
  url: string;
  title: string;
  source: string;
  indexedAt: string;
}

function isLegalNewsArticle(value: unknown): value is LegalNewsArticle {
  if (typeof value !== "object" || value === null) return false;
  const article = value as Record<string, unknown>;
  if (typeof article.url !== "string" || typeof article.title !== "string"
    || typeof article.source !== "string" || typeof article.indexedAt !== "string") return false;
  try {
    return new URL(article.url).protocol === "https:";
  } catch {
    return false;
  }
}

function formatIndexedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

interface SavedRecord {
  id: string;
  title: string;
  categoryId: string;
  nextDate: string;
  notes: string;
  checkedEvidence: string[];
  createdAt: string;
}

interface RecordStore {
  records: SavedRecord[];
  warning: string | null;
}

const RECORDS_KEY = "nyayasetu.records.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSavedRecord(value: unknown): value is SavedRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.categoryId === "string"
    && typeof value.nextDate === "string"
    && typeof value.notes === "string"
    && Array.isArray(value.checkedEvidence)
    && value.checkedEvidence.every((item) => typeof item === "string")
    && typeof value.createdAt === "string";
}

function loadRecordStore(): RecordStore {
  try {
    const saved = window.localStorage.getItem(RECORDS_KEY);
    if (!saved) return { records: [], warning: null };
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved records are not a list");
    const records = parsed.filter(isSavedRecord);
    return {
      records,
      warning: records.length === parsed.length ? null : "Some saved items could not be read.",
    };
  } catch (error) {
    console.error("Could not load local records.", error);
    return { records: [], warning: "Saved records could not be read from this browser." };
  }
}

const SERVICES: Array<{ id: ExploreService; title: string; description: string }> = [
  { id: "know", title: "Know the basics", description: "Understand the issue in plain language" },
  { id: "updates", title: "Law updates", description: "Check Acts, amendments, and coverage" },
  { id: "news", title: "Latest news", description: "Browse current legal headlines" },
  { id: "community", title: "Community", description: "Search public discussions" },
  { id: "records", title: "My records", description: "Keep notes, dates, and checklists" },
  { id: "settings", title: "Settings", description: "Privacy and app preferences" },
];

export function App() {
  const [activeTabId, setActiveTabId] = useState(CIVIL_CATEGORIES[0].id);
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [activeView, setActiveView] = useState<ExploreService | "topic">("topic");
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [recordStore, setRecordStore] = useState<RecordStore>(loadRecordStore);
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState(CIVIL_CATEGORIES[0].id);
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [serviceCarouselIndex, setServiceCarouselIndex] = useState(0);
  const [newsArticles, setNewsArticles] = useState<LegalNewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const activeCategory: CivilCategory =
    CIVIL_CATEGORIES.find((category) => category.id === activeTabId) || CIVIL_CATEGORIES[0];
  const guide = PRACTICAL_GUIDES[activeCategory.id];
  const statePortal = activeCategory.statePortals.find((portal) => portal.state === selectedState);
  const topic = `${activeCategory.title} ${activeCategory.bareAct} ${selectedState} India`;
  const encodedTopic = encodeURIComponent(topic);
  const newsUrl = `https://news.google.com/search?q=${encodedTopic}&hl=en-IN&gl=IN&ceid=IN:en`;
  const currentAffairsNewsUrl = `https://news.google.com/search?q=${encodeURIComponent("India law changes court decisions legal current affairs")}&hl=en-IN&gl=IN&ceid=IN:en`;
  const redditUrl = `https://www.reddit.com/search/?q=${encodedTopic}`;
  const xUrl = `https://x.com/search?q=${encodedTopic}`;
  const instagramUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com ${topic}`)}`;
  const acts = activeCategory.bareAct.split(" & ");

  const currentCarouselItem: NavigationItem = {
    kind: "service",
    ...(SERVICES[serviceCarouselIndex] ?? SERVICES[0]),
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setServiceCarouselIndex((index) => (index + 1) % SERVICES.length);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [serviceCarouselIndex]);

  useEffect(() => {
    if (activeView !== "news") return undefined;
    const controller = new AbortController();
    void fetch("/.netlify/functions/legal-news", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`News feed returned HTTP ${response.status}`);
        const payload: unknown = await response.json();
        if (typeof payload !== "object" || payload === null || !("articles" in payload) || !Array.isArray(payload.articles)) {
          throw new Error("News feed response had an unexpected format");
        }
        setNewsArticles(payload.articles.filter(isLegalNewsArticle));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Could not load current legal news.", error);
        setNewsError("Current articles could not be loaded right now. You can still browse recent coverage from the news search.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setNewsLoading(false);
      });
    return () => controller.abort();
  }, [activeView]);

  const persistRecords = (records: SavedRecord[]) => {
    try {
      window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
      setRecordStore({ records, warning: null });
    } catch (error) {
      console.error("Could not save local records.", error);
      setRecordStore({ records, warning: "These changes are only in memory and may be lost when you leave." });
    }
  };

  const exportRecords = () => {
    const file = new Blob([JSON.stringify(recordStore.records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nyayasetu-records.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearRecords = () => {
    if (!window.confirm("Delete all records saved in this browser? This cannot be undone.")) return;
    try {
      window.localStorage.removeItem(RECORDS_KEY);
      setRecordStore({ records: [], warning: null });
    } catch (error) {
      console.error("Could not clear local records.", error);
      setRecordStore((previous) => ({ ...previous, warning: "Records could not be removed from this browser." }));
    }
  };

  const addRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    persistRecords([{
      id: crypto.randomUUID(),
      title,
      categoryId: newCategoryId,
      nextDate: newDate,
      notes: newNotes.trim(),
      checkedEvidence: [],
      createdAt: new Date().toISOString(),
    }, ...recordStore.records]);
    setNewTitle("");
    setNewDate("");
    setNewNotes("");
  };

  const showScreen = (item: NavigationItem) => {
    if (item.kind === "category") {
      setActiveTabId(item.id);
      setActiveView("topic");
    } else if (item.kind === "service") {
      if (item.id === "news" && activeView !== "news") {
        setNewsLoading(true);
        setNewsError(null);
      }
      setActiveView(item.id);
    }
  };

  const IconForNavigation = (item: NavigationItem) => {
    if (item.kind === "category") return <Scale className="h-5 w-5" />;
    if (item.id === "know") return <BookOpenText className="h-5 w-5" />;
    if (item.id === "updates") return <Scale className="h-5 w-5" />;
    if (item.id === "news") return <Newspaper className="h-5 w-5" />;
    if (item.id === "community") return <MessageCircle className="h-5 w-5" />;
    if (item.id === "records") return <FolderOpen className="h-5 w-5" />;
    return <Settings className="h-5 w-5" />;
  };

  const moveCarousel = (step: number) => {
    const nextIndex = (serviceCarouselIndex + step + SERVICES.length) % SERVICES.length;
    setServiceCarouselIndex(nextIndex);
    showScreen({ kind: "service", ...SERVICES[nextIndex] });
  };

  const selectCarouselItem = () => {
    showScreen(currentCarouselItem);
  };

  return (
    <div className="min-h-screen bg-civic-paper pb-28 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <a href="#" className="flex items-center gap-3 text-inherit no-underline">
            <span className="rounded-2xl bg-civic-navy p-2.5 text-white"><Scale className="h-6 w-6" /></span>
            <span>
              <span className="block text-lg font-bold tracking-tight">NyayaSetu</span>
              <span className="block text-xs text-slate-500">A clearer next step for everyday legal issues</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <label htmlFor="state-select" className="sr-only">Choose your state</label>
            <select id="state-select" value={selectedState} onChange={(event) => setSelectedState(event.target.value)} className="max-w-40 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none">
              {STATES.filter((state) => state !== "All India (Default)").map((state) => <option key={state}>{state}</option>)}
            </select>
            <button type="button" onClick={() => setShowLoginInfo(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3">
          <nav aria-label="Legal topic tabs" className="flex snap-x gap-2 overflow-x-auto py-1 sm:flex-wrap sm:overflow-visible">
            {CIVIL_CATEGORIES.map((category) => {
              const isActive = activeTabId === category.id;
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    setActiveTabId(category.id);
                    setActiveView("topic");
                  }}
                  aria-pressed={isActive}
                  className={`shrink-0 snap-start rounded-xl border px-3 py-2 text-sm font-semibold transition ${isActive ? "border-civic-indigo bg-civic-indigo text-white" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"}`}
                >
                  {category.shortTitle}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Explore services</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous service" onClick={() => moveCarousel(-1)} className="shrink-0 rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 hover:border-civic-indigo hover:text-civic-indigo">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <nav aria-label="Services carousel" aria-roledescription="carousel" className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={selectCarouselItem}
                  aria-pressed={activeView === currentCarouselItem.id}
                  className="flex min-h-[92px] w-full items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-left shadow-sm transition hover:border-civic-indigo sm:gap-4 sm:px-5"
                >
                  <span className="inline-flex shrink-0 rounded-xl bg-white/80 p-2.5 text-civic-indigo">{IconForNavigation(currentCarouselItem)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">{currentCarouselItem.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600 sm:text-sm">{currentCarouselItem.description}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs tabular-nums text-slate-500 sm:block">{serviceCarouselIndex + 1} / {SERVICES.length}</span>
                </button>
              </nav>
              <button type="button" aria-label="Next service" onClick={() => moveCarousel(1)} className="shrink-0 rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 hover:border-civic-indigo hover:text-civic-indigo">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12">
        {activeView === "topic" && (
          <>
            <section className="py-7 sm:py-9">
              <div className="rounded-3xl bg-civic-navy p-6 text-white sm:p-9">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Let’s work through it</p>
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                  <div className="max-w-2xl">
                    <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{activeCategory.title}</h1>
                    <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">{activeCategory.description}</p>
                    <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-indigo-100">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      Start with clear information, keep a record, and decide what to do next.
                    </p>
                  </div>
                  <button type="button" onClick={() => document.getElementById("chat-input")?.focus()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-950 hover:bg-indigo-50">
                    Ask NyayaSetu <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">How the app helps</p>
                <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-900">Understand your options</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">NyayaSetu explains the issue in plain language, suggests practical first actions, and points you to trusted support—without pushing you straight into filing.</p>
                <h3 className="mt-5 text-sm font-semibold text-slate-800">For this issue</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{guide.summary}</p>
                <ol className="mt-5 space-y-4">
                  {guide.firstSteps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-civic-indigo">{index + 1}</span>
                      <span className="pt-1 text-sm leading-6 text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
              <aside className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="font-serif text-xl font-bold text-slate-900">Keep these records</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                    {guide.keepEvidence.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-600">✓</span>{item}</li>)}
                  </ul>
                  <button type="button" onClick={() => setActiveView("records")} className="mt-4 text-sm font-semibold text-civic-indigo hover:text-indigo-900">Save notes and dates <ArrowRight className="ml-1 inline h-4 w-4" /></button>
                </section>
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-amber-950"><CircleHelp className="h-4 w-4" /> Before you act</h2>
                  <p className="mt-2 text-sm leading-6 text-amber-900">{guide.avoid}</p>
                </section>
              </aside>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-slate-900">Trusted places to check next</h2>
                    <p className="mt-1 text-sm text-slate-600">Start with an official source. Local rules can differ.</p>
                  </div>
                  {activeCategory.id === "realestate" && statePortal && (
                    <a href={statePortal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-civic-indigo px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-800">
                      Check {selectedState} project information <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={guide.supportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50">{guide.supportLabel}<ArrowUpRight className="h-4 w-4" /></a>
                  <a href={activeCategory.indiaCodeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50">Read the official law text<ArrowUpRight className="h-4 w-4" /></a>
                </div>
              </section>
            </section>
          </>
        )}

        {activeView === "know" && (
          <section className="py-8">
            <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">The basics</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">Understand {activeCategory.shortTitle.toLowerCase()}</h1>
            <div className="mt-5 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-base leading-7 text-slate-700">{guide.summary}</p>
              <p className="mt-4 text-sm leading-6 text-slate-500">The laws that may be relevant include {activeCategory.bareAct}. The right answer depends on the facts and your state.</p>
              <a href={activeCategory.indiaCodeUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-civic-indigo px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-800">Read the official law text <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </section>
        )}

        {activeView === "updates" && (
          <section className="py-8">
            <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">Check the latest</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">Recent updates to {activeCategory.shortTitle.toLowerCase()} laws</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Search current Gazette notices and news for each listed Act. Confirm any change against the official law text before relying on it.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {acts.map((act) => (
                <article key={act} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="font-serif text-xl font-bold text-slate-900">{act}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-civic-indigo hover:bg-indigo-100" href={`https://www.google.com/search?q=${encodeURIComponent(`site:egazette.gov.in "${act}" amendment`)}`} target="_blank" rel="noopener noreferrer">Search Gazette notices <ArrowUpRight className="h-3.5 w-3.5" /></a>
                    <a className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200" href={`https://news.google.com/search?q=${encodeURIComponent(`"${act}" India law amendment`)}`} target="_blank" rel="noopener noreferrer">Search recent coverage <ArrowUpRight className="h-3.5 w-3.5" /></a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "news" && (
          <section className="py-8">
            <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">Latest coverage</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">Current affairs & law changes</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Recent India headlines about laws, court decisions, bills, and legal developments, collected from news publishers. Headlines link to the original publisher; news coverage is not the law.</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-bold text-slate-900">Recent articles</h2>
                <span className="text-xs text-slate-500">GDELT news discovery feed · refreshed periodically</span>
              </div>
              {newsLoading && <p role="status" className="py-5 text-sm text-slate-600">Loading recent articles…</p>}
              {!newsLoading && newsArticles.length === 0 && !newsError && <p className="py-5 text-sm text-slate-600">No recent articles are available right now. Try the live search below.</p>}
              {newsError && <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{newsError}</p>}
              {newsArticles.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {newsArticles.map((article) => (
                    <article key={article.url} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold text-slate-500">{article.source} · Indexed {formatIndexedDate(article.indexedAt)}</p>
                      <h3 className="mt-2 font-semibold leading-6 text-slate-900">{article.title}</h3>
                      <a className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-civic-indigo hover:text-indigo-900" href={article.url} target="_blank" rel="noopener noreferrer">
                        Read at publisher <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-4 max-w-3xl text-xs leading-5 text-slate-500">Use an article as a starting point only. Confirm any proposed or reported legal change with the Gazette of India, Parliament, India Code, or the relevant court order.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 rounded-xl bg-civic-indigo px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-800" href={currentAffairsNewsUrl} target="_blank" rel="noopener noreferrer">Search current India legal news <ArrowUpRight className="h-4 w-4" /></a>
              <a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50" href={newsUrl} target="_blank" rel="noopener noreferrer">Search {activeCategory.shortTitle} news <ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </section>
        )}

        {activeView === "community" && (
          <section className="py-8">
            <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">Community conversations</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">See how others describe similar issues</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These searches open public discussions. Personal stories can help you think of questions, but they are not verified legal guidance. Never post account numbers, addresses, or private documents.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50" href={redditUrl} target="_blank" rel="noopener noreferrer">Search Reddit</a>
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50" href={xUrl} target="_blank" rel="noopener noreferrer">Search X / Twitter</a>
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50" href={instagramUrl} target="_blank" rel="noopener noreferrer">Find indexed Instagram posts</a>
            </div>
          </section>
        )}

        {activeView === "records" && (
          <section className="py-8">
            <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">Your private workspace</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">My records</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Save a short note, an important date, and a checklist for each matter. Records stay in this browser; this demo has no account sync or file uploads.</p>
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              This browser storage is not encrypted. Avoid saving passwords, Aadhaar numbers, bank details, or highly sensitive documents.
            </div>
            {recordStore.warning && <p role="status" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{recordStore.warning}</p>}
            <form onSubmit={addRecord} className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">Record name
                <input required maxLength={100} value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="e.g. Builder handover follow-up" className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 font-normal outline-none focus:border-indigo-500" />
              </label>
              <label className="text-sm font-semibold">Topic
                <select value={newCategoryId} onChange={(event) => setNewCategoryId(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal">
                  {CIVIL_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.shortTitle}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Next date (optional)
                <input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
              </label>
              <label className="text-sm font-semibold sm:row-span-2">Notes
                <textarea maxLength={2000} value={newNotes} onChange={(event) => setNewNotes(event.target.value)} placeholder="Add a short timeline or reminder…" className="mt-1 block min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal outline-none focus:border-indigo-500" />
              </label>
              <button type="submit" className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-civic-indigo px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-800">Save record</button>
            </form>

            <div className="mt-5 space-y-3">
              {recordStore.records.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No records yet. Add a note or date above to get started.</div>}
              {recordStore.records.map((record) => {
                const category = CIVIL_CATEGORIES.find((item) => item.id === record.categoryId) || CIVIL_CATEGORIES[0];
                const evidence = PRACTICAL_GUIDES[category.id].keepEvidence;
                return (
                  <article key={record.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold">{record.title}</h2>
                        <p className="mt-1 text-xs text-slate-500">{category.shortTitle}{record.nextDate ? ` · Next date: ${record.nextDate}` : ""}</p>
                      </div>
                      <button type="button" onClick={() => persistRecords(recordStore.records.filter((item) => item.id !== record.id))} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </div>
                    {record.notes && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{record.notes}</p>}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Evidence checklist</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {evidence.map((item) => (
                          <label key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                            <input
                              type="checkbox"
                              checked={record.checkedEvidence.includes(item)}
                              onChange={(event) => {
                                const checkedEvidence = event.target.checked
                                  ? [...record.checkedEvidence, item]
                                  : record.checkedEvidence.filter((saved) => saved !== item);
                                persistRecords(recordStore.records.map((saved) => saved.id === record.id ? { ...saved, checkedEvidence } : saved));
                              }}
                              className="mt-1 accent-indigo-600"
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeView === "settings" && (
          <section className="py-8">
            <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">Make it yours</p>
            <h1 className="mt-1 font-serif text-3xl font-bold">Settings</h1>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="font-serif text-xl font-bold text-slate-900">Account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Sign-in is a visual preview only. Accounts and cloud sync are not connected, and this screen never asks for or stores a password.</p>
                <button type="button" onClick={() => setShowLoginInfo(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"><LogIn className="h-4 w-4" /> Preview sign-in</button>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="font-serif text-xl font-bold text-slate-900">Language and region</h2>
                <p className="mt-2 text-sm text-slate-600">App language: English</p>
                <label htmlFor="settings-state" className="mt-3 block text-sm font-semibold">Your state</label>
                <select id="settings-state" value={selectedState} onChange={(event) => setSelectedState(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                  {STATES.filter((state) => state !== "All India (Default)").map((state) => <option key={state}>{state}</option>)}
                </select>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
                <h2 className="font-serif text-xl font-bold text-slate-900">Your data</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Records are saved in this browser only. They are not synced to an account or backed up. Gemini questions may be sent to Google when the AI service is configured.</p>
                {recordStore.warning && <p role="status" className="mt-3 text-sm text-rose-700">{recordStore.warning}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={exportRecords} disabled={recordStore.records.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"><Download className="h-4 w-4" /> Export records</button>
                  <button type="button" onClick={clearRecords} disabled={recordStore.records.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete all records</button>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-5 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-civic-indigo" />
          <p>NyayaSetu shares general information, not legal advice. Check current rules with official sources or a qualified local professional. News and community posts are not authoritative.</p>
        </div>
      </footer>

      <LegalChatbot selectedState={selectedState} onSelectCategory={(category) => { setActiveTabId(category.id); setActiveView("topic"); }} />

      {showLoginInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowLoginInfo(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="login-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-civic-indigo">Preview</p>
                <h2 id="login-title" className="mt-1 font-serif text-2xl font-bold text-slate-900">Sign-in is coming later</h2>
              </div>
              <button type="button" aria-label="Close sign-in preview" onClick={() => setShowLoginInfo(false)} className="rounded-lg p-2 hover:bg-slate-100"><span aria-hidden="true">×</span></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">This version has no account system. Your saved notes stay in this browser. Don’t enter a password here; no credentials are collected.</p>
            <label className="mt-4 block text-sm font-semibold text-slate-600">Email
              <input disabled placeholder="Preview only" className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-normal text-slate-400" />
            </label>
            <label className="mt-3 block text-sm font-semibold text-slate-600">Password
              <input disabled type="password" placeholder="Not connected" className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-normal text-slate-400" />
            </label>
            <button type="button" onClick={() => setShowLoginInfo(false)} className="mt-5 w-full rounded-xl bg-civic-indigo px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-800">Continue without an account</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

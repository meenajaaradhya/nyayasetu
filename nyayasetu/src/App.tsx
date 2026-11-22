import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpenText,
  CircleHelp,
  MessageCircle,
  Newspaper,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { CIVIL_CATEGORIES, STATES } from "./data/civilData";
import type { CivilCategory } from "./data/civilData";
import { PRACTICAL_GUIDES } from "./data/practicalGuides";
import { LegalChatbot } from "./components/LegalChatbot";

type ExploreService = "know" | "updates" | "news" | "community";

const EXPLORE_SERVICES: Array<{ id: ExploreService; title: string; description: string }> = [
  { id: "know", title: "Know the basics", description: "A plain-language starting point" },
  { id: "updates", title: "Recent law updates", description: "Check current Acts and amendments" },
  { id: "news", title: "Latest news", description: "Browse current legal headlines" },
  { id: "community", title: "Community experiences", description: "Search public discussions" },
];

export function App() {
  const [activeTabId, setActiveTabId] = useState(CIVIL_CATEGORIES[0].id);
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedService, setSelectedService] = useState<ExploreService>("know");

  const activeCategory: CivilCategory =
    CIVIL_CATEGORIES.find((category) => category.id === activeTabId) || CIVIL_CATEGORIES[0];
  const guide = PRACTICAL_GUIDES[activeCategory.id];
  const statePortal = activeCategory.statePortals.find((portal) => portal.state === selectedState);
  const topic = `${activeCategory.title} ${activeCategory.bareAct} ${selectedState} India`;
  const encodedTopic = encodeURIComponent(topic);
  const newsUrl = `https://news.google.com/search?q=${encodedTopic}&hl=en-IN&gl=IN&ceid=IN:en`;
  const redditUrl = `https://www.reddit.com/search/?q=${encodedTopic}`;
  const xUrl = `https://x.com/search?q=${encodedTopic}`;
  const instagramUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com ${topic}`)}`;
  const acts = activeCategory.bareAct.split(" & ");

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <a href="#" className="flex items-center gap-3 text-inherit no-underline">
            <span className="rounded-2xl bg-indigo-600 p-2.5 text-white"><Scale className="h-6 w-6" /></span>
            <span>
              <span className="block text-lg font-bold tracking-tight">NyayaSetu</span>
              <span className="block text-xs text-slate-500">Practical help for everyday legal problems</span>
            </span>
          </a>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <label htmlFor="state-select" className="text-sm text-slate-600">Your state</label>
            <select id="state-select" value={selectedState} onChange={(event) => setSelectedState(event.target.value)} className="max-w-40 bg-transparent text-sm font-semibold outline-none">
              {STATES.filter((state) => state !== "All India (Default)").map((state) => <option key={state}>{state}</option>)}
            </select>
          </div>
        </div>
        <nav aria-label="Choose a topic" className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {CIVIL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveTabId(category.id)}
              aria-current={category.id === activeCategory.id ? "page" : undefined}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category.id === activeCategory.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {category.shortTitle}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12">
        <section className="py-8 sm:py-10">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white sm:p-9">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Start with a practical plan</p>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{activeCategory.title}</h1>
                <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">{activeCategory.description}</p>
                <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-indigo-100">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  Get organized, understand your options, and choose whether you need formal help.
                </p>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("chatbot")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-950 hover:bg-indigo-50"
              >
                Ask the guide <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section aria-label="Explore services" className="-mt-2 mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Explore</p>
              <h2 className="mt-1 text-lg font-bold">Useful services for this topic</h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">Swipe to explore</span>
          </div>
          <div className="flex snap-x gap-3 overflow-x-auto pb-3">
            {EXPLORE_SERVICES.map((service) => {
              const Icon = service.id === "know" ? BookOpenText : service.id === "updates" ? Scale : service.id === "news" ? Newspaper : MessageCircle;
              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  aria-pressed={selectedService === service.id}
                  className={`min-w-[220px] snap-start rounded-2xl border p-4 text-left transition sm:min-w-[245px] ${selectedService === service.id ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50"}`}
                >
                  <span className={`mb-3 inline-flex rounded-xl p-2 ${selectedService === service.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-indigo-700"}`}><Icon className="h-5 w-5" /></span>
                  <span className="block font-semibold">{service.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{service.description}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            {selectedService === "know" && (
              <div>
                <h3 className="font-bold">In plain language</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{guide.summary}</p>
                <p className="mt-3 text-xs text-slate-500">The legal framework includes: {activeCategory.bareAct}. Rules and remedies depend on your facts and state.</p>
              </div>
            )}
            {selectedService === "updates" && (
              <div>
                <h3 className="font-bold">Check recent changes to the relevant laws</h3>
                <p className="mt-1 text-sm text-slate-600">We don’t guess whether a law changed. Use these live searches and confirm any amendment against the official text or Gazette.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {acts.map((act) => (
                    <div key={act} className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold">{act}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100" href={`https://www.google.com/search?q=${encodeURIComponent(`site:egazette.gov.in "${act}" amendment`)}`} target="_blank" rel="noopener noreferrer">Gazette updates <ArrowUpRight className="h-3.5 w-3.5" /></a>
                        <a className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200" href={`https://news.google.com/search?q=${encodeURIComponent(`"${act}" India law amendment`)}`} target="_blank" rel="noopener noreferrer">Recent coverage <ArrowUpRight className="h-3.5 w-3.5" /></a>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">News and search results are discovery aids, not proof of the law in force.</p>
              </div>
            )}
            {selectedService === "news" && (
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold">Recent articles about {activeCategory.shortTitle}</h3>
                  <p className="mt-1 text-sm text-slate-600">Open a live news search for this topic and state. Check the publication date and verify legal claims against primary sources.</p>
                </div>
                <a className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700" href={newsUrl} target="_blank" rel="noopener noreferrer">Browse latest articles <ArrowUpRight className="h-4 w-4" /></a>
              </div>
            )}
            {selectedService === "community" && (
              <div>
                <h3 className="font-bold">Search people’s experiences</h3>
                <p className="mt-1 text-sm text-slate-600">Community posts may suggest questions to ask, but are personal stories—not verified legal guidance. Don’t post identifying details.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50" href={redditUrl} target="_blank" rel="noopener noreferrer">Search Reddit</a>
                  <a className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50" href={xUrl} target="_blank" rel="noopener noreferrer">Search X / Twitter</a>
                  <a className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50" href={instagramUrl} target="_blank" rel="noopener noreferrer">Find indexed Instagram posts</a>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">A practical starting point</p>
            <h2 className="mt-1 text-xl font-bold">What you can do next</h2>
            <ol className="mt-5 space-y-4">
              {guide.firstSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{index + 1}</span>
                  <span className="pt-1 text-sm leading-6 text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold">Keep these records</h2>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">
                {guide.keepEvidence.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-600">✓</span>{item}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="flex items-center gap-2 font-bold text-amber-950"><CircleHelp className="h-4 w-4" /> Be careful</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">{guide.avoid}</p>
            </section>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">Trusted places to check next</h2>
                <p className="mt-1 text-sm text-slate-600">Start with an official source. State-specific procedures can differ.</p>
              </div>
              {activeCategory.id === "realestate" && statePortal && (
                <a href={statePortal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                  {selectedState} project / RERA information <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={guide.supportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50">{guide.supportLabel}<ArrowUpRight className="h-4 w-4" /></a>
              <a href={activeCategory.indiaCodeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50">Read the official law text<ArrowUpRight className="h-4 w-4" /></a>
            </div>
          </section>
        </section>

        <section id="chatbot" className="mt-10 scroll-mt-6">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Ask a question</p>
            <h2 className="mt-1 text-2xl font-bold">Get help thinking through your next step</h2>
            <p className="mt-1 text-sm text-slate-600">Share only the facts needed. Don’t include account numbers, Aadhaar, addresses, or other sensitive details.</p>
          </div>
          <LegalChatbot
            selectedState={selectedState}
            onSelectCategory={(category) => setActiveTabId(category.id)}
          />
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-5 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          <p>NyayaSetu provides general information and navigation, not legal advice. Laws and procedures change; verify current rules with official sources or a qualified local professional. Community posts and news are not authoritative.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

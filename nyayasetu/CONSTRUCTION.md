# NyayaSetu Construction Guide

This project is a Vite, React, and TypeScript application styled with Tailwind CSS.

## Civic visual system

The interface uses Inter for UI text, Newsreader for legal headings and Act titles, and JetBrains Mono for templates. Theme colors are defined in `src/index.css`: civic navy for trusted anchors, justice indigo for primary actions, warm paper for the page canvas, slate for readable text, emerald for completed states, and amber for cautions.

## Install

```bash
npm install
npm install lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

## Run

```bash
npm run dev
```

Open the URL displayed by Vite, normally `http://localhost:5173/`.

## Practical guidance and updates

The topic pages prioritize low-friction next steps, evidence to preserve, and trusted support resources rather than filing instructions. Legal categories remain visible as tabs. Only the single-card services carousel advances in order; its previous/next controls select services, and automatic movement changes only the preview card. The main page changes when a topic tab or service card is selected.

The Latest News screen loads recent English-language India headlines about laws, court decisions, bills, and legal developments through the Netlify `legal-news` function and GDELT. It links to each publisher, caches the feed for 15 minutes, and does not copy full articles or summaries. Netlify functions run on the deployed site or through Netlify Dev; plain Vite `npm run dev` does not execute them, so use the live-search fallback locally. Headlines are discovery aids only; verify legal changes against the Gazette, Parliament, India Code, or court orders. Live Gazette/news searches for each listed Act and public Reddit, X, and indexed Instagram searches are also available. Social content is linked out and is not scraped or presented as legal authority.

## Records and account preview

The Records section stores short notes, dates, and evidence checklists in this browser's local storage. It does not upload documents or sync to an account. The sign-in screen is a disabled visual preview, not authentication. Avoid saving highly sensitive information; export or delete local records in Settings.

## Optional Gemini Integration

In Netlify, add `GEMINI_API_KEY` under **Site configuration → Environment variables**. The Netlify Function reads this server-side key; do not use a `VITE_` prefix or commit the secret. Without a configured key or if Gemini is unavailable, local topic routing and practical guidance remain available.

The GitHub repository keeps the app in the `nyayasetu/` subdirectory. The repository-root `netlify.toml` sets that as the Netlify base directory.

## Production Build

```bash
npm run build
```

The deployable output is written to `dist/`.

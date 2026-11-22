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

The topic pages prioritize low-friction next steps, evidence to preserve, and trusted support resources rather than filing instructions. The Explore carousel opens plain-language guidance, live Gazette and news searches for each listed Act, and public Reddit, X, and indexed Instagram searches. Community posts and news are discovery aids only; verify legal changes against official sources. Social content is linked out to its platform and is not scraped or presented as legal authority.

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

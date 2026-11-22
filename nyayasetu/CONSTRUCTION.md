# NyayaSetu Construction Guide

This project is a Vite, React, and TypeScript application styled with Tailwind CSS.

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

## Optional Gemini Integration

In Netlify, add `GEMINI_API_KEY` under **Site configuration → Environment variables**. The Netlify Function reads this server-side key; do not use a `VITE_` prefix or commit the secret. Without a configured key or if Gemini is unavailable, the local routing and notice-drafting fallback remains available.

## Production Build

```bash
npm run build
```

The deployable output is written to `dist/`.

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

Copy `.env.example` to `.env` and set `VITE_GEMINI_API_KEY`. Without a key or when the API fails, the local intelligent routing and notice-drafting engine remains available.

## Production Build

```bash
npm run build
```

The deployable output is written to `dist/`.

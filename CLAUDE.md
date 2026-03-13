# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity

**Atheer (أثير)** is an Arabic-language, mobile-first gift experience platform targeting Saudi Arabia.
It sells curated physical gift boxes bundled with a digital interactive experience: the gift recipient scans a QR code and goes through a themed unlock flow before seeing their gift.

Three layers:
- **Customer PWA** — public-facing storefront and purchase funnel
- **Admin Dashboard** — internal order management with AI-powered product curation
- **Cloudflare Worker** — secure backend API proxy that keeps the Gemini AI key server-side

---

## Commands

```bash
npm install        # install dependencies (first time only)
npm run dev        # start dev server on http://localhost:3000
npm run build      # build production bundle to /dist
npm run preview    # preview production build locally
```

There is no linting setup and no test suite. `package.json` has only `dev`, `build`, and `preview` scripts.

The Cloudflare Worker (`cloudflare_worker.js`) is deployed separately — it is NOT bundled by Vite:
```bash
wrangler publish cloudflare_worker.js
wrangler secret put GEMINI_API_KEY
```

---

## Architecture

### File Layout
All source files live at the **project root** — there is no `src/` directory.

| File | Role |
|------|------|
| `main.jsx` | React entry point, service worker registration, all routes |
| `AtheerCompletePWA.jsx` | Customer storefront (single large component file) |
| `AtheerAdminDashboard.jsx` | Admin dashboard (single large component file) |
| `GiftExperience.jsx` | QR gift reveal page for recipients |
| `cloudflare_worker.js` | Cloudflare Worker — Gemini AI proxy |
| `index.css` | Only the three `@tailwind` directives |
| `public/sw.js` | Service worker — network-first with offline fallback |
| `public/_redirects` | SPA fallback rule for Netlify/Cloudflare Pages |

### Routing (`main.jsx`)
```
/               → AtheerCompletePWA.jsx
/gift/:orderId  → GiftExperience.jsx
/admin/*        → AtheerAdminDashboard.jsx
```

### Customer PWA — View-Based Navigation
`AtheerCompletePWA.jsx` uses **no internal router**. Navigation is a `view` state string driving a strict linear funnel:

```
"landing" → "tiers" → "survey" → "checkout" → "success"
```

The `showDemo` boolean overlays a `DemoModal` (interactive gift reveal simulator) on any view.

### AI Flow
Frontend calls the Cloudflare Worker (`https://atheer-ai.atheer-ai.workers.dev`) with `POST { promptText }`.
The worker proxies to Gemini (`gemini-2.5-flash-preview-09-2025`) and returns the raw JSON.
Callers extract `data.candidates[0].content.parts[0].text`.

Used in two places:
- `AtheerCompletePWA.jsx` — generates a personalized gift message at checkout
- `AtheerAdminDashboard.jsx` — runs AI product curation for a selected order (`runAiAgent`)

### Firestore
Same `firebaseConfig` object is hardcoded in each JSX file that uses Firebase — do not extract it.
Safe initialization: `getApps().length ? getApps()[0] : initializeApp(firebaseConfig)`.

Order document shape written at checkout:
```js
{
  orderId,          // "ATH-XXXXX"
  customerName, customerPhone,
  tier: { id, name, price },
  surveyData: { time, vibe, interest, note },
  wizardData: { persona, surprise, tone },
  recommendedTierId,
  aiGiftMessage,
  moyasarPaymentId, // present only if paid via Moyasar
  status: "pending",
  createdAt: serverTimestamp(),
}
```

Admin subscribes to orders with `onSnapshot` (real-time). `GiftExperience.jsx` uses `getDocs` (single fetch).

### Payment (Moyasar)
Moyasar SDK loaded dynamically via CDN (version `1.14.0`) — not in `package.json`.
The `on_completed` callback is held in a `useRef` (`moyasarCallbackRef`) to avoid stale closures.
On `payment.status === "paid"`, the ref's callback writes to Firestore and navigates to success.

---

## Strict Constraints

1. **Do not rename** the critical state variables in `AtheerCompletePWA.jsx`: `view`, `showDemo`, `demoStep`, `demoCode`, `selectedTier`, `activeTemplate`, `surveyData`, `wizardData`, `recommendedTierId`.

2. **Do not add npm packages** without explicit user request.

3. **Preserve the funnel order**: `landing → tiers → survey → checkout → success`. No skipping, no side-routes.

4. **Each JSX file must stay a single file** — do not split into subcomponents.

5. **No router inside `AtheerCompletePWA.jsx`** — navigation is view-state only.

6. **Firebase config stays hardcoded** in each file — do not extract to `.env`.

7. **`cloudflare_worker.js` is not bundled by Vite** — do not import it.

8. **All UI must be Arabic RTL** — use `dir="rtl"`, Arabic labels, and RTL-aware flex layouts.

9. **Demo unlock code and admin PIN are both `"2024"`** — do not change without confirmation.

---

## Design System

- **Styling**: Tailwind utility classes only — no CSS-in-JS, no CSS modules
- **Background**: `bg-[#07070a]` everywhere; admin sidebar/header: `bg-[#0a0f1d]`
- **Primary accent**: violet-600 → fuchsia-600 → pink-600 gradient
- **Glass cards**: `bg-white/[0.06] border-white/10 backdrop-blur-xl`
- **Animations**: framer-motion — presets `fade`, `rise`, `slideIn` defined at top of `AtheerCompletePWA.jsx`

---

## External Services Summary

| Service | Key/URL | Notes |
|---------|---------|-------|
| Firebase | Hardcoded in JSX files | Client-safe; access controlled by Firestore rules |
| Cloudflare Worker | `https://atheer-ai.atheer-ai.workers.dev` | `GEMINI_API_KEY` is a Worker secret |
| Moyasar | `pk_test_vcFUhjZQxIlSRNO891M31n33jJg` | Test publishable key, safe to expose |

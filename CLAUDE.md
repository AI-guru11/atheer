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
npm run dev        # start dev server on http://localhost:3000 (auto-opens browser)
npm run build      # build production bundle to /dist
npm run preview    # preview production build locally
```

There is no linting setup and no test suite. `package.json` has only `dev`, `build`, and `preview` scripts.

The Cloudflare Worker (`cloudflare_worker.js`) is deployed separately — it is NOT bundled by Vite:
```bash
wrangler deploy cloudflare_worker.js
wrangler secret put GEMINI_API_KEY
```

---

## Architecture

### File Layout
Source files live at the **project root** — there is no `src/` directory.

| File | Role |
|------|------|
| `main.jsx` | React entry point, service worker registration, routes |
| `AtheerCompletePWA.jsx` | Customer storefront (~2,150 lines, single file) |
| `AtheerAdminDashboard.jsx` | Admin dashboard (~610 lines, single file) |
| `GiftExperience.jsx` | QR gift reveal page for recipients (~400 lines) |
| `cloudflare_worker.js` | Cloudflare Worker — Gemini AI proxy |
| `index.css` | Only the three `@tailwind` directives |
| `index.html` | HTML entry (lang="ar", dir="rtl", PWA meta tags) |
| `manifest.json` | PWA manifest (standalone, Arabic, dark theme) |
| `vite.config.js` | Vite config — port 3000, source maps enabled |
| `tailwind.config.js` | Scans `./index.html`, `./src/**/*.{js,jsx}`, and `./*.jsx` |
| `postcss.config.js` | PostCSS config — tailwindcss + autoprefixer |
| `public/sw.js` | Service worker — network-first with offline fallback |
| `public/_redirects` | SPA fallback rule for Netlify/Cloudflare Pages |
| `generate-icons.cjs` | Script to generate PWA icon assets |

### Dependencies
```json
{
  "firebase": "^12.10.0",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.344.0",
  "qrcode.react": "^4.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-router-dom": "^7.13.1"
}
```
Dev dependencies include `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `vite`, and `@types/react*`.

Moyasar SDK (payment) is loaded dynamically from CDN (v`1.14.0`) — NOT in `package.json`.

### Routing (`main.jsx`)
```
/               → AtheerCompletePWA.jsx
/gift/:orderId  → GiftExperience.jsx
/admin/*        → AtheerAdminDashboard.jsx
```

---

## Customer PWA (`AtheerCompletePWA.jsx`)

### View-Based Navigation
Uses **no internal router**. Navigation is a `view` state string driving a strict linear funnel:

```
"landing" → "tiers" → "survey" → "checkout" → "success"
```

The `showDemo` boolean overlays a `DemoModal` (interactive gift reveal simulator) on any view.

### Critical State Variables — DO NOT RENAME
```javascript
view               // current funnel step string
showDemo           // boolean — DemoModal overlay
demoStep           // step index inside the demo flow
demoCode           // user-entered code in demo
selectedTier       // chosen tier object
activeTemplate     // template carousel index
surveyData         // { time, vibe, interest, note }
wizardData         // { persona, surprise, tone }
recommendedTierId  // result from TryGiftFlowWizard
```

Additional important state (may be renamed only if not in the list above):
```javascript
customerName, customerPhone, aiGiftMessage,
showMoyasarForm, isSubmitting, orderId, deferredInstallPrompt,
showInstallBanner, demoError, isGeneratingMessage, checkoutError,
prefersReducedMotion, saveData
```

### Internal Components (defined in the same file)
- `GlassCard` — Glass-morphism card wrapper (React.memo)
- `PrimaryButton`, `SecondaryButton` — Styled button variants
- `StepPill` — Funnel step indicator pill
- `PageShell` — Page layout wrapper
- `Background` — Animated gradient orbs + grid pattern (framer-motion)
- `Navbar` — Fixed header: logo, step pills, "Demo" & "Start" buttons
- `TiltCard` — 3D tilt effect on hover (motion values)
- `ReviewsSection` — Customer testimonials carousel (4 reviews, autoplay)
- `TryGiftFlowWizard` — 3-step mini wizard (persona → surprise type → tone) that sets `recommendedTierId`
- `DemoModal` — Interactive QR unlock simulator (unlock code: `"2024"`) — defined inside the main App component
- `InstallBanner` — PWA install prompt (Android `beforeinstallprompt` + iOS manual instructions) — defined inside the main App component

### Static Data
- **TIERS:** Bronze (150 SAR), Silver (350 SAR, `popular: true`), Gold (700 SAR)
- **TEMPLATES:** 3 themed digital experience styles — Cyber (الثيم السايبر), Classic (الثيم الكلاسيكي), Nature (ثيم الطبيعة) with Unsplash images
- **REVIEWS:** 4 customer testimonials (نوف, سارة, عبدالله, ريم), all with score 5

### Animation Presets (defined at top of file)
```javascript
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const rise = { initial: { y: 22, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -12, opacity: 0 } };
const slideIn = { initial: { x: 44, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -44, opacity: 0 } };
```

### Code Patterns
- `cx()` helper for conditional class names
- `WORKER_URL` constant for the Cloudflare Worker endpoint
- `useMemo()` for derived state (recommendations, sorted tiers, checkout prices)
- `useCallback()` for event handlers (avoids unnecessary re-renders)
- `useRef()` for stale closure prevention (Moyasar callback via `moyasarCallbackRef`)

### Performance & Accessibility
- Detects `prefers-reduced-motion` — disables heavy animations
- Detects `connection.saveData` — reduces asset load on slow connections
- Scrolls to top on every view change
- `decoding="async"` + `fetchPriority="high"` on above-fold images
- `<link rel="preconnect">` to Unsplash CDN (in `index.html`)

---

## Admin Dashboard (`AtheerAdminDashboard.jsx`)

### Access Control
PIN gate: hardcoded `"2024"`. Session stored in `sessionStorage` (not `localStorage`).

### Tabs
Four tabs identified by these IDs and header titles:
- **dashboard** — `'لوحة التحكم'` — Stats cards (total sales, active orders, pending AI) + recent orders overview
- **orders** — `'إدارة الطلبات'` — Orders data table with real-time Firestore sync
- **ai** — `'سجل توصيات AI'` — Product recommendation engine per order
- **qr** — `'الصفحات الرقمية'` — Digital page management with QR code generation

Sidebar navigation labels differ slightly from header titles (e.g., sidebar shows `'الطلبات'` for orders).

### AI Agent (`runAiAgent`)
- Calls Worker at `WORKER_URL` with a detailed prompt requesting a JSON response
- Parses JSON from Gemini response (handles ` ```json ``` ` blocks or raw JSON via regex)
- Extracts: `personaAnalysis`, `profitMargin`, `digitalTheme` (vibe/colors/puzzle), `products` array (name/price/url/reason)

### Layout
- Sidebar navigation (collapsible on mobile, slides via transform)
- Header with search (desktop-only) + notification bell
- Responsive grid layout
- Sidebar/header background: `bg-[#0a0f1d]`; main content background: `bg-[#07070a]`

---

## Gift Experience (`GiftExperience.jsx`)

### Screens
Five screens driven by a `status` state string (`loading | error | date_locked | locked | revealed`):
1. `LoadingScreen` — spinner while fetching order from Firestore
2. `ErrorScreen` — not found / error state
3. `DateLockedScreen` — gift locked until `unlockDate` (formatted in Arabic via `ar-SA` locale)
4. `LockScreen` — puzzle question input + answer validation (`customQuestion` / `customAnswer`)
5. `RevealScreen` — success state with confetti + tier badge + AI gift message + survey interests

Additionally, a `Confetti` helper component renders 40 falling particles with random colors/delays (used within `RevealScreen`).

### Data Fetching
Uses `getDocs()` (single fetch, not real-time). Queries orders collection with `where("orderId", "==", orderId)`.

### Firebase Config
`GiftExperience.jsx` reads Firebase config from **environment variables** (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`) — not hardcoded. This is the exception to the hardcoded config rule.

---

## AI Flow

Frontend calls the Cloudflare Worker (`https://atheer-ai.atheer-ai.workers.dev`) with `POST { promptText }`.
The worker proxies to Gemini (`gemini-2.5-flash-preview-09-2025`) and returns the raw JSON.
Callers extract `data.candidates[0].content.parts[0].text`.

Both `AtheerCompletePWA.jsx` and `AtheerAdminDashboard.jsx` define a `WORKER_URL` constant pointing to the same endpoint.

Used in two places:
- `AtheerCompletePWA.jsx` — generates a personalized Arabic gift message at checkout
- `AtheerAdminDashboard.jsx` — runs AI product curation for a selected order (`runAiAgent`)

---

## Firestore

Same `firebaseConfig` object is hardcoded in `AtheerCompletePWA.jsx` and `AtheerAdminDashboard.jsx` — do not extract it.
`GiftExperience.jsx` is the exception — it uses `VITE_` environment variables.

**Safe initialization pattern (used in all three files):**
```javascript
const fbApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
```

**Order document shape written at checkout:**
```js
{
  orderId,              // "ATH-XXXXX"
  customerName, customerPhone,
  tier: { id, name, price },
  surveyData: { time, vibe, interest, note },
  wizardData: { persona, surprise, tone },
  recommendedTierId,
  aiGiftMessage,
  moyasarPaymentId,     // present only if paid via Moyasar
  status: "pending",
  createdAt: serverTimestamp(),
}
```

**Read patterns:**
- Admin (`AtheerAdminDashboard.jsx`) — `onSnapshot()` with `orderBy("createdAt", "desc")` (real-time)
- Gift page (`GiftExperience.jsx`) — `getDocs()` with `where("orderId", "==", orderId)` (single fetch)

---

## Payment (Moyasar)

Moyasar SDK loaded dynamically via CDN (version constant `MOYASAR_VERSION = "1.14.0"`) — not in `package.json`.

**Flow:**
1. User reaches checkout view → clicks "Proceed to Payment"
2. Moyasar CSS + JS loaded dynamically via `document.createElement` (checked by element ID to avoid double-loading)
3. `on_completed` callback fires with payment object (held in `moyasarCallbackRef` to avoid stale closures)
4. If `payment.status === "paid"`: save order to Firestore with `moyasarPaymentId`, navigate to success
5. On failure: show Arabic error message, reset form

**Price calculation:**
```javascript
const price = parseInt(selectedTier?.price) || 0;
const vat = Math.round(price * 0.15);   // 15% VAT
const total = price + vat;              // sent to Moyasar as total * 100 (halalas)
```

---

## Strict Constraints

1. **Do not rename** the critical state variables in `AtheerCompletePWA.jsx`: `view`, `showDemo`, `demoStep`, `demoCode`, `selectedTier`, `activeTemplate`, `surveyData`, `wizardData`, `recommendedTierId`.

2. **Do not add npm packages** without explicit user request.

3. **Preserve the funnel order**: `landing → tiers → survey → checkout → success`. No skipping, no side-routes.

4. **Each JSX file must stay a single file** — do not split into subcomponents.

5. **No router inside `AtheerCompletePWA.jsx`** — navigation is view-state only.

6. **Firebase config stays hardcoded** in `AtheerCompletePWA.jsx` and `AtheerAdminDashboard.jsx` — do not extract to `.env`. (`GiftExperience.jsx` already uses env vars — leave it as-is.)

7. **`cloudflare_worker.js` is not bundled by Vite** — do not import it.

8. **All UI must be Arabic RTL** — use `dir="rtl"`, Arabic labels, and RTL-aware flex layouts.

9. **Demo unlock code and admin PIN are both `"2024"`** — do not change without confirmation.

---

## Design System

- **Styling**: Tailwind utility classes only — no CSS-in-JS, no CSS modules
- **Background**: `bg-[#07070a]` for main content; admin sidebar/header: `bg-[#0a0f1d]`
- **Primary accent**: violet-600 → fuchsia-600 → pink-600 gradient
- **Glass cards**: `bg-white/[0.06] border-white/10 backdrop-blur-xl`
- **Animations**: framer-motion — presets `fade`, `rise`, `slideIn` defined at top of `AtheerCompletePWA.jsx` using `initial`/`animate`/`exit` keys

---

## External Services Summary

| Service | Key/URL | Notes |
|---------|---------|-------|
| Firebase | Hardcoded in PWA + Admin JSX; env vars in GiftExperience | Client-safe; access controlled by Firestore rules |
| Cloudflare Worker | `https://atheer-ai.atheer-ai.workers.dev` | `GEMINI_API_KEY` is a Worker secret |
| Gemini | `gemini-2.5-flash-preview-09-2025` | Accessed only through Worker |
| Moyasar | `pk_test_vcFUhjZQxIlSRNO891M31n33jJg` | Test publishable key, safe to expose |
| Moyasar CDN | `https://cdn.moyasar.com/mpf/1.14.0/` | Loaded dynamically at checkout |

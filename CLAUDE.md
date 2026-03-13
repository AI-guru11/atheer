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
| `AtheerCompletePWA.jsx` | Customer storefront (~2,700 lines, single file) |
| `AtheerAdminDashboard.jsx` | Admin dashboard (~550 lines, single file) |
| `GiftExperience.jsx` | QR gift reveal page for recipients (~350 lines) |
| `cloudflare_worker.js` | Cloudflare Worker — Gemini AI proxy |
| `index.css` | Only the three `@tailwind` directives |
| `index.html` | HTML entry (lang="ar", dir="rtl", PWA meta tags) |
| `manifest.json` | PWA manifest (standalone, Arabic, dark theme) |
| `vite.config.js` | Vite config — port 3000, source maps enabled |
| `tailwind.config.js` | Scans `./*.jsx` and `./index.html` |
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
showMoyasarForm, isSubmitting, orderId, deferredInstallPrompt
```

### Internal Components (all defined in the same file)
- `Navbar` — Fixed header: logo, step pills, "Demo" & "Start" buttons
- `Background` — Animated gradient orbs + grid pattern (framer-motion)
- `GlassCard` — Glass-morphism card wrapper
- `PrimaryButton`, `SecondaryButton` — Styled button variants
- `TiltCard` — 3D tilt effect on hover (motion values)
- `ReviewsSection` — Customer testimonials carousel (4 reviews, autoplay)
- `TryGiftFlowWizard` — 3-step mini wizard (persona → surprise type → tone) that sets `recommendedTierId`
- `DemoModal` — Interactive QR unlock simulator (unlock code: `"2024"`)
- `InstallBanner` — PWA install prompt (Android `beforeinstallprompt` + iOS manual instructions)

### Static Data
- **TIERS:** Bronze (150 SAR), Silver (350 SAR), Gold (700 SAR)
- **TEMPLATES:** 3 themed digital experience styles — Cyber, Classic, Nature (Unsplash images)
- **REVIEWS:** 4 customer testimonials with star ratings

### Animation Presets (defined at top of file)
```javascript
const fade = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const rise = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const slideIn = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
```

### Code Patterns
- `cx()` helper for conditional class names
- `useMemo()` for derived state (recommendations, sorted tiers)
- `useCallback()` for event handlers (avoids unnecessary re-renders)
- `useRef()` for stale closure prevention (Moyasar callback)

### Performance & Accessibility
- Detects `prefers-reduced-motion` — disables heavy animations
- Detects `connection.saveData` — reduces asset load on slow connections
- Scrolls to top on every view change
- `decoding="async"` + `fetchPriority="high"` on above-fold images
- `<link rel="preconnect">` to Unsplash CDN

---

## Admin Dashboard (`AtheerAdminDashboard.jsx`)

### Access Control
PIN gate: hardcoded `"2024"`. Session stored in `sessionStorage` (not `localStorage`).

### Tabs
- **Dashboard** — Stats cards (total sales, active orders, pending AI) + recent orders overview
- **Orders (أحدث الطلبات)** — Full data table with real-time Firestore sync
- **AI (سجل AI)** — Product recommendation engine per order
- **QR (الصفحات الرقمية)** — Digital page management with QR code generation

### AI Agent (`runAiAgent`)
- Calls Worker with a detailed prompt requesting a JSON response
- Parses JSON from Gemini response (handles ` ```json ` blocks or raw JSON)
- Extracts: persona analysis, profit margin, digital theme (vibe/colors/puzzle), product list

### Layout
- Sidebar navigation (collapsible on mobile)
- Header with search + notification bell
- Responsive grid layout; background: `bg-[#0a0f1d]` for sidebar/header

---

## Gift Experience (`GiftExperience.jsx`)

### Screens
1. `LoadingScreen` — spinner while fetching order from Firestore
2. `ErrorScreen` — not found / error state
3. `DateLockedScreen` — gift locked until `unlockDate` (formatted in Arabic)
4. `LockScreen` — puzzle question input + answer validation (`customQuestion` / `customAnswer`)
5. `RevealScreen` — success state with confetti + tier badge + AI gift message + survey interests
6. `Confetti` — 40 falling particles with random colors/delays

### Data Fetching
Uses `getDocs()` (single fetch, not real-time). Queries orders collection with `where("orderId", "==", orderId)`.

### Firebase Config
`GiftExperience.jsx` reads Firebase config from **environment variables** (`VITE_FIREBASE_API_KEY`, etc.) — not hardcoded. This is the exception to the hardcoded config rule below.

---

## AI Flow

Frontend calls the Cloudflare Worker (`https://atheer-ai.atheer-ai.workers.dev`) with `POST { promptText }`.
The worker proxies to Gemini (`gemini-2.5-flash-preview-09-2025`) and returns the raw JSON.
Callers extract `data.candidates[0].content.parts[0].text`.

Used in two places:
- `AtheerCompletePWA.jsx` — generates a personalized Arabic gift message at checkout
- `AtheerAdminDashboard.jsx` — runs AI product curation for a selected order (`runAiAgent`)

---

## Firestore

Same `firebaseConfig` object is hardcoded in `AtheerCompletePWA.jsx` and `AtheerAdminDashboard.jsx` — do not extract it.
`GiftExperience.jsx` is the exception — it uses `VITE_` environment variables.

**Safe initialization pattern (used everywhere):**
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
- Gift page (`GiftExperience.jsx`) — `getDocs()` (single fetch)

---

## Payment (Moyasar)

Moyasar SDK loaded dynamically via CDN (version `1.14.0`) — not in `package.json`.

**Flow:**
1. User reaches checkout view → clicks "Proceed to Payment"
2. Moyasar form loads dynamically (CSS + JS via CDN)
3. `on_completed` callback fires with payment object (held in `moyasarCallbackRef` to avoid stale closures)
4. If `payment.status === "paid"`: save order to Firestore with `moyasarPaymentId`, navigate to success
5. On failure: show Arabic error message, reset form

**Price calculation:**
```javascript
const price = parseInt(selectedTier?.price) || 0;
const vat = Math.round(price * 0.15);   // 15% VAT
const total = price + vat;              // sent to Moyasar in halalas (÷100 internally)
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
- **Background**: `bg-[#07070a]` everywhere; admin sidebar/header: `bg-[#0a0f1d]`
- **Primary accent**: violet-600 → fuchsia-600 → pink-600 gradient
- **Glass cards**: `bg-white/[0.06] border-white/10 backdrop-blur-xl`
- **Animations**: framer-motion — presets `fade`, `rise`, `slideIn` defined at top of `AtheerCompletePWA.jsx`

---

## External Services Summary

| Service | Key/URL | Notes |
|---------|---------|-------|
| Firebase | Hardcoded in PWA + Admin JSX; env vars in GiftExperience | Client-safe; access controlled by Firestore rules |
| Cloudflare Worker | `https://atheer-ai.atheer-ai.workers.dev` | `GEMINI_API_KEY` is a Worker secret |
| Gemini | `gemini-2.5-flash-preview-09-2025` | Accessed only through Worker |
| Moyasar | `pk_test_vcFUhjZQxIlSRNO891M31n33jJg` | Test publishable key, safe to expose |
| Moyasar CDN | `https://cdn.moyasar.com/mpf/1.14.0/` | Loaded dynamically at checkout |

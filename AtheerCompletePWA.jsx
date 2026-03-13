import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Crown,
  Gift,
  Heart,
  Layers,
  MousePointer2,
  Palette,
  PlayCircle,
  Puzzle,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// ─── Firebase + Cloudflare Worker config ────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCB0dlwfQH_18XumO-SHavjnGl7eDiH1Xc",
  authDomain: "atheer-gifts.firebaseapp.com",
  projectId: "atheer-gifts",
  storageBucket: "atheer-gifts.firebasestorage.app",
  messagingSenderId: "1091133241710",
  appId: "1:1091133241710:web:041692f83c2786f6d5697f",
  measurementId: "G-8W0T793MWW",
};
const fbApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const WORKER_URL = "https://atheer-ai.atheer-ai.workers.dev";
// ────────────────────────────────────────────────────────────────────────────

/**
 * ATHEER PLATFORM - FULL INTEGRATED PWA (FRONTEND)
 * Features: Landing, Interactive Demo (with logic), Survey, Tiers, Checkout, Success.
 *
 * STRICT:
 * - Preserve the same state names and linear flow navigation
 * - No new external libraries
 * - One runnable file
 */

const TEMPLATES = [
  {
    title: "الثيم السايبر",
    desc: "نيون + تقنية + نبض",
    color: "from-cyan-400/70 via-blue-500/60 to-indigo-600/70",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80",
  },
  {
    title: "الثيم الكلاسيكي",
    desc: "فخامة + هدوء + هيبة",
    color: "from-amber-500/60 via-orange-700/55 to-rose-700/60",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80",
  },
  {
    title: "ثيم الطبيعة",
    desc: "أورجانيك + مريح + صافي",
    color: "from-emerald-400/60 via-teal-600/55 to-sky-700/55",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  },
];

const TIERS = [
  {
    id: "bronze",
    name: "الفئة البرونزية",
    price: "150",
    icon: <Zap className="w-6 h-6" />,
    features: ["منتج أساسي مختار بالذكاء الاصطناعي", "صفحة ويب تفاعلية موحدة", "تغليف قياسي"],
  },
  {
    id: "silver",
    name: "الفئة الفضية",
    price: "350",
    icon: <Gift className="w-6 h-6" />,
    popular: true,
    features: ["مجموعة منتجات (3 قطع)", "تجربة رقمية مخصصة", "تغليف فاخر بالاسم", "لغز رقمي خاص"],
  },
  {
    id: "gold",
    name: "الفئة الذهبية",
    price: "700",
    icon: <Crown className="w-6 h-6" />,
    features: ["صندوق الرفاهية (براندات)", "تجربة 3D وألعاب", "تغليف ملكي خاص", "فيديو إهداء احترافي"],
  },
];

const REVIEWS = [
  {
    name: "نوف",
    city: "الرياض",
    quote: "أول مرة أشوف هدية تتحول إلى «تجربة»… حرفياً انبهار. الQR لحاله يسوى.",
    tag: "فضي",
    score: 5,
  },
  {
    name: "سارة",
    city: "جدة",
    quote: "التغليف ممتاز، لكن الأجمل هو رحلة الأسئلة قبل كشف الهدية. مشاركة العائلة كانت ممتعة.",
    tag: "ذهبي",
    score: 5,
  },
  {
    name: "عبدالله",
    city: "أبها",
    quote: "فكرة ذكية تسوي تسويق ذاتي: كل من شاف التجربة سألني من وين جبتها.",
    tag: "فضي",
    score: 5,
  },
  {
    name: "ريم",
    city: "الدمام",
    quote: "واجهة فخمة… تحسها شركة AI مو متجر. تجربة الجوال ممتازة.",
    tag: "برونزي",
    score: 5,
  },
];

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const rise = { initial: { y: 22, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -12, opacity: 0 } };
const slideIn = { initial: { x: 44, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -44, opacity: 0 } };

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

const GlassCard = React.memo(function GlassCard({ className = "", children }) {
  return (
    <div
      className={cx(
        "relative rounded-[34px] border border-white/10 bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_24px_110px_-45px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[34px] bg-[radial-gradient(80%_60%_at_40%_0%,rgba(168,85,247,.25),transparent_60%)] opacity-70"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[34px] ring-1 ring-white/5" />
      <div className="relative">{children}</div>
    </div>
  );
});

function PrimaryButton({ className = "", disabled = false, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "group relative w-full sm:w-auto inline-flex items-center justify-center gap-2",
        "rounded-2xl px-7 py-4 font-black text-base md:text-lg",
        "transition-all duration-300",
        disabled ? "opacity-35 cursor-not-allowed" : "hover:-translate-y-[1px] active:translate-y-0",
        "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600",
        "shadow-[0_22px_60px_-24px_rgba(168,85,247,0.9)]",
        "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:ring-offset-2 focus:ring-offset-[#07070a]",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
    </button>
  );
}

function SecondaryButton({ className = "", disabled = false, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "w-full sm:w-auto inline-flex items-center justify-center gap-2",
        "rounded-2xl px-7 py-4 font-bold text-base md:text-lg",
        "border border-white/10 bg-white/[0.05] hover:bg-white/[0.09] transition-all",
        "focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-[#07070a]",
        disabled && "opacity-40 cursor-not-allowed hover:bg-white/[0.05]",
        className
      )}
    >
      {children}
    </button>
  );
}

function StepPill({ active = false, label }) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide",
        active
          ? "bg-violet-500/15 text-violet-200 border border-violet-400/25"
          : "bg-white/5 text-gray-400 border border-white/10"
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", active ? "bg-violet-400" : "bg-gray-500")} />
      {label}
    </div>
  );
}

function PageShell({ children, max = "max-w-7xl" }) {
  return <div className={cx("pt-28 pb-20 px-6 mx-auto w-full", max)}>{children}</div>;
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Solid dark base — prevents any white flash when Safari invalidates this layer */}
      <div className="absolute inset-0 bg-[#07070a]" />
      <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:74px_74px]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_20%,transparent_0%,rgba(0,0,0,.45)_60%,rgba(0,0,0,.85)_100%)]" />

      <motion.div
        aria-hidden="true"
        className="absolute -top-40 -left-28 h-[640px] w-[640px] rounded-full bg-violet-700/25 blur-3xl"
        style={{ willChange: "transform" }}
        animate={{ x: [0, 26, -14, 0], y: [0, 10, -18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-56 -right-40 h-[760px] w-[760px] rounded-full bg-fuchsia-600/18 blur-3xl"
        style={{ willChange: "transform" }}
        animate={{ x: [0, -22, 16, 0], y: [0, -12, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl"
        style={{ willChange: "transform" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Navbar({ view, setView, setShowDemo }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className={cx(
          "absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-violet-700/25 via-fuchsia-600/10 to-transparent pointer-events-none transition-opacity duration-300",
          scrolled ? "opacity-0" : "opacity-100"
        )}
      />
      <div className={cx("mx-auto max-w-7xl px-4 md:px-6 transition-all duration-300", scrolled ? "pt-3" : "pt-6")}>
        <div
          className={cx(
            "flex items-center justify-between rounded-3xl border border-white/[0.12] bg-[#07070a]/80 backdrop-blur-xl transition-all duration-300",
            scrolled ? "px-4 py-2.5" : "px-5 py-4"
          )}
        >
          <button type="button" onClick={() => setView("landing")} className="flex items-center gap-2.5 text-white hover:opacity-90">
            <div
              className={cx(
                "relative rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 flex items-center justify-center transition-all duration-300",
                scrolled ? "w-8 h-8" : "w-10 h-10"
              )}
            >
              <Sparkles className={cx("text-white transition-all duration-300", scrolled ? "w-4 h-4" : "w-5 h-5")} />
              <span className="absolute -inset-1 rounded-2xl bg-white/10 blur-md opacity-30" />
            </div>
            <div className="leading-tight text-right">
              <div className={cx("font-black tracking-tight transition-all duration-300", scrolled ? "text-base" : "text-lg md:text-xl")}>
                أثـيـر
              </div>
              {!scrolled && <div className="text-[10px] text-gray-400 -mt-0.5">AI Smart Gifts</div>}
            </div>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <StepPill active={view === "landing"} label="الرئيسية" />
            <StepPill active={view === "tiers"} label="الفئات" />
            <StepPill active={view === "survey"} label="البصمة" />
            <StepPill active={view === "checkout"} label="الدفع" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDemo(true)}
              className={cx(
                "hidden sm:inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all",
                scrolled ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
              )}
            >
              تجربة <PlayCircle className="w-4 h-4 text-violet-300" />
            </button>
            <button
              onClick={() => setView("tiers")}
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl bg-white text-black font-black hover:bg-gray-100 transition-all",
                scrolled ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
              )}
            >
              ابدأ الآن <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function TiltCard({ children, className = "" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-30, 30], [10, -10]);
  const rotateY = useTransform(x, [-30, 30], [-10, 10]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - (r.left + r.width / 2);
    const py = e.clientY - (r.top + r.height / 2);
    x.set(Math.max(-30, Math.min(30, px / 10)));
    y.set(Math.max(-30, Math.min(30, py / 10)));
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY }}
      className={cx("will-change-transform", className)}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div>{children}</div>
    </motion.div>
  );
}

function ReviewsSection() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % REVIEWS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const active = REVIEWS[idx];

  return (
    <div className="mt-20">
      <div className="text-center mb-8">
        <div className="text-sm text-gray-400">آراء العملاء</div>
        <div className="text-2xl md:text-3xl font-black mt-2">الناس تحب «التجربة» قبل الهدية</div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_0%,rgba(236,72,153,.18),transparent_55%)] opacity-80" />
        <div className="relative p-7 md:p-10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200">
              <Star className="w-4 h-4 text-amber-300" />
              متوسط التقييم: 5.0
            </div>

            <div className="flex items-center gap-2">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Review ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={cx(
                    "h-2.5 rounded-full transition-all",
                    idx === i ? "bg-white w-10" : "bg-white/25 hover:bg-white/40 w-2.5"
                  )}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7">
                <div className="text-2xl md:text-3xl font-black leading-snug">“{active.quote}”</div>
                <div className="mt-5 flex items-center gap-3 text-sm text-gray-300 flex-wrap">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <User className="w-4 h-4 text-violet-200" />
                    {active.name}
                  </span>
                  <span className="text-gray-500">—</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <Box className="w-4 h-4 text-fuchsia-200" />
                    {active.city}
                  </span>
                  <span className="text-gray-500">—</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <Crown className="w-4 h-4 text-amber-200" />
                    {active.tag}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <MousePointer2 className="w-5 h-5" />, label: "سهولة", desc: "خطوات واضحة" },
                    { icon: <Smartphone className="w-5 h-5" />, label: "جوال", desc: "PWA سريع" },
                    { icon: <ShieldCheck className="w-5 h-5" />, label: "ثقة", desc: "دفع آمن" },
                    { icon: <Heart className="w-5 h-5" />, label: "مشاعر", desc: "لحظة كشف" },
                  ].map((b) => (
                    <div key={b.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 font-black text-sm text-white">
                        <span className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-200">
                          {b.icon}
                        </span>
                        {b.label}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-2">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}

// --- Commercial Recommendation Engine ---
function getTierRecommendation({ persona, surprise, tone }) {
  // Heuristic mapping aimed for conversion + fewer decision points.
  // Default: silver (best value)
  if (!persona || !surprise || !tone) return { tierId: "silver", reason: "أفضل توازن بين السعر والتجربة" };

  const highStakesPersona = ["father", "mother", "boss", "partner"].includes(persona);
  const highValueSurprise = ["trip", "product"].includes(surprise);
  const premiumTone = ["classy", "mysterious"].includes(tone);

  // GOLD for high-stakes + high-value
  if ((highStakesPersona && highValueSurprise) || (highStakesPersona && premiumTone)) {
    return { tierId: "gold", reason: "هدية عالية الأثر — تحتاج تجربة وتغليف أقوى" };
  }

  // BRONZE for casual + low-risk
  const casualPersona = ["friend"].includes(persona);
  const lowRiskSurprise = ["coupon", "food"].includes(surprise);
  const playfulTone = ["fun"].includes(tone);

  if (casualPersona && lowRiskSurprise && playfulTone) {
    return { tierId: "bronze", reason: "بداية سريعة وبسيطة بدون تعقيد" };
  }

  // Otherwise SILVER
  return { tierId: "silver", reason: "الأكثر طلباً — تجربة قوية بسعر منطقي" };
}

/**
 * Mini Try Flow Wizard (Landing Preview Only)
 * IMPORTANT: does NOT break linear flow; it only previews and then directs user to tiers or demo.
 */
function TryGiftFlowWizard({ onStartReal, onOpenDemo, onCompleteWizard, recommendation }) {
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState("");
  const [surprise, setSurprise] = useState("");
  const [tone, setTone] = useState("");

  useEffect(() => {
    if (step === 0) {
      setSurprise("");
      setTone("");
    }
    if (step === 1) {
      setTone("");
    }
  }, [step]);

  const canNext0 = Boolean(persona);
  const canNext1 = Boolean(surprise);
  const canNext2 = Boolean(tone);

  const personaLabel = useMemo(() => {
    const map = {
      friend: "صديق/صديقة",
      father: "الأب",
      mother: "الأم",
      partner: "شريك/شريكة",
      boss: "مدير/مديرة",
    };
    return map[persona] || "—";
  }, [persona]);

  const surpriseLabel = useMemo(() => {
    const map = {
      product: "منتج ملموس",
      coupon: "كوبون/قسيمة",
      trip: "تذكرة/تجربة سفر",
      food: "طلب طعام/توصيل",
    };
    return map[surprise] || "—";
  }, [surprise]);

  const toneLabel = useMemo(() => {
    const map = {
      classy: "فخم وهادئ",
      fun: "مرح وخفيف",
      mysterious: "غامض وهيبة",
    };
    return map[tone] || "—";
  }, [tone]);

  const preview = useMemo(() => {
    const personaBits = {
      friend: { greet: "يا صديقي", hint: "اللي يعرفك… يعرف ذوقك" },
      father: { greet: "يا أغلى أب", hint: "لأنك تستحق تقدير فوق العادة" },
      mother: { greet: "يا أمي", hint: "حُب لا يوصف… فخلّه تجربة" },
      partner: { greet: "يا أجمل شخص", hint: "تفاصيل صغيرة… أثر كبير" },
      boss: { greet: "أستاذي", hint: "تقدير محترم… بأسلوب مختلف" },
    };

    const surpriseBits = {
      product: { reward: "كشف هدية ملموسة", code: "BOX-REVEAL" },
      coupon: { reward: "قسيمة رقمية خاصة", code: "COUPON-DROP" },
      trip: { reward: "تذكرة/رحلة مفاجأة", code: "TRIP-TICKET" },
      food: { reward: "طلب مفاجأة لذيذ", code: "FOOD-TREAT" },
    };

    const toneBits = {
      classy: { line: "أنت تستحق الأفضل… دائماً.", badge: "CLASSY" },
      fun: { line: "جاهز للمفاجأة؟ لأنك فزت 😄", badge: "FUN" },
      mysterious: { line: "لا تستعجل… كل شيء له توقيت.", badge: "MYST" },
    };

    const p = personaBits[persona] || { greet: "مرحباً", hint: "تجربة مختلفة" };
    const s = surpriseBits[surprise] || { reward: "مفاجأة", code: "ATH-DEMO" };
    const t = toneBits[tone] || { line: "ابدأ التجربة", badge: "ATHEER" };

    return {
      headline: `${p.greet}…`,
      message: t.line,
      hint: p.hint,
      reward: s.reward,
      code: s.code,
      badge: t.badge,
    };
  }, [persona, surprise, tone]);

  const submitWizard = useCallback(() => {
    const payload = { persona, surprise, tone };
    onCompleteWizard?.(payload);
  }, [persona, surprise, tone, onCompleteWizard]);

  useEffect(() => {
    // When step3 complete, compute recommendation immediately.
    if (step === 2 && canNext2) submitWizard();
  }, [step, canNext2, submitWizard]);

  return (
    <div className="mt-20">
      <div className="text-center mb-8">
        <div className="text-sm text-gray-400">اكتشف ما يناسبك</div>
        <div className="text-2xl md:text-3xl font-black mt-2">دعنا نقترح الهدية المثالية</div>
        <div className="text-gray-400 text-sm mt-3 max-w-2xl mx-auto">
          ثلاثة أسئلة بسيطة… واقتراح واحد قوي بدلاً من التردد.
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_70%_0%,rgba(99,102,241,.18),transparent_60%)] opacity-90" />

        <div className="relative p-7 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-violet-200" />
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-400 uppercase tracking-[0.25em]">SMART RECOMMENDER</div>
                <div className="text-xl md:text-2xl font-black">Mini Gift Wizard</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {["1", "2", "3"].map((n, i) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStep(i)}
                  className={cx(
                    "h-2.5 rounded-full transition-all",
                    step === i ? "bg-white w-10" : "bg-white/25 hover:bg-white/40 w-2.5"
                  )}
                  aria-label={`Step ${n}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200">
                    <Sparkles className="w-4 h-4 text-violet-200" />
                    Step {step + 1}/3
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <StepPill active={step === 0} label="الشخص" />
                    <StepPill active={step === 1} label="المفاجأة" />
                    <StepPill active={step === 2} label="الاقتراح" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="s0" {...rise} transition={{ duration: 0.28, ease: "easeOut" }}>
                      <div className="text-lg md:text-xl font-black mb-2">لمن الهدية؟</div>
                      <div className="text-sm text-gray-400 mb-5">اختيار بسيط… لكن تأثيره كبير في الاقتراح.</div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { id: "friend", label: "صديق/صديقة", icon: <User className="w-4 h-4" /> },
                          { id: "father", label: "الأب", icon: <ShieldCheck className="w-4 h-4" /> },
                          { id: "mother", label: "الأم", icon: <Heart className="w-4 h-4" /> },
                          { id: "partner", label: "شريك/شريكة", icon: <Sparkles className="w-4 h-4" /> },
                          { id: "boss", label: "مدير/مديرة", icon: <Crown className="w-4 h-4" /> },
                        ].map((p) => {
                          const active = persona === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setPersona(p.id)}
                              className={cx(
                                "rounded-2xl border p-4 text-right transition-all",
                                active
                                  ? "border-violet-400/60 bg-violet-500/12"
                                  : "border-white/10 bg-white/5 hover:bg-white/10",
                                "focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-black">{p.label}</div>
                                <div
                                  className={cx(
                                    "w-9 h-9 rounded-2xl border flex items-center justify-center",
                                    active
                                      ? "bg-violet-500/15 border-violet-400/25 text-violet-200"
                                      : "bg-white/5 border-white/10 text-gray-200"
                                  )}
                                >
                                  {p.icon}
                                </div>
                              </div>
                              <div className="text-[11px] text-gray-500 mt-2">اختيار سريع</div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <PrimaryButton disabled={!canNext0} onClick={() => setStep(1)} className="flex-1">
                          التالي <ArrowRight className="w-5 h-5" />
                        </PrimaryButton>
                        <SecondaryButton onClick={onOpenDemo} className="flex-1">
                          جرّب محاكي الفتح <PlayCircle className="w-5 h-5 text-violet-300" />
                        </SecondaryButton>
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="s1" {...rise} transition={{ duration: 0.28, ease: "easeOut" }}>
                      <div className="text-lg md:text-xl font-black mb-2">نوع المفاجأة</div>
                      <div className="text-sm text-gray-400 mb-5">هذا يحدد هل نحتاج تغليف/تجربة أقوى أم لا.</div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "product", label: "منتج ملموس", icon: <Box className="w-4 h-4" /> },
                          { id: "coupon", label: "كوبون/قسيمة", icon: <CreditCard className="w-4 h-4" /> },
                          { id: "trip", label: "تذكرة/سفر", icon: <Send className="w-4 h-4" /> },
                          { id: "food", label: "طلب طعام", icon: <Gift className="w-4 h-4" /> },
                        ].map((s) => {
                          const active = surprise === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSurprise(s.id)}
                              className={cx(
                                "rounded-2xl border p-4 text-right transition-all",
                                active
                                  ? "border-fuchsia-400/50 bg-fuchsia-500/10"
                                  : "border-white/10 bg-white/5 hover:bg-white/10",
                                "focus:outline-none focus:ring-2 focus:ring-fuchsia-400/35"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-black">{s.label}</div>
                                <div
                                  className={cx(
                                    "w-9 h-9 rounded-2xl border flex items-center justify-center",
                                    active
                                      ? "bg-fuchsia-500/12 border-fuchsia-400/25 text-fuchsia-200"
                                      : "bg-white/5 border-white/10 text-gray-200"
                                  )}
                                >
                                  {s.icon}
                                </div>
                              </div>
                              <div className="text-[11px] text-gray-500 mt-2">Previewable</div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <SecondaryButton onClick={() => setStep(0)} className="flex-1">
                          رجوع <ChevronLeft className="w-5 h-5" />
                        </SecondaryButton>
                        <PrimaryButton disabled={!canNext1} onClick={() => setStep(2)} className="flex-1">
                          التالي <ArrowRight className="w-5 h-5" />
                        </PrimaryButton>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="s2" {...rise} transition={{ duration: 0.28, ease: "easeOut" }}>
                      <div className="text-lg md:text-xl font-black mb-2">نمط الرسالة</div>
                      <div className="text-sm text-gray-400 mb-5">آخر جزء… ثم نعطيك اقتراح مباشر.</div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "classy", label: "فخم", hint: "هادئ/راقي", icon: <Crown className="w-4 h-4" /> },
                          { id: "fun", label: "مرح", hint: "خفيف/لطيف", icon: <Sparkles className="w-4 h-4" /> },
                          { id: "mysterious", label: "غامض", hint: "هيبة/تشويق", icon: <Puzzle className="w-4 h-4" /> },
                        ].map((t) => {
                          const active = tone === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setTone(t.id)}
                              className={cx(
                                "rounded-2xl border p-4 text-right transition-all",
                                active
                                  ? "border-violet-400/60 bg-violet-500/12"
                                  : "border-white/10 bg-white/5 hover:bg-white/10",
                                "focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-black">{t.label}</div>
                                  <div className="text-[11px] text-gray-500 mt-1">{t.hint}</div>
                                </div>
                                <div
                                  className={cx(
                                    "w-9 h-9 rounded-2xl border flex items-center justify-center",
                                    active
                                      ? "bg-violet-500/15 border-violet-400/25 text-violet-200"
                                      : "bg-white/5 border-white/10 text-gray-200"
                                  )}
                                >
                                  {t.icon}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-right">
                            <div className="text-[11px] text-gray-400 uppercase tracking-[0.25em]">RECOMMENDATION</div>
                            <div className="mt-1 text-xl font-black text-white">
                              {recommendation?.tierName ? `اقتراحنا لك: ${recommendation.tierName}` : "اختر نمط الرسالة لإظهار الاقتراح"}
                            </div>
                            <div className="mt-2 text-sm text-gray-300/90">
                              {recommendation?.reason || "—"}
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-3xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-200">
                            <Sparkles className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                          <SecondaryButton onClick={() => setStep(1)} className="flex-1">
                            رجوع <ChevronLeft className="w-5 h-5" />
                          </SecondaryButton>
                          <PrimaryButton
                            disabled={!canNext2}
                            onClick={() => {
                              submitWizard();
                              onStartReal();
                            }}
                            className="flex-1"
                          >
                            اختيار الفئة المقترحة <ArrowRight className="w-5 h-5" />
                          </PrimaryButton>
                        </div>

                        {!canNext2 ? <div className="mt-3 text-xs text-gray-500">اختر نمط الرسالة لإظهار الاقتراح.</div> : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-7 h-full">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-right">
                    <div className="text-[11px] text-gray-400 uppercase tracking-[0.25em]">PREVIEW</div>
                    <div className="font-black text-white">نموذج الكشف النهائي</div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200">
                    <Sparkles className="w-4 h-4 text-violet-200" />
                    {preview.badge}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] text-gray-500 mb-1">لمن؟</div>
                    <div className="font-black text-white">{personaLabel}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] text-gray-500 mb-1">نوع المفاجأة</div>
                    <div className="font-black text-white">{surpriseLabel}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] text-gray-500 mb-1">نمط الرسالة</div>
                    <div className="font-black text-white">{toneLabel}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${persona}-${surprise}-${tone}`}
                      initial={{ opacity: 0, y: 12, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 overflow-hidden"
                    >
                      <div aria-hidden className="absolute inset-0 opacity-70 bg-[radial-gradient(70%_50%_at_30%_0%,rgba(168,85,247,.18),transparent_60%)]" />
                      <div className="relative">
                        <div className="text-xl md:text-2xl font-black text-white leading-snug">{preview.headline}</div>
                        <div className="mt-2 text-gray-200/90 text-sm leading-relaxed">{preview.message}</div>
                        <div className="mt-3 text-[11px] text-gray-400">{preview.hint}</div>

                        <div className="mt-5 rounded-2xl bg-white text-black p-5 shadow-xl transform -rotate-1">
                          <div className="flex items-center justify-between border-b border-black/15 pb-3 mb-3">
                            <span className="text-[10px] font-black text-gray-500">GIFT REWARD</span>
                            <span className="text-[10px] font-bold text-violet-700">ATHEER</span>
                          </div>
                          <div className="text-base font-black">{preview.reward}</div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500">CODE</span>
                            <span className="font-mono text-sm">{preview.code}</span>
                          </div>
                        </div>

                        <div className="mt-4 text-[11px] text-gray-500">
                          هذا مجرد Preview. الطلب الحقيقي يبدأ باختيار الفئة ثم البصمة ثم الدفع.
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SecondaryButton onClick={onOpenDemo} className="w-full">
                    افتح محاكي الفتح <PlayCircle className="w-5 h-5 text-violet-300" />
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => {
                      if (canNext2) submitWizard();
                      onStartReal();
                    }}
                    className="w-full"
                  >
                    ابدأ الآن <ArrowRight className="w-5 h-5" />
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-gray-500">
            هذا هو الـCommercial Upgrade: اقتراح واحد قوي يقلل التردد ويرفع التحويل.
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const App = () => {
  // --- States Management (MUST NOT RENAME) ---
  const [view, setView] = useState("landing"); // landing, tiers, survey, checkout, success
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState("lock"); // lock, revealed
  const [demoCode, setDemoCode] = useState("");
  const [selectedTier, setSelectedTier] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(0);

  // Survey Data (MUST NOT RENAME)
  const [surveyData, setSurveyData] = useState({
    time: "",
    vibe: "",
    interest: "",
    note: "",
  });

  // --- NEW (Allowed): commercial funnel states ---
  const [wizardData, setWizardData] = useState({ persona: "", surprise: "", tone: "" });
  const [recommendedTierId, setRecommendedTierId] = useState("silver");
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [orderId, setOrderId] = useState("");
  // Checkout form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoyasarForm, setShowMoyasarForm] = useState(false);
  // Ref holds the latest payment handler so Moyasar's closure never goes stale
  const moyasarCallbackRef = useRef(null);
  // AI gift message
  const [aiGiftMessage, setAiGiftMessage] = useState("");
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  // Performance: detect if user prefers reduced motion or is on a data saver connection.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    // Detect connection saveData / effectiveType for slow connections
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      setSaveData(Boolean(connection.saveData) || connection.effectiveType === "2g");
    }
    return () => {
      mq.removeEventListener("change", handler);
    };
  }, []);
  // Derived flag: if true, lighten animations and heavy effects
  const lowMotion = prefersReducedMotion || saveData;

  const templates = useMemo(() => TEMPLATES, []);
  const tiers = useMemo(() => TIERS, []);

  const recommendation = useMemo(() => {
    const rec = getTierRecommendation(wizardData);
    const tierName = tiers.find((t) => t.id === rec.tierId)?.name || "الفئة الفضية";
    return { ...rec, tierName };
  }, [wizardData, tiers]);

  useEffect(() => {
    if (activeTemplate < 0) setActiveTemplate(0);
    if (activeTemplate > templates.length - 1) setActiveTemplate(templates.length - 1);
  }, [activeTemplate, templates.length]);

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [view]);

  const isStandalone = useMemo(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true,
    []
  );

  const isIOS = useMemo(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    []
  );

  // Refs track whether install conditions are met (avoids stale closures in listeners)
  const installReadyRef = useRef(false);
  const scrollReadyRef = useRef(false);

  useEffect(() => {
    if (isStandalone) return;
    let dismissed = false;
    try {
      if (sessionStorage.getItem("atheer_install_dismissed")) dismissed = true;
    } catch {}
    if (dismissed) return;

    const tryShow = () => {
      if (installReadyRef.current && scrollReadyRef.current) {
        setShowInstallBanner(true);
      }
    };

    // Scroll threshold: show only after user has scrolled down meaningfully
    const onScroll = () => {
      if (window.scrollY >= 200) {
        scrollReadyRef.current = true;
        tryShow();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Non-iOS: capture beforeinstallprompt; also set a 20s fallback timer
    const handler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      installReadyRef.current = true;
      tryShow();
    };
    window.addEventListener("beforeinstallprompt", handler);

    // 20s timer for non-iOS (in case prompt fired but scroll hasn't happened yet)
    const nonIosTimer = !isIOS
      ? setTimeout(() => {
          installReadyRef.current = true;
          tryShow();
        }, 20000)
      : null;

    // iOS: show after 30s + scroll (no prompt event on iOS)
    const iosTimer = isIOS
      ? setTimeout(() => {
          installReadyRef.current = true;
          tryShow();
        }, 30000)
      : null;

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("scroll", onScroll);
      if (nonIosTimer) clearTimeout(nonIosTimer);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [isStandalone, isIOS]);

  const handleDemoUnlock = useCallback(() => {
    if (demoCode === "2024") {
      setDemoStep("revealed");
      setDemoError("");
    } else {
      setDemoError("الرمز غير صحيح — الرمز التجريبي هو 2024");
    }
  }, [demoCode]);

  const resetDemo = useCallback(() => {
    setShowDemo(false);
    setDemoStep("lock");
    setDemoCode("");
    setDemoError("");
  }, []);

  const goToSuccess = useCallback(() => {
    setOrderId(`ATH-${Math.floor(10000 + Math.random() * 90000)}`);
    setView("success");
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredInstallPrompt) return;
    await deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    if (outcome === "accepted") setShowInstallBanner(false);
  }, [deferredInstallPrompt]);

  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
    try {
      sessionStorage.setItem("atheer_install_dismissed", "1");
    } catch {}
  }, []);

  const handleGenerateMessage = useCallback(async () => {
    setIsGeneratingMessage(true);
    setCheckoutError("");
    try {
      const prompt = `أنت كاتب رسائل إهداء إبداعي لمنصة أثير للهدايا في السعودية. اكتب رسالة إهداء قصيرة (جملتان أو ثلاث فقط) باللغة العربية، شخصية وعاطفية، بناءً على:
- الفئة: ${selectedTier?.name}
- التوقيت المفضل للمهدى إليه: ${surveyData.time}
- اهتماماته: ${surveyData.interest}
الرسالة يجب أن تكون دافئة وتناسب الثقافة السعودية. أعطني الرسالة فقط بدون مقدمات أو شرح.`;
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: prompt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      setAiGiftMessage(text.trim());
    } catch {
      setCheckoutError("تعذّر توليد الرسالة. تحقق من الاتصال وأعد المحاولة.");
    } finally {
      setIsGeneratingMessage(false);
    }
  }, [selectedTier, surveyData]);

  const handleSubmitOrder = useCallback(async () => {
    if (!customerName.trim()) {
      setCheckoutError("يرجى إدخال اسم المستلم الكامل.");
      return;
    }
    if (!customerPhone.trim()) {
      setCheckoutError("يرجى إدخال رقم الجوال.");
      return;
    }
    setCheckoutError("");
    setIsSubmitting(true);
    try {
      const newOrderId = `ATH-${Math.floor(10000 + Math.random() * 90000)}`;
      await addDoc(collection(db, "orders"), {
        orderId: newOrderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        tier: {
          id: selectedTier?.id,
          name: selectedTier?.name,
          price: selectedTier?.price,
        },
        surveyData,
        wizardData,
        recommendedTierId,
        aiGiftMessage: aiGiftMessage || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setOrderId(newOrderId);
      setView("success");
    } catch {
      setCheckoutError("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }, [customerName, customerPhone, selectedTier, surveyData, wizardData, recommendedTierId, aiGiftMessage]);

  // Reset Moyasar form when leaving checkout view
  useEffect(() => {
    if (view !== "checkout") {
      setShowMoyasarForm(false);
      const el = document.getElementById("moyasar-payment-form");
      if (el) el.innerHTML = "";
    }
  }, [view]);

  // Load Moyasar CDN + init form when showMoyasarForm becomes true
  useEffect(() => {
    if (!showMoyasarForm) return;

    const MOYASAR_VERSION = "1.14.0";
    const init = () => {
      const el = document.getElementById("moyasar-payment-form");
      if (!el || !window.Moyasar) return;
      el.innerHTML = "";
      window.Moyasar.init({
        element: el,
        amount: checkoutPrices.total * 100, // halalas
        currency: "SAR",
        description: `أثير — ${selectedTier?.name ?? "هدية"}`,
        publishable_api_key: "pk_test_vcFUhjZQxIlSRNO891M31n33jJg",
        callback_url: window.location.origin + "/",
        methods: ["creditcard"],
        on_completed: (payment) => moyasarCallbackRef.current(payment),
      });
    };

    if (!document.getElementById("moyasar-css")) {
      const link = document.createElement("link");
      link.id = "moyasar-css";
      link.rel = "stylesheet";
      link.href = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.css`;
      document.head.appendChild(link);
    }

    if (window.Moyasar) {
      init();
    } else if (!document.getElementById("moyasar-js")) {
      const script = document.createElement("script");
      script.id = "moyasar-js";
      script.src = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.js`;
      script.onload = init;
      document.head.appendChild(script);
    }
  }, [showMoyasarForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWizardComplete = useCallback(
    (payload) => {
      setWizardData(payload);
      const rec = getTierRecommendation(payload);
      setRecommendedTierId(rec.tierId);
      // Optional: light “analytics” without libs
      try {
        localStorage.setItem("atheer_wizard", JSON.stringify({ ...payload, rec: rec.tierId, ts: Date.now() }));
      } catch {
        // ignore
      }
    },
    []
  );

  const sortedTiers = useMemo(() => {
    // Surface recommended tier first (UI-only ordering, no flow change)
    const recId = recommendedTierId;
    const copy = [...tiers];
    const idx = copy.findIndex((t) => t.id === recId);
    if (idx <= 0) return copy;
    const [t] = copy.splice(idx, 1);
    return [t, ...copy];
  }, [tiers, recommendedTierId]);

  const checkoutPrices = useMemo(() => {
    const price = parseInt(selectedTier?.price) || 0;
    const vat = Math.round(price * 0.15);
    return { price, vat, total: price + vat };
  }, [selectedTier]);

  // Always-fresh handler — captured by Moyasar's on_completed via ref
  moyasarCallbackRef.current = async (payment) => {
    if (payment.status !== "paid") {
      setCheckoutError("فشل الدفع. تحقق من بيانات البطاقة وأعد المحاولة.");
      setShowMoyasarForm(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const newOrderId = `ATH-${Math.floor(10000 + Math.random() * 90000)}`;
      await addDoc(collection(db, "orders"), {
        orderId: newOrderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        tier: { id: selectedTier?.id, name: selectedTier?.name, price: selectedTier?.price },
        surveyData,
        wizardData,
        recommendedTierId,
        aiGiftMessage: aiGiftMessage || null,
        moyasarPaymentId: payment.id,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setOrderId(newOrderId);
      setView("success");
    } catch {
      setCheckoutError("تم الدفع بنجاح لكن حدث خطأ تقني. تواصل معنا برقم الدفع: " + payment.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = useCallback(() => {
    if (!customerName.trim()) {
      setCheckoutError("يرجى إدخال اسم المستلم الكامل.");
      return;
    }
    if (!customerPhone.trim()) {
      setCheckoutError("يرجى إدخال رقم الجوال.");
      return;
    }
    setCheckoutError("");
    setShowMoyasarForm(true);
  }, [customerName, customerPhone]);

  const DemoModal = () => (
    <motion.div {...fade} className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        <GlassCard className="overflow-hidden">
          <div className="relative p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center">
                <Puzzle className="w-5 h-5 text-violet-300" />
              </div>
              <div className="text-right">
                <div className="font-black text-white">محاكي تجربة المهدى إليه</div>
                <div className="text-xs text-gray-400">Demo • QR Gift Reveal</div>
              </div>
            </div>

            <button
              onClick={resetDemo}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {demoStep === "lock" ? (
                <motion.div key="lock" {...rise} transition={{ duration: 0.35 }} className="text-center">
                  <div className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-600/25 to-fuchsia-600/20 border border-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-violet-200" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2">افتح الهدية… بطريقة أثير</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    أدخل الرمز <span className="text-violet-300 font-bold">2024</span> لتجربة لحظة فتح الهدية الرقمية.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={demoCode}
                      onChange={(e) => { setDemoCode(e.target.value); setDemoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleDemoUnlock()}
                      className={cx(
                        "w-full bg-white/5 rounded-2xl py-4 text-center text-2xl text-white outline-none transition-colors",
                        demoError
                          ? "border border-red-400/60 focus:border-red-400"
                          : "border border-white/10 focus:border-violet-400/70"
                      )}
                      placeholder="0000"
                    />

                    {demoError && (
                      <div className="text-red-400 text-xs text-center font-medium py-1">
                        {demoError}
                      </div>
                    )}

                    <PrimaryButton onClick={handleDemoUnlock} className="w-full">
                      فك التشفير <ArrowRight className="w-5 h-5" />
                    </PrimaryButton>

                    <button
                      onClick={() => { setDemoCode("2024"); setDemoError(""); }}
                      className="w-full rounded-2xl py-3 font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-gray-200"
                    >
                      تعبئة الرمز تلقائياً
                    </button>

                    <div className="text-[11px] text-gray-500">تلميح: هذا مجرد محاكي—في النسخة الحية الرمز يكون فريد لكل طلب.</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="revealed" {...rise} transition={{ duration: 0.35 }} className="text-center">
                  <div className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2">تم فتح الهدية 🎁</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    هذا مثال على الكشف النهائي. في أثير، التجربة تأتي قبل الهدية… والهدية تأتي بعد «الانبهار».
                  </p>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-right mb-6">
                    <div className="text-[11px] text-gray-500 uppercase tracking-widest mb-1">ATHEER REVEAL</div>
                    <div className="text-xl font-black">قسيمة مفاجأة</div>
                    <div className="text-sm text-gray-300 mt-2 leading-relaxed">
                      خصم <span className="text-violet-200 font-black">30%</span> — صالح لمدة 30 يوم
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">CODE</span>
                      <span className="font-mono text-sm text-white">ATH-2024-DEMO</span>
                    </div>
                  </div>

                  <SecondaryButton onClick={resetDemo} className="w-full">
                    إغلاق المحاكي
                  </SecondaryButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );

  const InstallBanner = () => (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 180 }}
      className="fixed bottom-4 left-4 right-4 z-[200] max-w-lg mx-auto"
    >
      <GlassCard className="overflow-hidden">
        <div className="relative p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-right min-w-0">
            <div className="font-black text-white text-sm">ثبّت أثير كتطبيق</div>
            {isIOS ? (
              <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                اضغط <span className="text-violet-300 font-bold">مشاركة ↑</span> ثم «أضف إلى الشاشة الرئيسية»
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-0.5">وصول أسرع وفتح مباشر من الشاشة الرئيسية</div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isIOS && deferredInstallPrompt && (
              <button
                onClick={handleInstall}
                className="rounded-xl px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-black shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
              >
                تثبيت
              </button>
            )}
            <button
              onClick={dismissInstallBanner}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#07070a] text-right text-white selection:bg-violet-500/30 font-sans" dir="rtl">
      <Navbar view={view} setView={setView} setShowDemo={setShowDemo} />
      <div className="relative bg-[#07070a]">
        <Background />

        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div key="landing" {...fade} transition={{ duration: 0.35 }}>
              <PageShell max="max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-7">
                    <GlassCard className="overflow-hidden">
                      <div className="relative h-full">
                        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_10%,rgba(168,85,247,.17),transparent_55%)]" />
                        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_90%_20%,rgba(99,102,241,.14),transparent_55%)]" />
                        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_80%_at_60%_120%,rgba(236,72,153,.10),transparent_55%)]" />
                        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/[0.02] to-black/40" />

                        <div className="relative p-8 md:p-10">
                          {/* Eyebrow label */}
                          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                            <span className="text-[10px] uppercase tracking-[0.22em] text-violet-300 font-bold">ATHEER · تجربة الهدية</span>
                          </div>

                          <h1 className="text-4xl md:text-5xl font-black leading-[1.1]">
                            الهدية التي تُشعَر بها —{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300">
                              قبل أن تُفتَح
                            </span>
                          </h1>

                          <p className="mt-4 text-gray-300/80 text-sm md:text-base leading-relaxed max-w-2xl">
                            يمسح المستلم QR… ويدخل رحلة تفاعلية قصيرة من الأسئلة والألغاز… ثم تأتي لحظة الكشف.
                          </p>

                          <p className="mt-3 text-gray-300/60 text-sm italic">
                            "يمسح QR… تبدأ الرحلة… ثم تأتي لحظة الكشف."
                          </p>

                          <div className="mt-7 space-y-4">
                            <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-4 md:p-5">
                              <div className="text-[11px] text-gray-400 mb-3">ابدأ التجربة</div>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <PrimaryButton
                                  onClick={() => {
                                    setView("tiers");
                                  }}
                                  className="flex-1"
                                >
                                  اختيار الفئة <ArrowRight className="w-5 h-5" />
                                </PrimaryButton>
                                <SecondaryButton onClick={() => setShowDemo(true)} className="flex-1">
                                  تجربة العرض الحي <PlayCircle className="w-5 h-5 text-violet-300" />
                                </SecondaryButton>
                              </div>
                            </div>

                            {/* Trust / value strip */}
                            <div className="flex flex-wrap gap-2">
                              {[
                                { icon: <Gift className="w-3.5 h-3.5" />, label: "هدية + تجربة" },
                                { icon: <Sparkles className="w-3.5 h-3.5" />, label: "QR مخصص" },
                                { icon: <Smartphone className="w-3.5 h-3.5" />, label: "مناسبة للجوال" },
                              ].map((v) => (
                                <span
                                  key={v.label}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
                                >
                                  <span className="text-violet-300">{v.icon}</span>
                                  {v.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-5">
                    <GlassCard className="overflow-hidden h-full">
                      <div className="relative h-full min-h-[420px]">
                        <img
                          src={templates[activeTemplate]?.image}
                          alt=""
                          decoding="async"
                          fetchPriority="high"
                          className="absolute inset-0 w-full h-full object-cover opacity-35"
                        />
                        <div className={cx("absolute inset-0 bg-gradient-to-br", templates[activeTemplate]?.color)} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/35 to-transparent" />

                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                              <Star className="w-4 h-4 text-amber-300" />
                              ثيمات التجربة
                            </span>

                            <div className="flex items-center gap-2">
                              {templates.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  aria-label={`Template ${i + 1}`}
                                  onClick={() => setActiveTemplate(i)}
                                  className={cx(
                                    "h-2.5 rounded-full transition-all",
                                    activeTemplate === i ? "bg-white w-10" : "bg-white/30 hover:bg-white/50 w-2.5"
                                  )}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-3xl md:text-4xl font-black">{templates[activeTemplate]?.title}</div>
                            <div className="mt-2 text-gray-200/85 text-sm md:text-base">{templates[activeTemplate]?.desc}</div>

                            <div className="mt-6 grid grid-cols-3 gap-3">
                              {[
                                { icon: <MousePointer2 className="w-4 h-4" />, label: "فتح" },
                                { icon: <Puzzle className="w-4 h-4" />, label: "تشويق" },
                                { icon: <Gift className="w-4 h-4" />, label: "كشف" },
                              ].map((x) => (
                                <div key={x.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                                  <div className="mx-auto mb-2 w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-200">
                                    {x.icon}
                                  </div>
                                  <div className="text-xs text-gray-200 font-bold">{x.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => setView("tiers")}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 bg-white text-black font-black hover:bg-gray-100 transition-colors"
                          >
                            اختر الفئة الآن <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>

                <TryGiftFlowWizard
                  onStartReal={() => setView("tiers")}
                  onOpenDemo={() => setShowDemo(true)}
                  onCompleteWizard={handleWizardComplete}
                  recommendation={recommendation}
                />

                <ReviewsSection />

                <div className="mt-20">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                      <span className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300 font-bold">كيف تبدأ التجربة</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-black">من اختيار الفكرة… إلى لحظة الكشف</div>
                    <div className="mt-2 text-sm text-gray-400 max-w-md mx-auto">رحلة بسيطة، لكن كل خطوة فيها مقصودة.</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        num: "01",
                        icon: <Gift className="w-5 h-5" />,
                        glow: "rgba(168,85,247,.18)",
                        title: "نحدد الشخص والمناسبة",
                        desc: "سواء كان صديقاً أو والداً أو شريكاً — بصمة كل هدية تختلف.",
                      },
                      {
                        num: "02",
                        icon: <Palette className="w-5 h-5" />,
                        glow: "rgba(236,72,153,.16)",
                        title: "نبني بصمة الهدية",
                        desc: "أسئلة ذكية تشكّل تجربة كشف مخصصة من الألوان والألغاز.",
                      },
                      {
                        num: "03",
                        icon: <Sparkles className="w-5 h-5" />,
                        glow: "rgba(99,102,241,.18)",
                        title: "QR يصل… ولحظة الكشف تبدأ",
                        desc: "يمسح المستلم الـQR ويدخل رحلة تفاعلية — ثم تُكشَف الهدية.",
                      },
                    ].map((x) => (
                      <GlassCard key={x.num} className="p-6 overflow-hidden">
                        <div
                          aria-hidden
                          className="absolute inset-0 opacity-70"
                          style={{ background: `radial-gradient(80% 60% at 50% 0%, ${x.glow}, transparent 65%)` }}
                        />
                        <div className="relative">
                          <div className="flex items-start justify-between mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-200">
                              {x.icon}
                            </div>
                            <span className="font-mono text-2xl font-black text-white/15">{x.num}</span>
                          </div>
                          <div className="font-black text-base">{x.title}</div>
                          <div className="text-sm text-gray-400 mt-2 leading-relaxed">{x.desc}</div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </PageShell>
            </motion.div>
          )}

          {view === "tiers" && (
            <motion.div key="tiers" {...slideIn} transition={{ duration: 0.35 }}>
              <PageShell max="max-w-6xl">
                <button onClick={() => setView("landing")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
                  <ChevronLeft className="w-5 h-5" /> العودة
                </button>

                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200">
                    <Crown className="w-4 h-4 text-amber-300" />
                    اختر الفئة المناسبة ثم ننتقل للبصمة الذكية
                  </div>
                  <h2 className="mt-5 text-3xl md:text-4xl font-black">الفئات</h2>
                  <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
                    اقتراحنا يظهر هنا لتسريع القرار (Conversion-first).
                  </p>
                </div>

                {recommendedTierId ? (
                  <div className="mb-6">
                    <GlassCard className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="text-right">
                          <div className="text-[11px] text-gray-400 uppercase tracking-[0.25em]">YOUR RECOMMENDATION</div>
                          <div className="text-xl font-black">اقتراحنا لك: {recommendation.tierName}</div>
                          <div className="text-sm text-gray-300/90 mt-1">{recommendation.reason}</div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                          <SecondaryButton
                            onClick={() => {
                              // Scroll to recommended tier area (soft)
                              const el = document.getElementById(`tier-${recommendedTierId}`);
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className="flex-1 md:flex-none"
                          >
                            عرض الاقتراح
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => {
                              const t = tiers.find((x) => x.id === recommendedTierId);
                              if (t) {
                                setSelectedTier(t);
                                setView("survey");
                              }
                            }}
                            className="flex-1 md:flex-none"
                          >
                            اختيار الاقتراح <ArrowRight className="w-5 h-5" />
                          </PrimaryButton>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sortedTiers.map((t) => {
                    const isRec = t.id === recommendedTierId;
                    return (
                      <TiltCard key={t.id}>
                        <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="h-full" id={`tier-${t.id}`}
                        >
                          <GlassCard
                            className={cx(
                              "h-full p-8 flex flex-col overflow-hidden",
                              t.popular ? "ring-1 ring-violet-400/40" : "",
                              isRec ? "ring-2 ring-emerald-400/35" : ""
                            )}
                          >
                            <div
                              className={cx(
                                "absolute -top-24 -left-24 h-52 w-52 rounded-full blur-3xl",
                                t.id === "bronze"
                                  ? "bg-amber-500/20"
                                  : t.id === "silver"
                                  ? "bg-violet-500/22"
                                  : "bg-fuchsia-500/20"
                              )}
                            />

                            <div className="relative" style={{ transform: "translateZ(22px)" }}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cx(
                                      "w-12 h-12 rounded-2xl border flex items-center justify-center",
                                      isRec
                                        ? "bg-emerald-500/12 border-emerald-400/25 text-emerald-200"
                                        : t.popular
                                        ? "bg-violet-500/15 border-violet-400/25 text-violet-200"
                                        : "bg-white/5 border-white/10 text-gray-200"
                                    )}
                                  >
                                    {t.icon}
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-black">{t.name}</h3>
                                    <div className="text-xs text-gray-400 mt-1">Premium packaging + تجربة</div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  {isRec && (
                                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-3 py-1 text-[11px] font-black text-emerald-200">
                                      اقتراحنا لك <Sparkles className="w-4 h-4" />
                                    </div>
                                  )}
                                  {t.popular && (
                                    <div className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-400/25 px-3 py-1 text-[11px] font-black text-violet-200">
                                      الأكثر طلباً <Star className="w-4 h-4 text-amber-300" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-7 flex items-end justify-between">
                                <div>
                                  <div className="text-4xl font-black leading-none">{t.price}</div>
                                  <div className="text-xs text-gray-500 mt-1">ريال سعودي</div>
                                </div>
                                <div className="text-[11px] text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-300" /> دفع آمن
                                  </div>
                                </div>
                              </div>

                              <div className="mt-7 h-px bg-white/10" />

                              <ul className="mt-6 space-y-3 text-sm text-gray-300/80 flex-grow">
                                {t.features.map((f, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-violet-300 mt-0.5 shrink-0" />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="mt-8">
                                <button
                                  onClick={() => {
                                    setSelectedTier(t);
                                    setView("survey");
                                  }}
                                  className={cx(
                                    "w-full py-4 rounded-2xl font-black transition-all active:scale-[0.99]",
                                    isRec
                                      ? "bg-gradient-to-r from-emerald-500 to-violet-600 text-white hover:opacity-95"
                                      : t.popular
                                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-95"
                                      : "bg-white text-black hover:bg-gray-100"
                                  )}
                                >
                                  اختيار هذه الفئة <ArrowRight className="inline-block w-4 h-4 mr-2" />
                                </button>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      </TiltCard>
                    );
                  })}
                </div>
              </PageShell>
            </motion.div>
          )}

          {view === "survey" && (
            <motion.div key="survey" {...rise} transition={{ duration: 0.35 }}>
              <PageShell max="max-w-3xl">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <button onClick={() => setView("tiers")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" /> العودة
                  </button>

                  <div className="hidden sm:flex items-center gap-2">
                    <StepPill active label="بصمة الشخصية" />
                    <StepPill label="الدفع" />
                  </div>
                </div>

                <GlassCard className="p-8 md:p-10 overflow-hidden">
                  <div className="absolute -top-24 -right-28 h-64 w-64 rounded-full bg-violet-500/18 blur-3xl" />
                  <div className="absolute -bottom-24 -left-28 h-64 w-64 rounded-full bg-fuchsia-500/14 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-violet-200" />
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl md:text-3xl font-black">بناء بصمة الشخصية</h2>
                        <p className="text-xs text-gray-400 mt-1">مرحلة تحليل الذكاء الاصطناعي — دقائق قليلة تُغيّر التجربة</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div>
                        <label className="block mb-4 text-sm font-black text-gray-300 uppercase tracking-widest">
                          1. ما هو التوقيت المفضل للمهدى إليه؟
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { t: "فجر هادئ", icon: <Star className="w-4 h-4" /> },
                            { t: "غروب شاش", icon: <Sparkles className="w-4 h-4" /> },
                            { t: "ظهيرة حيوية", icon: <Zap className="w-4 h-4" /> },
                            { t: "ليلة غامضة", icon: <Heart className="w-4 h-4" /> },
                          ].map((o) => {
                            const active = surveyData.time === o.t;
                            return (
                              <button
                                key={o.t}
                                type="button"
                                onClick={() => setSurveyData({ ...surveyData, time: o.t })}
                                className={cx(
                                  "text-right rounded-2xl border p-4 transition-all",
                                  "focus:outline-none focus:ring-2 focus:ring-violet-400/50",
                                  active ? "border-violet-400/60 bg-violet-500/12" : "border-white/10 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-black text-white">{o.t}</div>
                                  <div
                                    className={cx(
                                      "w-9 h-9 rounded-2xl border flex items-center justify-center",
                                      active
                                        ? "bg-violet-500/15 border-violet-400/25 text-violet-200"
                                        : "bg-white/5 border-white/10 text-gray-200"
                                    )}
                                  >
                                    {o.icon}
                                  </div>
                                </div>
                                <div className="text-[11px] text-gray-400 mt-2">
                                  {o.t === "فجر هادئ"
                                    ? "هادئ/مخملي"
                                    : o.t === "غروب شاش"
                                    ? "ستايل/تصوير"
                                    : o.t === "ظهيرة حيوية"
                                    ? "حماس/نشاط"
                                    : "غموض/هيبة"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-4 text-sm font-black text-gray-300 uppercase tracking-widest">2. اكتب نبذة عن اهتماماته</label>

                        <textarea
                          value={surveyData.interest}
                          onChange={(e) => setSurveyData({ ...surveyData, interest: e.target.value })}
                          placeholder="مثلاً: يحب القهوة، السفر، التكنولوجيا، كرة القدم…"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-violet-400/70 min-h-[140px] leading-relaxed"
                        />

                        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                          <span>كلما كانت التفاصيل أذكى… كانت التجربة أقوى.</span>
                          <span className="font-mono">{surveyData.interest?.length || 0}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <PrimaryButton onClick={() => setView("checkout")} disabled={!surveyData.time || !surveyData.interest} className="w-full">
                          تحليل البيانات والمتابعة للدفع <ArrowRight className="w-5 h-5" />
                        </PrimaryButton>

                        {!surveyData.time || !surveyData.interest ? (
                          <div className="mt-3 text-xs text-gray-500">مطلوب: اختيار التوقيت + كتابة نبذة الاهتمامات.</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </PageShell>
            </motion.div>
          )}

          {view === "checkout" && (
            <motion.div key="checkout" {...fade} transition={{ duration: 0.35 }}>
              <PageShell max="max-w-6xl">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <button onClick={() => setView("survey")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" /> العودة
                  </button>

                  <div className="hidden sm:flex items-center gap-2">
                    <StepPill label="بصمة الشخصية" />
                    <StepPill active label="الدفع" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-6">
                    <GlassCard className="p-7 md:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-200">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black">معلومات الشحن والدفع</h3>
                          <p className="text-xs text-gray-400 mt-1">الدفع الآمن عبر Moyasar — مدى / فيزا / ماستركارد</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <input
                          placeholder="اسم المستلم الكامل"
                          value={customerName}
                          onChange={(e) => { setCustomerName(e.target.value); setCheckoutError(""); }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-400/60 text-white"
                        />
                        <input
                          placeholder="رقم الجوال (05xxxxxxxx)"
                          value={customerPhone}
                          onChange={(e) => { setCustomerPhone(e.target.value); setCheckoutError(""); }}
                          inputMode="tel"
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-violet-400/60 text-white"
                        />

                        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-400/15 text-emerald-200 text-xs flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          جميع المدفوعات مشفرة وآمنة — مدعوم من Moyasar
                        </div>

                        {/* AI gift message generator */}
                        <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="text-sm font-bold text-white">رسالة إهداء بالذكاء الاصطناعي</div>
                            <button
                              onClick={handleGenerateMessage}
                              disabled={isGeneratingMessage || !surveyData.interest}
                              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                            >
                              {isGeneratingMessage
                                ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Sparkles className="w-3 h-3" />}
                              {isGeneratingMessage ? "جاري التوليد…" : "توليد الرسالة"}
                            </button>
                          </div>
                          {aiGiftMessage ? (
                            <div className="text-sm text-gray-200 leading-relaxed bg-black/20 rounded-xl p-3 border border-white/5">
                              {aiGiftMessage}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">
                              {!surveyData.interest
                                ? "أكمل بصمة الشخصية أولاً لتفعيل هذه الخاصية."
                                : "اضغط «توليد الرسالة» للحصول على رسالة إهداء مخصصة."}
                            </p>
                          )}
                        </div>

                        {checkoutError && (
                          <div className="text-red-400 text-sm text-center font-medium">{checkoutError}</div>
                        )}

                        {!showMoyasarForm ? (
                          <SecondaryButton onClick={handleProceedToPayment} className="w-full">
                            المتابعة للدفع <ArrowRight className="w-5 h-5" />
                          </SecondaryButton>
                        ) : (
                          <div className="rounded-2xl border border-violet-500/25 bg-white p-4">
                            <div id="moyasar-payment-form" />
                            {isSubmitting && (
                              <div className="flex items-center justify-center gap-2 mt-3 text-gray-600 text-sm">
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-violet-600 rounded-full animate-spin" />
                                جاري حفظ طلبك…
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    <GlassCard className="p-7 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-200">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black">ملخص البصمة</div>
                          <div className="text-xs text-gray-400 mt-1">هذه البيانات ستستخدم لتخصيص التجربة</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-[11px] text-gray-500 mb-1">التوقيت</div>
                          <div className="font-black text-white">{surveyData.time || "-"}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-[11px] text-gray-500 mb-1">الفئة</div>
                          <div className="font-black text-white">{selectedTier?.name || "-"}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                          <div className="text-[11px] text-gray-500 mb-1">الاهتمامات</div>
                          <div className="text-gray-200 leading-relaxed">{surveyData.interest || "-"}</div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="sticky top-28">
                      <GlassCard className="p-7 md:p-8 overflow-hidden">
                        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-violet-500/18 blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-fuchsia-500/14 blur-3xl" />

                        <div className="relative">
                          <div className="flex items-center justify-between mb-6">
                            <div className="font-black">ملخص الطلب</div>
                            <div className="text-[11px] text-gray-400">Atheer Checkout</div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4 space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-300">
                              <span>{selectedTier?.name}</span>
                              <span className="text-white font-black">{checkoutPrices.price} ريال</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>ضريبة القيمة المضافة (15٪)</span>
                              <span>{checkoutPrices.vat} ريال</span>
                            </div>
                            <div className="border-t border-white/10 pt-2 text-[11px] text-gray-500">تشمل تجربة QR + تخصيص البصمة + التغليف حسب الفئة</div>
                          </div>

                          <div className="flex items-center justify-between font-black text-lg mb-6">
                            <span>الإجمالي شاملاً الضريبة</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300">
                              {checkoutPrices.total} ريال
                            </span>
                          </div>

                          {!showMoyasarForm ? (
                            <PrimaryButton onClick={handleProceedToPayment} className="w-full">
                              ادفع الآن <ArrowRight className="w-5 h-5" />
                            </PrimaryButton>
                          ) : (
                            <div className="py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm text-center">
                              أكمل بيانات البطاقة في النموذج
                            </div>
                          )}

                          <div className="mt-4 text-[11px] text-gray-500 leading-relaxed">
                            بالدفع أنت توافق على شروط الخدمة. سيتم تأكيد طلبك فور اكتمال الدفع.
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </div>
              </PageShell>
            </motion.div>
          )}

          {view === "success" && (
            <motion.div key="success" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35 }}>
              <div className="min-h-[calc(100vh-120px)] pt-28 pb-20 px-6 flex items-center justify-center">
                <GlassCard className="p-10 md:p-12 max-w-lg w-full text-center overflow-hidden">
                  <motion.div
                    aria-hidden="true"
                    className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
                    animate={{ y: [0, 14, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative">
                    <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-200 shadow-2xl shadow-emerald-500/10">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">تم استلام طلبك!</h2>
                    <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                      يقوم فريق أثير ومحرك الذكاء الاصطناعي الآن بتجهيز صندوقك الفريد. ستصلك رسالة تأكيد قريباً.
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-8">
                      <span className="text-[10px] text-gray-500 uppercase block mb-1">رقم الطلب</span>
                      <span className="text-2xl font-mono font-black text-violet-300">#{orderId}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8 text-right">
                      {[
                        { icon: <Smartphone className="w-4 h-4" />, label: "QR جاهز", desc: "سيتم توليده بعد التجهيز" },
                        { icon: <ShieldCheck className="w-4 h-4" />, label: "تأكيد آمن", desc: "الدفع محمي" },
                      ].map((i) => (
                        <div key={i.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 font-black text-sm text-white">
                            <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-200">
                              {i.icon}
                            </span>
                            {i.label}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-2">{i.desc}</div>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => setView("landing")} className="inline-flex items-center justify-center gap-2 text-violet-300 font-black hover:underline">
                      العودة للرئيسية <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{showDemo && <DemoModal />}</AnimatePresence>
        <AnimatePresence>{showInstallBanner && !isStandalone && <InstallBanner />}</AnimatePresence>

        <footer className="relative p-10 text-center text-gray-600 text-[10px] border-t border-white/5 uppercase tracking-[0.2em]">
          Designed and Built by Atheer Platform &copy; 2024
        </footer>
      </div>
    </div>
  );
};

export default App;


/*
Quick QA Checklist
	•	✅ Linear Flow unchanged.
	•	✅ Existing state names untouched.
	•	✅ No new libraries.
	•	✅ One file only.
	•	✅ RTL intact.

Next Commercial Step (if you want v2)
	•	Add “risk reversal” microcopy: (شحن خلال X أيام + استرجاع + دعم واتساب)
	•	Add limited scarcity (عدد صناديق/اليوم) — UI only.
	•	Add pricing anchor (“الأكثر طلباً” + مقارنة سريعة) داخل Tiers.
*/

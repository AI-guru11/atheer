import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Lock, Star, Heart, Sparkles, ChevronRight } from "lucide-react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// ─── Firebase ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const fbApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][
          i % 5
        ],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 1.5,
        duration: 2 + Math.random() * 2,
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-10%",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{ y: "120vh", rotate: 720, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent"
      />
      <p className="text-violet-300 text-sm">جاري تحميل هديتك…</p>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────
function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <Gift className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-white text-xl font-bold">لم يتم العثور على الهدية</h2>
      <p className="text-gray-400 text-sm max-w-xs">{message}</p>
    </div>
  );
}

// ─── DateLocked ───────────────────────────────────────────────────────────────
function DateLockedScreen({ unlockDate }) {
  const formatted = useMemo(
    () =>
      new Date(unlockDate).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [unlockDate]
  );
  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center"
      >
        <Lock className="w-10 h-10 text-violet-400" />
      </motion.div>
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">
          هديتك في انتظارك
        </h2>
        <p className="text-gray-400 text-sm">يمكنك فتحها في</p>
        <p className="text-violet-300 text-lg font-semibold mt-1">
          {formatted}
        </p>
      </div>
    </div>
  );
}

// ─── LockScreen ───────────────────────────────────────────────────────────────
function LockScreen({ question, onUnlock }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const ok = onUnlock(answer.trim());
      if (!ok) setError("الإجابة غير صحيحة، حاول مرة أخرى");
    },
    [answer, onUnlock]
  );

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-8 px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-fuchsia-400" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">هدية مقفلة</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">{question}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError("");
          }}
          placeholder="اكتب إجابتك هنا"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
          dir="rtl"
          autoFocus
        />
        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          افتح هديتك <ChevronRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// ─── RevealScreen ─────────────────────────────────────────────────────────────
function RevealScreen({ order }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        {/* Stars */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30 flex items-center justify-center"
        >
          <Sparkles className="w-12 h-12 text-fuchsia-400" />
        </motion.div>

        {/* Tier badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="px-4 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold">
            {order.tier?.name ?? "تجربة أثير"}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white text-3xl font-bold leading-snug"
        >
          هديتك بانتظارك ✨
        </motion.h1>

        {/* AI gift message */}
        {order.aiGiftMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-right"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span className="text-fuchsia-300 text-xs font-semibold">
                رسالة مخصصة لك
              </span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {order.aiGiftMessage}
            </p>
          </motion.div>
        )}

        {/* Interests */}
        {order.surveyData?.interest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-2 justify-center max-w-xs"
          >
            {order.surveyData.interest.split(",").map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs"
              >
                {tag.trim()}
              </span>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-gray-600 text-xs"
        >
          بُنيت بالحب عبر منصة أثير
        </motion.p>

        {/* Stars decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="fixed top-10 left-6 opacity-20"
        >
          <Star className="w-6 h-6 text-violet-400 fill-violet-400" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="fixed bottom-20 right-6 opacity-20"
        >
          <Star className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
        </motion.div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GiftExperience() {
  const { orderId } = useParams();
  const [status, setStatus] = useState("loading"); // loading | error | date_locked | locked | revealed
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch order from Firestore
  useEffect(() => {
    if (!orderId) {
      setErrorMsg("رقم الطلب غير موجود في الرابط.");
      setStatus("error");
      return;
    }

    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    getDocs(q)
      .then((snap) => {
        if (snap.empty) {
          setErrorMsg("لم يتم العثور على هذه الهدية. تأكد من صحة الرابط.");
          setStatus("error");
          return;
        }
        const data = snap.docs[0].data();
        setOrder(data);

        // Determine initial screen
        if (data.unlockDate) {
          const unlock = new Date(data.unlockDate);
          if (unlock > new Date()) {
            setStatus("date_locked");
            return;
          }
        }

        if (data.customQuestion && data.customAnswer) {
          setStatus("locked");
        } else {
          setStatus("revealed");
        }
      })
      .catch(() => {
        setErrorMsg("حدث خطأ أثناء تحميل الهدية. حاول مرة أخرى.");
        setStatus("error");
      });
  }, [orderId]);

  // Called by LockScreen — returns true if correct
  const handleUnlock = useCallback(
    (answer) => {
      if (!order) return false;
      const correct =
        answer.toLowerCase() === (order.customAnswer ?? "").toLowerCase();
      if (correct) setStatus("revealed");
      return correct;
    },
    [order]
  );

  return (
    <div dir="rtl" lang="ar" className="bg-[#07070a]">
      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div key="loading" exit={{ opacity: 0 }}>
            <LoadingScreen />
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ErrorScreen message={errorMsg} />
          </motion.div>
        )}

        {status === "date_locked" && (
          <motion.div
            key="date_locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <DateLockedScreen unlockDate={order.unlockDate} />
          </motion.div>
        )}

        {status === "locked" && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LockScreen
              question={order.customQuestion}
              onUnlock={handleUnlock}
            />
          </motion.div>
        )}

        {status === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RevealScreen order={order} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 LayoutDashboard
 , ShoppingBag
 , BrainCircuit
 , QrCode
 , Bell
 , Search
 , CheckCircle2
 , Clock
 , ExternalLink
 , ChevronRight
 , X
 , DollarSign
 , Package
 , Menu
} from 'lucide-react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";

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
 * ATHEER PLATFORM - ADMIN DASHBOARD (MOBILE RESPONSIVE + AI)
 */

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

const ADMIN_PIN = "2024";

const HEADER_TITLES = {
  dashboard: 'لوحة التحكم',
  orders: 'إدارة الطلبات',
  ai: 'سجل توصيات AI',
  qr: 'الصفحات الرقمية',
};

// ─── PIN Gate ────────────────────────────────────────────────────────────────
function PinGate({ onVerified }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('atheer_admin_ok', '1');
      onVerified();
    } else {
      setError(true);
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center px-6" dir="rtl">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30 mb-4">
            <SparklesIcon />
          </div>
          <h1 className="text-white text-2xl font-black">لوحة تحكم أثير</h1>
          <p className="text-gray-500 text-sm mt-1">أدخل رمز PIN للوصول</p>
        </div>

        {/* PIN form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-white/5 border rounded-2xl p-1 mb-4 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`}
          >
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="••••"
              autoFocus
              className="w-full bg-transparent px-4 py-4 text-white text-2xl tracking-[0.5em] text-center outline-none placeholder-gray-700 font-mono"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center mb-4"
            >
              رمز PIN غير صحيح
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-base shadow-lg shadow-violet-500/25 hover:opacity-90 transition-opacity"
          >
            دخول
          </button>
        </form>
      </motion.div>
    </div>
  );
}

const App = () => {
 const [activeTab, setActiveTab] = useState('orders');
 const [selectedOrder, setSelectedOrder] = useState(null);
 const [isAiThinking, setIsAiThinking] = useState(false);
 const [aiResult, setAiResult] = useState(null);
 const [showQR, setShowQR] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 const stats = [
  { title: 'إجمالي المبيعات', value: '12,450 ريال', icon: <DollarSign className="text-emerald-400" />, trend: '+14%' }
  , { title: 'الطلبات النشطة', value: '8 طلبات', icon: <Package className="text-purple-400" />, trend: '+2' }
  , { title: 'توصيات AI بانتظار', value: '3', icon: <BrainCircuit className="text-pink-400" />, trend: 'عاجل' }
  ];

 const [orders, setOrders] = useState([]);
 const [ordersLoading, setOrdersLoading] = useState(true);

 const runAiAgent = async () => {
  if (!selectedOrder) return;
  setIsAiThinking(true);
  setAiResult(null);
  try {
   const prompt = `أنت مساعد مشتريات ذكي لمتجر هدايا فاخر في السعودية. قم بتحليل البيانات التالية وأعطني النتائج بصيغة JSON فقط بدون أي نص خارج الـ JSON.

بيانات الطلب:
- العميل: ${selectedOrder.customer}
- الفئة: ${selectedOrder.tier} (${selectedOrder.budget})
- التوقيت المفضل: ${selectedOrder.survey.time}
- العلاقة: ${selectedOrder.survey.relation}
- الاهتمامات: ${selectedOrder.survey.interest}

أعطني JSON بهذا الشكل بالضبط:
{
  "personaAnalysis": "تحليل قصير للشخصية",
  "profitMargin": "المبلغ المتوقع بالريال والنسبة",
  "digitalTheme": { "vibe": "Cyber/Dark أو Classic أو Nature", "colors": "الألوان", "puzzle": "نوع اللغز" },
  "products": [
    { "name": "اسم المنتج", "price": 000, "url": "#", "reason": "سبب الاختيار" }
  ]
}`;
   const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promptText: prompt }),
   });
   if (!res.ok) throw new Error(`HTTP ${res.status}`);
   const data = await res.json();
   const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
   // Extract JSON block from Gemini response (may be wrapped in ```json ... ```)
   const match = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
   const jsonStr = match?.[1] ?? null;
   if (jsonStr) {
    const parsed = JSON.parse(jsonStr);
    setAiResult({
     personaAnalysis: parsed.personaAnalysis ?? raw,
     profitMargin: parsed.profitMargin ?? "—",
     digitalTheme: parsed.digitalTheme ?? { vibe: "Classic", colors: "—", puzzle: "—" },
     products: Array.isArray(parsed.products)
      ? parsed.products.map((p) => ({
         name: p.name ?? "—",
         price: Number(p.price) || 0,
         url: p.url ?? "#",
         reason: p.reason ?? "—",
        }))
      : [],
    });
   } else {
    setAiResult({ personaAnalysis: raw, profitMargin: "—", digitalTheme: { vibe: "—", colors: "—", puzzle: "—" }, products: [] });
   }
  } catch (err) {
   setAiResult({ personaAnalysis: `تعذّر الاتصال بخدمة AI: ${err.message}`, profitMargin: "—", digitalTheme: { vibe: "—", colors: "—", puzzle: "—" }, products: [] });
  } finally {
   setIsAiThinking(false);
  }
 };

 // Real-time Firestore orders subscription
 useEffect(() => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(
   q,
   (snapshot) => {
    setOrders(
     snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
       id: d.orderId ?? doc.id,
       customer: d.customerName ?? "—",
       tier: d.tier?.name ?? "—",
       budget: d.tier?.price ? `${d.tier.price} ريال` : "—",
       status: d.status ?? "pending",
       date: d.createdAt?.toDate?.().toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" }) ?? "—",
       survey: {
        time: d.surveyData?.time ?? "—",
        interest: d.surveyData?.interest ?? "—",
        relation: "—",
       },
      };
     })
    );
    setOrdersLoading(false);
   },
   () => setOrdersLoading(false)
  );
  return unsubscribe;
 }, []);

 const closeOrderModal = () => {
  setSelectedOrder(null);
  setAiResult(null);
  setIsAiThinking(false);
  setShowQR(false);
 };

 return (
  <div className="min-h-screen bg-[#07070a] text-right text-white font-sans flex overflow-hidden relative" dir="rtl">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-screen w-64 bg-[#0a0f1d] border-l border-white/5 flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
              <SparklesIcon />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">أثـيـر</span>
            <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded ml-auto">ADMIN</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {[
            { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'الرئيسية' },
            { id: 'orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'الطلبات', badge: '2' },
            { id: 'ai', icon: <BrainCircuit className="w-5 h-5" />, label: 'سجل AI' },
            { id: 'qr', icon: <QrCode className="w-5 h-5" />, label: 'الصفحات الرقمية' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === item.id ? 'bg-purple-600/10 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {item.icon} {item.label}
              {item.badge && <span className="mr-auto bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-[#0a0f1d] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-400 hover:text-white lg:hidden"><Menu className="w-6 h-6" /></button>
            <h1 className="text-lg lg:text-xl font-bold text-white truncate">{HEADER_TITLES[activeTab] ?? 'أثير'}</h1>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="hidden lg:block relative">
              <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="بحث..." className="bg-white/5 border border-white/10 rounded-full py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-64" />
            </div>
            <button className="w-9 h-9 lg:w-10 lg:h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white relative shrink-0">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">

          {/* Stats cards — shown on dashboard and orders tabs */}
          {(activeTab === 'dashboard' || activeTab === 'orders') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 lg:p-6 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">{stat.icon}</div>
                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-300">{stat.trend}</span>
                  </div>
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">{stat.title}</p>
                  <h3 className="text-xl lg:text-2xl font-black text-white">{stat.value}</h3>
                </div>
              ))}
            </div>
          )}

          {/* Dashboard tab — recent orders overview */}
          {activeTab === 'dashboard' && (
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-white/5 bg-black/20">
                <h3 className="text-base lg:text-lg font-bold text-white">آخر الطلبات</h3>
              </div>
              <div className="p-4 lg:p-6 space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs text-purple-400">{order.id}</span>
                      <p className="text-sm text-white font-bold mt-1">{order.customer} — {order.tier}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
                    >
                      معالجة <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders tab — full table */}
          {activeTab === 'orders' && (
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-base lg:text-lg font-bold text-white">أحدث الطلبات</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm min-w-[700px]">
                  <thead className="text-gray-500 bg-black/40 border-b border-white/5">
                    <tr>
                      <th className="py-4 px-4 lg:px-6 font-medium">رقم الطلب</th>
                      <th className="py-4 px-4 lg:px-6 font-medium">العميل</th>
                      <th className="py-4 px-4 lg:px-6 font-medium">الفئة</th>
                      <th className="py-4 px-4 lg:px-6 font-medium">الحالة</th>
                      <th className="py-4 px-4 lg:px-6 font-medium">الوقت</th>
                      <th className="py-4 px-4 lg:px-6 font-medium text-left">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {ordersLoading && (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                        <span className="inline-block w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2 align-middle" />
                        جاري تحميل الطلبات…
                      </td></tr>
                    )}
                    {!ordersLoading && orders.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">لا توجد طلبات بعد.</td></tr>
                    )}
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-4 px-4 lg:px-6 font-mono text-white text-xs lg:text-sm">{order.id}</td>
                        <td className="py-4 px-4 lg:px-6 whitespace-nowrap">{order.customer}</td>
                        <td className="py-4 px-4 lg:px-6 text-purple-300">
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">{order.tier}</span>
                            <span className="text-xs text-gray-500">{order.budget}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          {order.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> بانتظار المعالجة</span>}
                          {order.status === 'ai_processing' && <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium flex items-center gap-1 w-max"><BrainCircuit className="w-3 h-3"/> تم تحليل الـ AI</span>}
                        </td>
                        <td className="py-4 px-4 lg:px-6 text-gray-500 text-xs lg:text-sm whitespace-nowrap">{order.date}</td>
                        <td className="py-4 px-4 lg:px-6 text-left">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 lg:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-lg shadow-purple-500/20"
                          >
                            معالجة <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI tab — analysis log */}
          {activeTab === 'ai' && (
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-white/5 bg-black/20">
                <h3 className="text-base lg:text-lg font-bold text-white">سجل تحليلات AI</h3>
              </div>
              <div className="p-4 lg:p-6 space-y-3">
                {orders.filter(o => o.status === 'ai_processing').map(order => (
                  <div key={order.id} className="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="font-mono text-xs text-purple-400">{order.id}</span>
                      <p className="text-sm text-white font-bold mt-1">{order.customer} — {order.tier}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.survey.interest}</p>
                    </div>
                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 shrink-0">
                      <BrainCircuit className="w-3 h-3"/> تم التحليل
                    </span>
                  </div>
                ))}
                {orders.filter(o => o.status === 'ai_processing').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BrainCircuit className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لا توجد تحليلات حالياً</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR tab — generated pages */}
          {activeTab === 'qr' && (
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-white/5 bg-black/20">
                <h3 className="text-base lg:text-lg font-bold text-white">الصفحات الرقمية المُولَّدة</h3>
              </div>
              <div className="p-4 lg:p-6 text-center py-16 text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">لا توجد صفحات رقمية بعد.</p>
                <p className="text-xs mt-2 text-gray-600">الصفحات تُولَّد تلقائياً عند إكمال الطلب من نافذة المعالجة.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-end">
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="w-full lg:max-w-2xl bg-[#0f172a] h-full border-r border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-4 lg:p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0f1d] shrink-0">
                <div>
                  <h2 className="text-lg lg:text-2xl font-bold text-white flex items-center gap-2">طلب #{selectedOrder.id}</h2>
                  <p className="text-gray-400 text-xs lg:text-sm mt-1">{selectedOrder.customer} • {selectedOrder.tier}</p>
                </div>
                <button onClick={closeOrderModal} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 lg:p-6 flex-grow overflow-y-auto space-y-6 lg:space-y-8 custom-scrollbar">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0"><Search className="w-4 h-4" /></span>
                    بصمة الشخصية (بيانات العميل)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div className="bg-black/30 p-3 lg:p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] lg:text-xs text-gray-500 block mb-1">التوقيت المفضل</span>
                      <span className="text-sm lg:text-base text-white font-medium">{selectedOrder.survey.time}</span>
                    </div>
                    <div className="bg-black/30 p-3 lg:p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] lg:text-xs text-gray-500 block mb-1">العلاقة</span>
                      <span className="text-sm lg:text-base text-white font-medium">{selectedOrder.survey.relation}</span>
                    </div>
                    <div className="bg-black/30 p-3 lg:p-4 rounded-xl sm:col-span-2 border border-white/5">
                      <span className="text-[10px] lg:text-xs text-gray-500 block mb-1">الاهتمامات والتفاصيل</span>
                      <span className="text-sm lg:text-base text-white font-medium leading-relaxed">{selectedOrder.survey.interest}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/30 rounded-2xl p-4 lg:p-6 relative">
                  <h3 className="text-base lg:text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0"><BrainCircuit className="w-4 h-4" /></span>
                    مساعد المشتريات (AI Agent)
                  </h3>

                  {!aiResult && !isAiThinking && (
                    <div className="text-center py-6 lg:py-8">
                      <p className="text-gray-400 mb-6 text-xs lg:text-sm">توجيه الـ AI لتحليل البيانات والبحث ضمن ({selectedOrder.tier})</p>
                      <button onClick={runAiAgent} className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm lg:text-base font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mx-auto">
                        <BrainCircuit className="w-5 h-5" /> تفعيل التحليل والبحث الآن
                      </button>
                    </div>
                  )}

                  {isAiThinking && (
                    <div className="text-center py-8 lg:py-10 space-y-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                      <p className="text-purple-300 text-sm font-medium animate-pulse">يحلل الشخصية ويبحث...</p>
                    </div>
                  )}

                  {aiResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 lg:space-y-6">
                      <div className="bg-black/40 p-3 lg:p-4 rounded-xl text-xs lg:text-sm border border-purple-500/20">
                        <span className="text-purple-400 font-bold block mb-1">تحليل الشخصية:</span>
                        <p className="text-gray-300 leading-relaxed">{aiResult.personaAnalysis}</p>
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                          <span className="text-white text-sm font-bold">المنتجات المقترحة</span>
                          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold w-fit">الربح المتوقع: {aiResult.profitMargin}</span>
                        </div>
                        <div className="space-y-2 lg:space-y-3">
                          {aiResult.products.map((p, idx) => (
                            <div key={idx} className="bg-black/30 p-3 lg:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between border border-white/5 hover:border-purple-500/30 transition-colors gap-3">
                              <div>
                                <p className="text-white font-bold text-xs lg:text-sm mb-1">{p.name}</p>
                                <p className="text-gray-500 text-[10px] lg:text-xs">{p.reason}</p>
                              </div>
                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                                <span className="text-white font-bold bg-white/10 px-2 py-1 rounded text-xs">{p.price} ريال</span>
                                <a href={p.url} className="text-purple-400 text-[10px] lg:text-xs flex items-center gap-1 hover:underline">شراء <ExternalLink className="w-3 h-3" /></a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/40 p-3 lg:p-4 rounded-xl border border-pink-500/20">
                        <span className="text-pink-400 font-bold block mb-2 text-sm">الصفحة الرقمية</span>
                        <div className="flex flex-wrap gap-2 text-[10px] lg:text-xs text-gray-300">
                          <span className="bg-white/10 px-2 py-1 rounded border border-white/5">الثيم: {aiResult.digitalTheme.vibe}</span>
                          <span className="bg-white/10 px-2 py-1 rounded border border-white/5">اللون: {aiResult.digitalTheme.colors}</span>
                          <span className="bg-white/10 px-2 py-1 rounded border border-white/5">اللغز: {aiResult.digitalTheme.puzzle}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className={`border rounded-2xl p-4 lg:p-6 transition-all ${aiResult ? 'bg-white/5 border-emerald-500/30' : 'bg-black/20 border-white/5 opacity-50 grayscale pointer-events-none'}`}>
                  <h3 className="text-base lg:text-lg font-bold text-white mb-2 lg:mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0"><QrCode className="w-4 h-4" /></span>
                    التجهيز النهائي
                  </h3>
                  <p className="text-gray-400 text-xs lg:text-sm mb-4 lg:mb-6">توليد رمز QR قابل للطباعة وإرفاقه بالصندوق.</p>
                  {!showQR ? (
                    <button
                      onClick={() => setShowQR(true)}
                      className="w-full py-3 lg:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm lg:text-base font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      إنهاء وتوليد رابط QR <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-white p-4 rounded-2xl shadow-lg">
                        <QRCodeSVG
                          value={`${window.location.origin}/gift/${selectedOrder.id}`}
                          size={180}
                          bgColor="#ffffff"
                          fgColor="#07070a"
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-gray-400 text-xs text-center break-all max-w-xs">
                        {`${window.location.origin}/gift/${selectedOrder.id}`}
                      </p>
                      <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                      >
                        <QrCode className="w-4 h-4" /> طباعة رمز QR
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
 );
};

function AdminRoot() {
  const [pinVerified, setPinVerified] = useState(
    () => sessionStorage.getItem('atheer_admin_ok') === '1'
  );
  if (!pinVerified) return <PinGate onVerified={() => setPinVerified(true)} />;
  return <App />;
}

export default AdminRoot;

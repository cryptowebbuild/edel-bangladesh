import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Sparkles, CheckCircle2, Truck, ShieldCheck, 
  Star, Plus, Minus, X, ArrowRight, Heart, Eye, Gift, 
  MessageCircle, Phone, MapPin, User, ChevronRight, 
  TrendingUp, Clock, AlertCircle, PackageCheck, Search, Filter,
  Share2, Award, Zap, HelpCircle
} from 'lucide-react';
import { PRODUCTS, REVIEWS, FREE_DELIVERY_THRESHOLD } from './data/products';

export default function App() {
  // --- STATE ---
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([
    {
      ...PRODUCTS[0],
      selectedSize: '2.6 (২৬ সাইজ)',
      selectedColor: 'মেরুন গোল্ড',
      qty: 1
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [ownerPreviewMode, setOwnerPreviewMode] = useState(false);
  const [activeGalleryImg, setActiveGalleryImg] = useState({});

  // Countdown timer for Flash Deal (2 hours 45 mins countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Custom Combo Builder State
  const [customBox, setCustomBox] = useState({
    bangleStyle: 'ভেলভেট গোল্ডেন চুড়ি সেট',
    size: '2.6 (২৬ সাইজ)',
    earringStyle: 'মুক্তা ঝুমকা ইয়াররিংস',
    giftNote: ''
  });

  // Checkout Form State
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    zone: 'inside_dhaka',
    address: '',
    notes: ''
  });
  const [orderSubmitted, setOrderSubmitted] = useState(null);
  const [toast, setToast] = useState(null);

  // Selected options per product card
  const [cardSelections, setCardSelections] = useState(() => {
    const initial = {};
    PRODUCTS.forEach(p => {
      initial[p.id] = {
        size: p.sizes[1] || p.sizes[0],
        color: p.colors[0]
      };
    });
    return initial;
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // --- FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // --- CART CALCULATIONS ---
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const baseDeliveryFee = customer.zone === 'inside_dhaka' ? 70 : 120;
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD && subtotal > 0;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : baseDeliveryFee);
  const grandTotal = subtotal + deliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  // --- CART HANDLERS ---
  const addToCart = (product, size, color, qty = 1) => {
    const finalSize = size || cardSelections[product.id]?.size || product.sizes[0];
    const finalColor = color || cardSelections[product.id]?.color || product.colors[0];

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.selectedSize === finalSize && item.selectedColor === finalColor
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      }
      return [...prev, { ...product, selectedSize: finalSize, selectedColor: finalColor, qty }];
    });

    showToast(`"${product.name}" ব্যাগে যোগ হয়েছে! ✨`);
  };

  const addCustomBoxToCart = () => {
    const customProduct = {
      id: 'custom-box-' + Date.now(),
      name: `কাস্টমাইজড গিফট বক্স (${customBox.bangleStyle} + ${customBox.earringStyle})`,
      price: 650,
      selectedSize: customBox.size,
      selectedColor: customBox.giftNote ? `নোট: "${customBox.giftNote}"` : 'লাক্সারি রিবন প্যাকিং',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      qty: 1
    };
    setCart(prev => [...prev, customProduct]);
    setIsCartOpen(true);
    showToast('আপনার কাস্টম গিফট বক্স অর্ডারে যুক্ত হয়েছে! 🎁');
  };

  const updateQty = (index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].qty + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].qty = newQty;
      return updated;
    });
  };

  const handleDirectOrderJump = (product) => {
    const sel = cardSelections[product.id];
    addToCart(product, sel?.size, sel?.color, 1);
    const el = document.getElementById('checkout-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // --- WHATSAPP & ORDER SUBMISSION ---
  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('অর্ডার করতে অন্তত ১টি পণ্য যোগ করুন!');
      return;
    }

    const orderId = 'EDEL-' + Math.floor(100000 + Math.random() * 900000);
    const itemsListText = cart
      .map((item, idx) => `${idx + 1}. ${item.name} [সাইজ: ${item.selectedSize}, কালার: ${item.selectedColor}] × ${item.qty} = ৳${item.price * item.qty}`)
      .join('%0A');

    const zoneLabel = customer.zone === 'inside_dhaka' ? 'ঢাকার ভেতরে (৳৭০)' : 'ঢাকার বাইরে (৳১২০)';

    const waMessage = 
      `✨ *NEW ORDER — EDEL BANGLADESH* ✨%0A` +
      `🆔 *অর্ডার আইডি:* ${orderId}%0A%0A` +
      `🛍️ *অর্ডারকৃত পণ্যসমূহ:*%0A${itemsListText}%0A%0A` +
      `📦 *পণ্যের মূল্য:* ৳${subtotal}%0A` +
      `🚚 *ডেলিভারি চার্জ:* ${isFreeDelivery ? 'ফ্রি! (৳০)' : '৳' + deliveryFee} (${zoneLabel})%0A` +
      `💰 *মোট ক্যাশ অন ডেলিভারি বিল:* *৳${grandTotal}*%0A%0A` +
      `👤 *কাস্টমারের নাম:* ${customer.name}%0A` +
      `📞 *মোবাইল নাম্বার:* ${customer.phone}%0A` +
      `📍 *সম্পূর্ণ ঠিকানা:* ${customer.address}%0A` +
      (customer.notes ? `📝 *নোট:* ${customer.notes}` : '');

    setOrderSubmitted({
      orderId,
      customer,
      items: [...cart],
      subtotal,
      deliveryFee,
      grandTotal,
      waUrl: `https://wa.me/8801700000000?text=${waMessage}`
    });

    const el = document.getElementById('checkout-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1D1115] font-sans pb-24 md:pb-0 selection:bg-rose-800 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-zinc-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Owner Demo Pitch Bar (Helps Sagor Close the Client!) */}
      <div className="bg-zinc-950 text-amber-300 border-b border-amber-500/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-white">Edel Bangladesh (facebook.com/edelbangladesh)</span>
            <span className="hidden sm:inline text-zinc-400">— প্রিমিয়াম অটোমেটেড অর্ডারিং ওয়েবসাইট ডেমো</span>
          </div>
          <button
            onClick={() => setOwnerPreviewMode(!ownerPreviewMode)}
            className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 px-3.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {ownerPreviewMode ? 'কাস্টমার ভিউতে ফিরুন' : 'পেজ ওনার বেনিফিট দেখুন (Why Website?)'}
          </button>
        </div>
      </div>

      {/* Merchant ROI Panel (Collapsible Pitch for Edel Owner) */}
      {ownerPreviewMode && (
        <div className="bg-gradient-to-r from-zinc-900 via-rose-950 to-zinc-900 text-white border-b-2 border-amber-400/60 p-6 md:p-8 transition-all">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="bg-amber-400 text-zinc-950 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  For Edel Bangladesh Admin & Page Owner
                </span>
                <h3 className="text-xl md:text-3xl font-extrabold mt-2 text-white">
                  কেন "Inbox for Order"-এর পাশাপাশি এই ওয়েবসাইটটি আপনার সেলস ২ থেকে ৩ গুণ বাড়াবে?
                </h3>
              </div>
              <button onClick={() => setOwnerPreviewMode(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition">
                <div className="text-amber-400 font-bold text-base mb-1">১. ২৪/৭ অটো অর্ডারিং</div>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  রাত ২টায় আপনার অ্যাডমিন ঘুমিয়ে থাকলেও কাস্টমার নিজেই চুড়ির সাইজ (২.৪/২.৬/২.৮) সিলেক্ট করে অর্ডার কমপ্লিট করতে পারবে। ইনবক্সে দেরি হওয়ার কারণে কাস্টমার হারাবেন না।
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition">
                <div className="text-amber-400 font-bold text-base mb-1">২. অ্যাভারেজ অর্ডার ভ্যালু বৃদ্ধি</div>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  ওয়েবসাইটে "১,২০০ টাকায় ফ্রি ডেলিভারি" প্রগ্রেস বার থাকায় কাস্টমার ৩২০ টাকার ১টি কম্বোর বদলে ২-৩টি কম্বো একসাথে কার্টে যোগ করে।
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition">
                <div className="text-amber-400 font-bold text-base mb-1">৩. জিরো সার্ভার ও মেইনটেনেন্স খরচ</div>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  সম্পূর্ণ অর্ডার মেমো কাস্টমারের নাম, ফোন, ঠিকানা ও সাইজসহ ১-ক্লিকে সরাসরি আপনার অফিসিয়াল হোয়াটসঅ্যাপে চলে আসবে। কোনো ডাটাবেজ জটিলতা নেই।
                </p>
              </div>
              <div className="bg-amber-400/10 border border-amber-400/40 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-amber-300 font-bold text-base mb-1">ডেভেলপার গ্যারান্টি</div>
                  <p className="text-zinc-200 text-xs leading-relaxed">
                    Crafted by <strong>Sagor Ahamed</strong> (CryptoWebBuild). আপনার পেজের ছবি, রিয়েল ফোন নাম্বার ও লোগো দিয়ে ২৪ ঘণ্টার মধ্যে ফুল্লি লাইভ করা সম্ভব।
                  </p>
                </div>
                <a 
                  href="https://wa.me/8801700000000" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 bg-amber-400 text-zinc-950 font-bold py-2 rounded-xl text-center text-xs hover:bg-amber-300 transition"
                >
                  সরাসরি সাগর আহমেদের সাথে কথা বলুন →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Marquee Bar */}
      <div className="rose-gold-grad text-white py-2.5 px-4 text-center text-xs md:text-sm font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>সারা বাংলাদেশে ১০০% ক্যাশ অন ডেলিভারি (পণ্য হাতে দেখে টাকা দিন) | <strong>১,২০০+ টাকার অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</strong></span>
          <span className="hidden md:inline-block bg-white/20 text-amber-200 px-2 py-0.5 rounded-full text-xs font-bold ml-2">
            অফার শেষ হতে বাকি: {timeLeft.hours} ঘণ্টা {timeLeft.minutes} মিনিট {timeLeft.seconds} সেকেন্ড
          </span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full rose-gold-grad flex items-center justify-center text-amber-300 font-royal font-extrabold text-2xl shadow-md border-2 border-amber-300/50 group-hover:scale-105 transition">
              E
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-royal font-extrabold text-xl md:text-2xl tracking-wider text-[#1D1115]">EDEL</span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">BD</span>
              </div>
              <span className="text-[11px] text-rose-700 font-medium block leading-none">
                Churi • Bridal • Gift Combos
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-zinc-700">
            <a href="#catalog" className="hover:text-rose-800 transition">চুড়ি ও কম্বো কালেকশন</a>
            <a href="#custom-builder" className="hover:text-rose-800 transition flex items-center gap-1">
              <Gift className="w-4 h-4 text-rose-700" /> কাস্টম গিফট বক্স বানান
            </a>
            <button onClick={() => setShowSizeGuide(true)} className="hover:text-rose-800 transition flex items-center gap-1">
              <span>📏 চুড়ির সাইজ গাইড</span>
              <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">২.৪/২.৬/২.৮</span>
            </button>
            <a href="#reviews" className="hover:text-rose-800 transition">কাস্টমার রিভিউ ({REVIEWS.length})</a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSizeGuide(true)}
              className="lg:hidden bg-rose-50 text-rose-900 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              📏 সাইজ গাইড
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-200 px-3.5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4 text-rose-800" />
              <span className="hidden sm:inline">শপিং ব্যাগ</span>
              <span className="rose-gold-grad text-white text-xs px-2 py-0.5 rounded-full font-extrabold shadow">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </button>

            <a
              href="#checkout-section"
              className="hidden sm:flex rose-gold-grad hover:opacity-95 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md items-center gap-1.5 transition"
            >
              <span>১-ক্লিকে অর্ডার</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#FDF2F5] via-[#FFF9FA] to-[#FFFDF9] border-b border-rose-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-rose-800 shadow-sm border border-rose-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>ইনবক্সে অপেক্ষার দিন শেষ — সরাসরি সাইজ সিলেক্ট করে অর্ডার করুন!</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1D1115] leading-[1.25]">
              আপনার হাত রাঙিয়ে তুলুন{' '}
              <span className="text-rose-800 underline decoration-amber-400 decoration-wavy">
                Edel Bangladesh
              </span>
              -এর ভাইরাল চুড়ি ও গিফট কম্বোতে ✨
            </h1>

            <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              ৩২০ টাকার সিগনেচার চুড়ি কম্বো, ৭০০ টাকার ২৪ পিস ভাইরাল বউ চুড়ি থেকে শুরু করে প্রিমিয়াম গিফট হ্যাম্পার—সবকিছুই পাচ্ছেন এক জায়গায়। <strong>অগ্রিম ১ টাকাও দিতে হবে না</strong>; ডেলিভারি ম্যানের সামনে বক্স খুলে দেখে মূল্য পরিশোধ করুন!
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-1">
              <a
                href="#catalog"
                className="rose-gold-grad text-white px-7 py-4 rounded-2xl font-bold text-base shadow-xl shadow-rose-900/20 hover:scale-[1.01] transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <span>কম্বো কালেকশন ও দাম দেখুন</span>
              </a>
              <a
                href="#custom-builder"
                className="bg-white hover:bg-rose-50 text-rose-950 border-2 border-rose-200 px-6 py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5 text-rose-700" />
                <span>নিজের মতো গিফট বক্স সাজান</span>
              </a>
            </div>

            {/* Real Social Proof Metrics */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-rose-200/70 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-center lg:text-left shadow-sm">
                <div className="font-extrabold text-lg md:text-xl text-rose-900">১৫,০০০+</div>
                <div className="text-[11px] text-zinc-500 font-medium">সফল ডেলিভারি সারা দেশে</div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-center lg:text-left shadow-sm">
                <div className="font-extrabold text-lg md:text-xl text-rose-900">৪.৯/৫.০ ⭐</div>
                <div className="text-[11px] text-zinc-500 font-medium">কাস্টমার স্যাটিসফ্যাকশন</div>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-center lg:text-left shadow-sm">
                <div className="font-extrabold text-lg md:text-xl text-rose-900">১০০% COD</div>
                <div className="text-[11px] text-zinc-500 font-medium">চেক করে নেওয়ার সুবিধা</div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Interactive Deal Card */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 md:p-5 rounded-3xl shadow-2xl border-2 border-amber-300/60 relative">
              <div className="relative rounded-2xl overflow-hidden group">
                <img
                  src={PRODUCTS[0].image}
                  alt="Edel Signature Churi Combo"
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-400/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ফেসবুকের সবচেয়ে ভাইরাল কম্বো!</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-rose-700 text-white px-3 py-1 rounded-lg text-xs font-bold shadow">
                  ২.৪, ২.৬ ও ২.৮ সাইজ রেডি স্টক
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">#churi_by_edel</span>
                    <h3 className="text-lg font-extrabold text-zinc-900">Edel সিগনেচার ভেলভেট ও মেটাল চুড়ি কম্বো</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-zinc-400 line-through block">৳৪৫০</span>
                    <span className="text-2xl font-extrabold text-rose-800">৳৩২০</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-rose-50/80 px-3.5 py-2.5 rounded-xl border border-rose-100 text-xs">
                  <span className="text-rose-950 font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-700" />
                    আজকের অর্ডারে দ্রুত ডিসপ্যাচ
                  </span>
                  <button
                    onClick={() => handleDirectOrderJump(PRODUCTS[0])}
                    className="bg-rose-800 hover:bg-rose-900 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-1 shadow"
                  >
                    <span>এখনই অর্ডার করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE DELIVERY PROGRESS BAR BANNER */}
      <div className="max-w-7xl mx-auto px-4 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              {isFreeDelivery ? (
                <p className="text-sm font-extrabold text-emerald-700">
                  🎉 অভিনন্দন! আপনি সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি আনলক করেছেন!
                </p>
              ) : (
                <p className="text-sm font-bold text-zinc-800">
                  আর মাত্র <span className="text-rose-700 font-extrabold">৳{amountNeededForFreeDelivery}</span> টাকার পণ্য যোগ করলেই পাচ্ছেন <span className="underline decoration-rose-500 font-bold">সম্পূর্ণ ফ্রি ডেলিভারি!</span>
                </p>
              )}
              <div className="w-full sm:w-80 h-2.5 bg-rose-100 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-700 via-pink-600 to-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600">
            <span>বর্তমান ব্যাগ: <strong className="text-rose-800 text-sm">৳{subtotal}</strong></span>
            <a href="#checkout-section" className="bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-zinc-800 transition">
              অর্ডার ফর্মে যান ↓
            </a>
          </div>
        </div>
      </div>

      {/* PRODUCT CATALOG SECTION */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
              Official Live Catalog
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-900 mt-2">
              পছন্দের চুড়ি ও জুয়েলারি কম্বো বেছে নিন
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              কার্ড থেকেই সরাসরি হাতের সাইজ (২.৪ / ২.৬ / ২.৮) এবং কালার সিলেক্ট করে অর্ডার করতে পারবেন
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="চুড়ি বা কম্বো খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-rose-200 text-xs bg-white text-zinc-800 outline-none focus:border-rose-700 w-44 sm:w-56"
              />
            </div>
            {[
              { id: 'all', label: 'সব কালেকশন' },
              { id: 'churi', label: 'চুড়ি কম্বো (৳৩২০+)' },
              { id: 'bridal', label: 'বউ চুড়ি (২৪ পিস)' },
              { id: 'hamper', label: 'গিফট হ্যাম্পার' },
              { id: 'jewelry', label: 'ঝুমকা ও জুয়েলারি' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? 'rose-gold-grad text-white shadow-md'
                    : 'bg-white text-zinc-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
          {filteredProducts.map(product => {
            const currentSel = cardSelections[product.id] || {
              size: product.sizes[0],
              color: product.colors[0]
            };
            const currentImg = activeGalleryImg[product.id] || product.image;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image Wrapper */}
                <div className="relative overflow-hidden h-64 bg-rose-50">
                  <img
                    src={currentImg}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className={`absolute top-3 left-3 ${product.badgeColor} text-[11px] font-bold px-3 py-1 rounded-full shadow`}>
                    {product.badge}
                  </span>
                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-zinc-900 p-2 rounded-full shadow-md transition"
                    title="বিস্তারিত দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2.5 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{product.rating} ({product.reviewsCount} রিভিউ)</span>
                  </div>
                </div>

                {/* Thumbnail Gallery Row if multiple images */}
                {product.gallery && product.gallery.length > 1 && (
                  <div className="flex gap-1.5 px-4 pt-2.5 bg-rose-50/40">
                    {product.gallery.map((imgUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveGalleryImg(prev => ({ ...prev, [product.id]: imgUrl }))}
                        className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition ${
                          currentImg === imgUrl ? 'border-rose-800 scale-105' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
                      <span>{product.tag}</span>
                      <span className="text-rose-700 font-bold">মাত্র {product.stockLeft}টি সেট বাকি</span>
                    </div>
                    <h3 className="font-extrabold text-base text-zinc-900 mt-1 group-hover:text-rose-800 transition line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Interactive Size & Color Selector inside Card */}
                  <div className="space-y-2.5 pt-2 border-t border-rose-100/80">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 mb-1">
                        <span>হাতের সাইজ:</span>
                        <button
                          type="button"
                          onClick={() => setShowSizeGuide(true)}
                          className="text-rose-700 underline"
                        >
                          সাইজ চিনছেন না?
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() =>
                              setCardSelections(prev => ({
                                ...prev,
                                [product.id]: { ...currentSel, size: sz }
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition ${
                              currentSel.size === sz
                                ? 'bg-rose-800 text-white border-rose-800'
                                : 'bg-rose-50/60 text-zinc-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-zinc-700 mb-1">কালার / ভ্যারিয়েন্ট:</span>
                      <select
                        value={currentSel.color}
                        onChange={e =>
                          setCardSelections(prev => ({
                            ...prev,
                            [product.id]: { ...currentSel, color: e.target.value }
                          }))
                        }
                        className="w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 outline-none focus:border-rose-700"
                      >
                        {product.colors.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-3 border-t border-rose-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-zinc-400 line-through block">৳{product.originalPrice}</span>
                      <span className="text-xl font-extrabold text-rose-800">৳{product.price}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addToCart(product, currentSel.size, currentSel.color, 1)}
                        className="bg-rose-100 hover:bg-rose-200 text-rose-900 p-2.5 rounded-xl font-bold transition"
                        title="ব্যাগে যোগ করুন"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectOrderJump(product)}
                        className="rose-gold-grad hover:opacity-95 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>অর্ডার</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE CUSTOM GIFT COMBO BUILDER */}
      <section id="custom-builder" className="bg-gradient-to-br from-[#230C14] via-[#3A101E] to-[#1A090F] text-white py-14 my-8">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="bg-amber-400 text-zinc-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              🎁 Build Your Own Gift Box
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
              নিজের পছন্দে সাজিয়ে নিন <span className="text-amber-300">কাস্টম চুড়ি ও জুয়েলারি গিফট বক্স!</span>
            </h2>
            <p className="text-rose-100/80 text-sm leading-relaxed">
              প্রিয় মানুষ বা বান্ধবীকে গিফট দিতে চান? আপনার পছন্দের চুড়ির সেট, কানের দুল এবং একটি সুন্দর চিরকুট (Gift Note) লিখে কাস্টম বক্স তৈরি করুন মাত্র <strong>৳৬৫০ টাকায়!</strong>
            </p>
            <div className="bg-white/10 border border-white/15 p-4 rounded-2xl space-y-2 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>লাক্সারি হার্ড গিফট বক্স ও রিবন প্যাকিং সম্পূর্ণ ফ্রি</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>কাস্টম হ্যান্ডরিটেন উইশ কার্ড যুক্ত করার সুবিধা</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white text-zinc-900 p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-300">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">১. চুড়ির ডিজাইন বেছে নিন</label>
                <select
                  value={customBox.bangleStyle}
                  onChange={e => setCustomBox({ ...customBox, bangleStyle: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-rose-700 outline-none"
                >
                  <option value="ভেলভেট গোল্ডেন চুড়ি সেট">ভেলভেট গোল্ডেন চুড়ি সেট</option>
                  <option value="রেশমি মুক্তা চুড়ি কম্বো">রেশমি মুক্তা চুড়ি কম্বো</option>
                  <option value="অ্যান্টিক কুন্দন ব্রাইডাল চুড়ি">অ্যান্টিক কুন্দন ব্রাইডাল চুড়ি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">২. হাতের সাইজ</label>
                <select
                  value={customBox.size}
                  onChange={e => setCustomBox({ ...customBox, size: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-rose-700 outline-none"
                >
                  <option value="2.4 (২৪ সাইজ)">২.৪ (২৪ সাইজ)</option>
                  <option value="2.6 (২৬ সাইজ)">২.৬ (২৬ সাইজ)</option>
                  <option value="2.8 (২৮ সাইজ)">২.৮ (২৮ সাইজ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">৩. সাথে কোন জুয়েলারি যোগ করবেন?</label>
                <select
                  value={customBox.earringStyle}
                  onChange={e => setCustomBox({ ...customBox, earringStyle: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-rose-700 outline-none"
                >
                  <option value="মুক্তা ঝুমকা ইয়াররিংস">মুক্তা ঝুমকা ইয়াররিংস</option>
                  <option value="অ্যাডজাস্টেবল ফ্লাওয়ার রিং + ব্রেসলেট">অ্যাডজাস্টেবল ফ্লাওয়ার রিং + ব্রেসলেট</option>
                  <option value="গোল্ড প্লেটেড নেকলেস লকেট">গোল্ড প্লেটেড নেকলেস লকেট</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">৪. গিফট কার্ডে কী লেখা থাকবে? (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: শুভ জন্মদিন প্রিয়..."
                  value={customBox.giftNote}
                  onChange={e => setCustomBox({ ...customBox, giftNote: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-rose-700"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-500 block">কাস্টম গিফট হ্যাম্পার মূল্য:</span>
                <span className="text-2xl font-extrabold text-rose-800">৳৬৫০ মাত্র</span>
              </div>
              <button
                type="button"
                onClick={addCustomBoxToCart}
                className="w-full sm:w-auto rose-gold-grad text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>কাস্টম বক্সটি ব্যাগে যোগ করুন</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS SECTION */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">Real Customer Love</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2">আমাদের কাস্টমারদের মতামত ❤️</h2>
          <p className="text-xs text-zinc-500 mt-1">সব রিভিউ ফেসবুক পেজ ও ডেলিভারি থেকে সংগৃহীত</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-zinc-400">{rev.date}</span>
              </div>
              <p className="text-xs md:text-sm text-zinc-700 leading-relaxed">“{rev.comment}”</p>
              <div className="pt-3 border-t border-rose-50 flex items-center gap-3">
                <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover border border-rose-200" />
                <div>
                  <div className="font-bold text-sm text-zinc-900">{rev.name}</div>
                  <div className="text-[11px] text-rose-700 font-medium">{rev.location} • {rev.item}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 1-CLICK DIRECT CHECKOUT & WHATSAPP ORDER ENGINE */}
      <section id="checkout-section" className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-rose-800/20 overflow-hidden">
          <div className="rose-gold-grad text-white p-6 md:p-8 text-center">
            <span className="bg-white/20 text-amber-200 text-xs px-3.5 py-1 rounded-full font-bold">
              🔒 ১০০% ক্যাশ অন ডেলিভারি — অগ্রিম ১ টাকাও দিতে হবে না
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-3">
              সরাসরি অর্ডার কনফার্ম করুন (মাত্র ৩০ সেকেন্ডে)
            </h2>
            <p className="text-xs md:text-sm text-rose-100 mt-1">
              নিচের ফর্মটি পূরণ করে বাটনে চাপ দিলেই আপনার অর্ডার মেমো সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপ ও সিস্টেমে চলে যাবে
            </p>
          </div>

          {orderSubmitted ? (
            /* Order Confirmation Receipt Modal View */
            <div className="p-6 md:p-10 text-center space-y-6 bg-emerald-50/50">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow">
                <PackageCheck className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Order Ready • ID #{orderSubmitted.orderId}
                </span>
                <h3 className="text-2xl font-extrabold text-zinc-900 mt-2">
                  ধন্যবাদ {orderSubmitted.customer.name}! আপনার অর্ডারটি প্রস্তুত হয়েছে 🎉
                </h3>
                <p className="text-sm text-zinc-600 mt-1 max-w-lg mx-auto">
                  অর্ডারটি চূড়ান্ত করতে নিচের সবুজ বাটনে ক্লিক করে আমাদের অফিসিয়াল হোয়াটসঅ্যাপে মেসেজটি পাঠিয়ে দিন। আমাদের প্রতিনিধি দ্রুত কল করে ডেলিভারি কনফার্ম করবে।
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 max-w-lg mx-auto text-left text-xs space-y-2 shadow-sm">
                <div className="font-bold text-sm text-zinc-900 border-b pb-2">অর্ডার সামারি:</div>
                {orderSubmitted.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-700">
                    <span>{item.name} ({item.selectedSize}) × {item.qty}</span>
                    <span className="font-bold">৳{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-extrabold text-sm text-rose-800">
                  <span>ডেলিভারি ম্যানকে পরিশোধযোগ্য মোট বিল:</span>
                  <span>৳{orderSubmitted.grandTotal}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={orderSubmitted.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-extrabold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp-এ অর্ডার স্লিপ পাঠান (1-Click)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setOrderSubmitted(null)}
                  className="bg-white text-zinc-700 border border-zinc-300 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-50"
                >
                  অর্ডার পরিবর্তন করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 grid lg:grid-cols-12 gap-8">
              {/* Left Column: Selected Items in Order */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-rose-800" />
                    <span>আপনার বাছাইকৃত পণ্য ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                  </h3>
                  <a href="#catalog" className="text-xs font-bold text-rose-700 underline">
                    + আরও যোগ করুন
                  </a>
                </div>

                {cart.length === 0 ? (
                  <div className="bg-rose-50/70 border border-dashed border-rose-200 rounded-2xl p-6 text-center space-y-3">
                    <p className="text-xs text-zinc-600">আপনার ব্যাগে কোনো পণ্য নেই। ওপরের ক্যাটালগ থেকে পছন্দের চুড়ি সিলেক্ট করুন।</p>
                    <button
                      type="button"
                      onClick={() => addToCart(PRODUCTS[0], '2.6 (২৬ সাইজ)', 'মেরুন গোল্ড', 1)}
                      className="bg-rose-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      + ৩২০ টাকার কম্বো যোগ করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-zinc-900 truncate">{item.name}</h4>
                          <p className="text-[11px] text-rose-800 font-medium">
                            সাইজ: {item.selectedSize} | {item.selectedColor}
                          </p>
                          <div className="text-xs font-extrabold text-zinc-900 mt-0.5">
                            ৳{item.price * item.qty}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-rose-200">
                          <button type="button" onClick={() => updateQty(idx, -1)} className="p-1 text-zinc-600 hover:text-rose-700">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                          <button type="button" onClick={() => updateQty(idx, 1)} className="p-1 text-zinc-600 hover:text-rose-700">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bill Summary Box */}
                <div className="bg-[#FDF2F5] p-4 rounded-2xl border border-rose-200 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-600 text-xs">
                    <span>পণ্যের মোট মূল্য:</span>
                    <span className="font-bold text-zinc-900">৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 text-xs">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold text-rose-800">
                      {isFreeDelivery ? 'ফ্রি! (৳০)' : `৳${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-rose-200 pt-2 flex justify-between text-base font-extrabold text-rose-900">
                    <span>সর্বমোট বিল (ক্যাশ অন ডেলিভারি):</span>
                    <span>৳{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Address Form */}
              <form onSubmit={handleOrderSubmit} className="lg:col-span-7 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">১. আপনার সম্পূর্ণ নাম *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="যেমন: তাসনিম জারা"
                        value={customer.name}
                        onChange={e => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-3 text-sm focus:border-rose-700 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">২. সচল মোবাইল নাম্বার (১১ ডিজিট) *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        pattern="[0-9+]{11,14}"
                        placeholder="017XXXXXXXX"
                        value={customer.phone}
                        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-3 text-sm focus:border-rose-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Area Radio */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">৩. ডেলিভারি এরিয়া নির্বাচন করুন *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border cursor-pointer transition ${
                        customer.zone === 'inside_dhaka'
                          ? 'bg-rose-50 border-rose-700 text-rose-950 font-bold'
                          : 'border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={customer.zone === 'inside_dhaka'}
                        onChange={() => setCustomer({ ...customer, zone: 'inside_dhaka' })}
                        className="text-rose-800"
                      />
                      <span className="text-xs sm:text-sm">ঢাকা সিটির ভেতরে (৳৭০)</span>
                    </label>
                    <label
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border cursor-pointer transition ${
                        customer.zone === 'outside_dhaka'
                          ? 'bg-rose-50 border-rose-700 text-rose-950 font-bold'
                          : 'border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={customer.zone === 'outside_dhaka'}
                        onChange={() => setCustomer({ ...customer, zone: 'outside_dhaka' })}
                        className="text-rose-800"
                      />
                      <span className="text-xs sm:text-sm">ঢাকার বাইরে সারা দেশে (৳১২০)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    ৪. ডেলিভারি ঠিকানা (বাসা নং, রোড, এলাকা, থানা ও জেলা) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="আপনার বিস্তারিত ঠিকানা লিখুন যাতে ডেলিভারি ম্যান সহজে খুঁজে পায়..."
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:border-rose-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    ৫. স্পেশাল নির্দেশনা বা চুড়ির কালার নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: বিকেল ৫টার পর ডেলিভারি দিলে ভালো হয়..."
                    value={customer.notes}
                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:border-rose-700 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl text-base shadow-xl shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>অর্ডার কনফার্ম করুন — মোট ৳{grandTotal} (Cash on Delivery)</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* BANGLE SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-zinc-900">📏 আপনার হাতের চুড়ির সঠিক সাইজ জানুন</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-zinc-400 hover:text-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              বাসায় থাকা পুরনো যেকোনো চুড়ির ভেতরের ব্যাস (Inner Diameter) স্কেল দিয়ে মেপে নিচের চার্টের সাথে মিলিয়ে নিন:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-3 bg-rose-50 rounded-xl font-semibold">
                <span>২.৪ (২৪ সাইজ - চিকন হাত)</span>
                <span className="text-rose-800 font-bold">২.২৫ ইঞ্চি (5.7 cm)</span>
              </div>
              <div className="flex justify-between p-3 bg-rose-100/70 rounded-xl font-semibold border border-rose-300">
                <span>২.৬ (২৬ সাইজ - সবচেয়ে কমন সাইজ)</span>
                <span className="text-rose-800 font-bold">২.৩৭ ইঞ্চি (6.0 cm)</span>
              </div>
              <div className="flex justify-between p-3 bg-rose-50 rounded-xl font-semibold">
                <span>২.৮ (২৮ সাইজ - একটু ভারী হাত)</span>
                <span className="text-rose-800 font-bold">২.৫০ ইঞ্চি (6.35 cm)</span>
              </div>
            </div>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full rose-gold-grad text-white py-3 rounded-xl font-bold text-sm shadow"
            >
              বুঝেছি, কেনাকাটা শুরু করি
            </button>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="relative h-64">
              <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 bg-white text-zinc-900 p-2 rounded-full shadow"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <span className="text-xs font-bold text-rose-700">{quickViewProduct.tag}</span>
              <h3 className="text-xl font-extrabold text-zinc-900">{quickViewProduct.name}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">{quickViewProduct.description}</p>
              <div className="text-2xl font-extrabold text-rose-800">৳{quickViewProduct.price}</div>
              <button
                onClick={() => {
                  handleDirectOrderJump(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="w-full rose-gold-grad text-white py-3.5 rounded-xl font-bold text-sm shadow"
              >
                এখনই অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-800" />
                  <span>আপনার শপিং ব্যাগ</span>
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-zinc-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-rose-700">{item.selectedSize} • {item.selectedColor}</p>
                      <span className="font-extrabold text-xs">৳{item.price * item.qty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(idx, -1)} className="p-1 bg-white rounded border"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold px-1.5">{item.qty}</span>
                      <button onClick={() => updateQty(idx, 1)} className="p-1 bg-white rounded border"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between font-extrabold text-base">
                <span>মোট পণ্য মূল্য:</span>
                <span className="text-rose-800">৳{subtotal}</span>
              </div>
              <a
                href="#checkout-section"
                onClick={() => setIsCartOpen(false)}
                className="block w-full text-center rose-gold-grad text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg"
              >
                চেকআউট ও অর্ডার কনফার্ম করুন →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <a
        href="https://wa.me/8801700000000?text=Hello%20Edel%20Bangladesh,%20I%20have%20a%20question%20about%20churi%20combo"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-6 left-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition border-2 border-white"
        title="WhatsApp Support"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden md:inline text-xs font-bold">হোয়াটসঅ্যাপ সাপোর্ট</span>
      </a>

      {/* FOOTER */}
      <footer className="bg-[#180B10] text-zinc-400 py-12 text-center text-xs border-t border-rose-950">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          <div className="font-royal font-bold text-white text-xl tracking-widest">EDEL BANGLADESH</div>
          <p className="text-zinc-300">চুড়ি, বউ চুড়ি ও প্রিমিয়াম গিফট হ্যাম্পার • সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</p>
          <div className="flex justify-center gap-4 text-xs text-rose-300">
            <span>✓ নো অ্যাডভান্স পেমেন্ট</span>
            <span>✓ বক্স খুলে চেক করে নেওয়ার সুবিধা</span>
            <span>✓ ফাস্ট ডেলিভারি</span>
          </div>
          <p>
            Official Facebook Page:{' '}
            <a href="https://www.facebook.com/edelbangladesh/" target="_blank" rel="noreferrer" className="text-amber-300 underline font-semibold">
              facebook.com/edelbangladesh
            </a>
          </p>
          <div className="pt-6 border-t border-white/10 text-[11px] text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 Edel Bangladesh. All Rights Reserved.</span>
            <span>
              High-Converting Web Architecture Built by <strong className="text-amber-300">Sagor Ahamed (CryptoWebBuild)</strong>
            </span>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-rose-200 p-3 flex items-center justify-between md:hidden z-40 shadow-2xl">
        <div>
          <span className="text-[10px] text-zinc-500 block">মোট বিল ({cart.reduce((s, i) => s + i.qty, 0)}টি পণ্য)</span>
          <span className="text-lg font-extrabold text-rose-800">৳{grandTotal}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-rose-50 text-rose-900 border border-rose-200 px-3 py-2.5 rounded-xl text-xs font-bold"
          >
            ব্যাগ দেখুন
          </button>
          <a
            href="#checkout-section"
            className="rose-gold-grad text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1"
          >
            <span>অর্ডার করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

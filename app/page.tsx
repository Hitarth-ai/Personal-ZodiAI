"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageCircle, Heart, Shield, Star, Lock, Moon, Sun, Menu, X, ArrowRight, Globe, HelpCircle, ChevronDown, CheckCircle, Calendar, Briefcase, Clock, Zap, Target, Repeat, BookOpen, User, Plus, Minus, Mic, Save, RotateCcw } from "lucide-react";

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [lang, setLang] = useState("English");
    const [scrolled, setScrolled] = useState(false);

    // Demo Widget State
    const [activeDemoTab, setActiveDemoTab] = useState<"daily" | "career" | "relationships">("daily");

    const router = useRouter();
    const [demoName, setDemoName] = useState("");
    const [demoCity, setDemoCity] = useState("");
    const [demoDay, setDemoDay] = useState("");
    const [demoMonth, setDemoMonth] = useState("");
    const [demoYear, setDemoYear] = useState("");
    const [demoHour, setDemoHour] = useState("");
    const [demoMinute, setDemoMinute] = useState("");

    const handleDemoSubmit = () => {
        if (!demoName || !demoDay || !demoMonth || !demoYear) return;

        const params = new URLSearchParams({
            name: demoName,
            place: demoCity,
            day: demoDay,
            month: demoMonth,
            year: demoYear,
            hour: demoHour,
            minute: demoMinute
        });

        router.push(`/chat?${params.toString()}`);
    };



    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "#features" },

        { name: "How it works", href: "#how-it-works" },
        { name: "Privacy", href: "/privacy" },
        { name: "FAQ", href: "#faq" },
    ];

    const demoContent = {
        daily: {
            question: "What's the vibe for today?",
            answer: "Moon in Taurus brings a grounding energy. Focus on tangible tasks and sensory comforts.",
            why: "The Moon is transiting your 2nd house of resources, stabilizing emotions through material security.",
            nextStep: "Review your budget or enjoy a good meal. Avoid impulsive spending."
        },
        career: {
            question: "Should I switch jobs right now?",
            answer: "It's a time for planning, not leaping. Mercury retrograde suggests reviewing details first.",
            why: "Your 10th lord is currently combust, indicating potential for miscommunication with authority.",
            nextStep: "Update your resume and network quietly. Wait 3 weeks before signing contracts."
        },
        relationships: {
            question: "Why is there tension with my partner?",
            answer: "Mars aspecting Venus creates friction, but also passion. It's a clash of wills.",
            why: "A temporary transit affecting your 7th house axis highlights deeper unmet needs.",
            nextStep: "Plan a physical activity together to channel the energy constructively. Avoid late-night arguments."
        }
    };



    return (
        <div className="min-h-screen bg-[var(--surface-light)] text-[var(--text-light-primary)] font-sans selection:bg-[var(--brand-primary)] selection:text-white overflow-x-hidden">
            {/* Navigation */}
            <nav
                className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent ${scrolled || isMobileMenuOpen
                    ? "bg-[var(--surface-dark)]/95 backdrop-blur-md border-[var(--border-dark)] shadow-lg"
                    : "bg-transparent"
                    }`}
            >
                <div className="container mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between max-w-[1200px]">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--cta)] flex items-center justify-center text-white shadow-[0_0_15px_rgba(222,106,19,0.4)]">
                            <Sparkles size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[var(--text-light-primary)]">ZodiAI</span>
                    </div>

                    {/* Desktop Nav Actions */}
                    <div className="hidden lg:flex items-center gap-8">
                        <div className="flex gap-6 text-sm font-medium text-[var(--text-light-secondary)]">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="hover:text-[var(--brand-secondary)] transition-colors duration-200">
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 border-l border-[var(--color-warm-cream)]/10 pl-6">




                            <Link
                                href="/chat"
                                className="btn-primary flex items-center justify-center text-sm py-2 px-5 h-10 shadow-md hover:shadow-lg"
                            >
                                Start Chat
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 lg:hidden">
                        <Link
                            href="/chat"
                            className="btn-primary flex items-center justify-center text-sm py-2 px-4 h-9 shadow-md"
                        >
                            Start Chat
                        </Link>
                        <button
                            className={`p-2 rounded-full transition-colors ${scrolled || isMobileMenuOpen ? "text-[var(--color-warm-cream)] hover:bg-[var(--color-warm-cream)]/10" : "text-[var(--text-light-primary)] hover:bg-[var(--text-light-primary)]/10"}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 z-40 bg-[var(--surface-light)] border-t border-[var(--border-light)] flex flex-col lg:hidden overflow-y-auto"
                    >
                        <div className="p-4 space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block p-4 rounded-xl hover:bg-[var(--surface-light-2)] text-lg font-medium text-[var(--text-light-primary)]"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>



                        <Link
                            href="/chat"
                            className="btn-primary flex items-center justify-center w-full py-3 text-lg shadow-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Start Chatting
                        </Link>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative pt-6 pb-20 md:pt-12 md:pb-32 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] md:w-[50%] md:h-[50%] rounded-full bg-[var(--color-saffron-orange)] blur-[80px] md:blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] rounded-full bg-[var(--color-turmeric-yellow)] blur-[80px] md:blur-[120px] opacity-60" />
                </div>

                <div className="container mx-auto px-4 md:px-12 max-w-[1280px]">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Column: Copy & CTAs */}
                        <div className="text-center lg:text-left order-2 lg:order-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)]/20 text-[#3E1C0A] text-sm font-bold tracking-wide backdrop-blur-sm"
                            >
                                ✨ Vedic Astrology • AI-Powered • Private
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight leading-[1.1] text-[#3E1C0A]"
                            >
                                Your personal AI <br />
                                <span>Panditji. 24/7.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-base md:text-xl mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 text-[#3E1C0A] leading-relaxed font-medium"
                            >
                                Honest, instant Vedic guidance for your daily life. No appointments, just clarity.
                            </motion.p>

                            <motion.ul
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="mb-8 space-y-3 text-left max-w-md mx-auto lg:mx-0"
                            >
                                {[
                                    "Works like chat, not a complicated app",
                                    "Approximate birth time is okay",
                                    "Saved locally in your browser, never shared"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm md:text-base text-[var(--text-light-body)]">
                                        <CheckCircle size={18} className="mt-0.5 md:mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </motion.ul>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 hidden lg:flex"
                            >
                                <Link
                                    href="/chat"
                                    className="btn-primary text-lg px-8 py-4 h-auto shadow-[0_0_20px_rgba(189,62,17,0.3)] hover:shadow-[0_0_30px_rgba(189,62,17,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Start Chat
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="btn-secondary text-lg px-8 py-4 h-auto border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 flex items-center justify-center gap-2"
                                >
                                    See Demo
                                </a>
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-4 text-xs text-[var(--text-light-muted)] hidden lg:block"
                            >
                                For reflection and guidance. Not medical, legal, or financial advice.
                            </motion.p>
                        </div>

                        {/* Right Column: Browser Mockup */}
                        <div className="order-1 lg:order-2 flex justify-center relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative w-full max-w-lg"
                            >
                                {/* Floating Mascot */}
                                <div className="absolute -bottom-6 -left-6 z-20 hidden md:flex items-center gap-3 bg-[var(--color-plum-dark)] border border-[var(--color-warm-cream)]/20 p-2 pr-4 rounded-full shadow-xl animate-bounce-slow">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-saffron-orange)] to-[var(--color-tilak-red)] flex items-center justify-center text-white">
                                        <Sparkles size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--color-warm-cream)]">Talk to Panditji</span>
                                </div>

                                {/* Browser Frame */}
                                <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#1a0f0a] border border-[var(--color-warm-cream)]/10">
                                    {/* Browser Header */}
                                    <div className="bg-[#2A1208] px-4 py-3 flex items-center gap-4 border-b border-[var(--color-warm-cream)]/5">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                        <div className="flex-1 bg-[var(--color-warm-cream)]/5 rounded-md h-6 flex items-center justify-center">
                                            <span className="text-xs text-[var(--color-warm-cream)]/30 font-medium">zodiai.app/chat</span>
                                        </div>
                                    </div>

                                    {/* Browser Content */}
                                    <div className="p-4 md:p-8 bg-gradient-to-b from-[#2A1208] to-[#1a0f0a]">
                                        <div className="text-center mb-4 md:mb-6">
                                            <h3 className="text-lg md:text-xl font-bold text-[var(--color-warm-cream)] mb-1">ZodiAI – Your AI Panditji</h3>
                                            <p className="text-xs md:text-sm text-[var(--color-warm-cream)]/60">Gentle Vedic insights — not deterministic predictions.</p>
                                        </div>

                                        <div className="bg-[var(--surface-light)] rounded-2xl p-3 md:p-6 shadow-lg text-[var(--color-bead-brown)]">
                                            <h4 className="font-bold mb-2 md:mb-4 flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider opacity-70">
                                                <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--brand-secondary)]/10 flex items-center justify-center text-[10px] md:text-xs">1</span>
                                                Enter your birth details
                                            </h4>

                                            <div className="space-y-2 md:space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    value={demoName}
                                                    onChange={(e) => setDemoName(e.target.value)}
                                                    className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg w-full border border-[var(--brand-secondary)]/10 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                />
                                                <div className="flex gap-2 md:gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Birth City"
                                                        value={demoCity}
                                                        onChange={(e) => setDemoCity(e.target.value)}
                                                        className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg flex-1 border border-[var(--brand-secondary)]/10 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                    />
                                                    <div className="flex gap-1 md:gap-1 w-1/3">
                                                        <input
                                                            type="text"
                                                            placeholder="DD"
                                                            value={demoDay}
                                                            onChange={(e) => setDemoDay(e.target.value)}
                                                            className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg w-full border border-[var(--brand-secondary)]/10 px-1 text-center text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="MM"
                                                            value={demoMonth}
                                                            onChange={(e) => setDemoMonth(e.target.value)}
                                                            className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg w-full border border-[var(--brand-secondary)]/10 px-1 text-center text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 md:gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="YYYY"
                                                        value={demoYear}
                                                        onChange={(e) => setDemoYear(e.target.value)}
                                                        className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg flex-1 border border-[var(--brand-secondary)]/10 px-2 md:px-3 text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                    />
                                                    <div className="flex gap-1 md:gap-1 flex-1">
                                                        <input
                                                            type="text"
                                                            placeholder="HH"
                                                            value={demoHour}
                                                            onChange={(e) => setDemoHour(e.target.value)}
                                                            className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg w-full border border-[var(--brand-secondary)]/10 px-1 text-center text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="MM"
                                                            value={demoMinute}
                                                            onChange={(e) => setDemoMinute(e.target.value)}
                                                            className="h-8 md:h-10 bg-[var(--brand-secondary)]/5 rounded-xl md:rounded-lg w-full border border-[var(--brand-secondary)]/10 px-1 text-center text-xs md:text-sm focus:outline-none focus:border-[var(--brand-secondary)]/30 text-[#3E1C0A] placeholder-[var(--color-bead-brown)]/40"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 text-[10px] md:mt-4 flex items-start gap-2 md:text-xs text-[var(--color-bead-brown)] bg-[var(--brand-secondary)]/5 p-2 rounded">
                                                <Lock size={12} className="mt-0.5 flex-shrink-0" />
                                                <p className="leading-tight md:leading-normal">This only personalises replies and stays in your local cache, never shared.</p>
                                            </div>

                                            <button
                                                onClick={handleDemoSubmit}
                                                className="w-full mt-2 md:mt-4 h-8 md:h-auto bg-[var(--color-tilak-red)] text-white font-medium py-1 md:py-3 rounded-full md:rounded-xl shadow-md text-xs md:text-sm hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!demoName || !demoDay || !demoMonth || !demoYear}
                                            >
                                                Send details to ZodiAI
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Strip */}
            <div className="bg-[var(--surface-light)] py-4 md:py-6 border-y border-[var(--border-light)]">
                <div className="container mx-auto px-4 md:px-12 max-w-[1280px]">
                    <div className="flex items-center justify-center gap-6 text-[var(--text-light-primary)]">
                        <p className="font-medium text-center text-sm md:text-xl text-[var(--text-light-primary)]">Private by default. No doom predictions. Clear next steps.</p>
                    </div>
                </div>
            </div>

            {/* Features Snapshot - "What you get" */}
            <section className="py-16 md:py-28 bg-[var(--surface-light)]">
                <div className="container mx-auto px-4 md:px-12 max-w-[1200px]">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-[var(--text-light-primary)]">What you get</h2>
                        <div className="h-1 w-16 md:w-20 bg-[var(--brand-primary)] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="card-cream p-4 md:p-6 flex flex-col items-center text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-3 md:mb-4">
                                <Target size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--text-light-primary)] text-sm md:text-lg mb-1 md:mb-2">Clear guidance</h3>
                            <p className="text-[var(--text-light-secondary)] text-xs md:text-sm">What’s happening, why it’s happening, what to do next.</p>
                        </div>

                        <div className="card-cream p-4 md:p-6 flex flex-col items-center text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-3 md:mb-4">
                                <Clock size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--text-light-primary)] text-sm md:text-lg mb-1 md:mb-2">Timing lens</h3>
                            <p className="text-[var(--text-light-secondary)] text-xs md:text-sm">Good windows vs avoid windows, explained simply.</p>
                        </div>

                        <div className="card-cream p-4 md:p-6 flex flex-col items-center text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-3 md:mb-4">
                                <Repeat size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--text-light-primary)] text-sm md:text-lg mb-1 md:mb-2">Personal patterns</h3>
                            <p className="text-[var(--text-light-secondary)] text-xs md:text-sm">Strengths, blind spots, recurring loops.</p>
                        </div>

                        <div className="card-cream p-4 md:p-6 flex flex-col items-center text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-3 md:mb-4">
                                <Zap size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--text-light-primary)] text-sm md:text-lg mb-1 md:mb-2">2-minute check-in</h3>
                            <p className="text-[var(--text-light-secondary)] text-xs md:text-sm">A fast read when you feel stuck.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Section - "See how ZodiAI feels" */}
            <section className="py-16 md:py-28 relative overflow-hidden bg-[var(--surface-light-2)] border-y border-[var(--border-light)]">
                <div className="container mx-auto px-4 md:px-12 max-w-[1200px]">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="badge-system text-xs md:text-sm mb-3 md:mb-4 inline-block">Live Preview</span>
                        <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 text-[var(--text-light-primary)]">See how ZodiAI feels</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Left: Chat Demo Widget */}
                        <div className="bg-[var(--color-warm-cream)] rounded-2xl p-1 overflow-hidden shadow-2xl relative">
                            <div className="bg-[#fffcf7] rounded-xl overflow-hidden h-full flex flex-col">
                                {/* Demo Header */}
                                <div className="p-4 border-b border-[var(--color-bead-brown)]/10 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs font-bold text-[var(--color-bead-brown)] uppercase tracking-wider">Live Demo</span>
                                    </div>
                                    <span className="text-[10px] text-[var(--color-bead-brown)]/50 bg-[var(--color-bead-brown)]/5 px-2 py-1 rounded-full">
                                        Gentle insights, not deterministic predictions.
                                    </span>
                                </div>

                                {/* Demo Tabs */}
                                <div className="flex p-2 bg-[var(--color-bead-brown)]/5 gap-1">
                                    {(['daily', 'career', 'relationships'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveDemoTab(tab)}
                                            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${activeDemoTab === tab
                                                ? "bg-white text-[var(--color-tilak-red)] shadow-sm"
                                                : "text-[var(--color-bead-brown)] hover:bg-white/50"
                                                }`}
                                        >
                                            {tab === 'daily' && 'Daily'}
                                            {tab === 'career' && 'Career'}
                                            {tab === 'relationships' && 'Relationships'}
                                        </button>
                                    ))}
                                </div>

                                {/* Demo Chat Area */}
                                <div className="p-6 md:p-8 flex-1 bg-[#fffcf7] space-y-6 min-h-[400px]">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeDemoTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            {/* User Question */}
                                            <div className="flex justify-end">
                                                <div className="bg-[var(--color-bead-brown)] text-[var(--color-warm-cream)] px-5 py-3 rounded-2xl rounded-br-none max-w-[85%] shadow-md">
                                                    <p className="text-sm">{demoContent[activeDemoTab].question}</p>
                                                </div>
                                            </div>

                                            {/* AI Response */}
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-saffron-orange)] to-[var(--color-tilak-red)] flex items-center justify-center text-white flex-shrink-0 mt-1">
                                                    <Sparkles size={14} />
                                                </div>
                                                <div className="space-y-4 max-w-[90%]">
                                                    {/* Summary */}
                                                    <div className="bg-white border border-[var(--color-bead-brown)]/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                                        <p className="text-[var(--color-bead-brown)] text-sm leading-relaxed">
                                                            {demoContent[activeDemoTab].answer}
                                                        </p>
                                                    </div>

                                                    {/* Why */}
                                                    <div className="flex gap-3 items-start">
                                                        <div className="mt-1 w-1 bg-[var(--color-saffron-orange)]/30 h-12 rounded-full"></div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[var(--color-bead-brown)] uppercase tracking-wide mb-1">Why?</p>
                                                            <p className="text-[var(--color-bead-brown)] text-sm">
                                                                {demoContent[activeDemoTab].why}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Next Step */}
                                                    <div className="flex gap-3 items-center bg-[var(--color-skin-beige)]/10 p-3 rounded-xl border border-[var(--color-skin-beige)]/20">
                                                        <div className="w-6 h-6 rounded-full bg-[var(--color-saffron-orange)]/20 flex items-center justify-center text-[var(--color-saffron-orange)] flex-shrink-0">
                                                            <ArrowRight size={14} />
                                                        </div>
                                                        <p className="text-sm text-[var(--color-bead-brown)] font-medium">
                                                            {demoContent[activeDemoTab].nextStep}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Right: Benefits List */}
                        <div className="flex flex-col justify-center">
                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-light-primary)] mb-6 md:mb-8">What you get in one answer</h3>
                            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                                {[
                                    { title: "Quick summary in 2 lines", desc: "No need to read pages of text. Get the gist immediately.", icon: BookOpen },
                                    { title: "Why this is showing up now", desc: "Understanding the planetary influence behind the feeling.", icon: Target },
                                    { title: "What to do next", desc: "Simple, practical actions to align with the energy.", icon: CheckCircle },
                                    { title: "Timing lens", desc: "Know if this is a good window to act or to pause.", icon: Clock },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 md:gap-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--surface-light)] border border-[var(--border-light)] flex items-center justify-center text-[var(--brand-primary)] flex-shrink-0">
                                            <item.icon size={16} className="md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[var(--text-light-primary)] font-bold text-base md:text-lg">{item.title}</h4>
                                            <p className="text-[var(--text-light-secondary)] text-xs md:text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <p className="text-[var(--text-light-muted)] text-sm mb-4 uppercase tracking-wider font-medium">Try these questions</p>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        "What should I focus on this week?",
                                        "Is this a good time to switch jobs?",
                                        "Why does my mood swing lately?",
                                        "When is a good day to start something new?"
                                    ].map((q, i) => (
                                        <span key={i} className="px-4 py-2 rounded-full bg-[var(--surface-light-2)] border border-[var(--border-light)] text-[var(--text-light-primary)] text-sm font-medium cursor-default hover:bg-[var(--brand-primary)] hover:text-white transition-colors duration-200">
                                            {q}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 md:py-32 bg-[var(--surface-light)] relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-12 max-w-[1200px]">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6 text-[var(--text-light-primary)]">How it works</h2>
                        <p className="text-sm md:text-lg text-[var(--text-light-body)] max-w-2xl mx-auto">
                            Simple, private, and designed for your peace of mind.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-[2.5rem] left-0 w-full h-[2px] bg-[var(--border-light)] z-0"></div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            {[
                                {
                                    title: "Enter birth details",
                                    desc: "Birth date, city, time (approx works too). Saved locally, never shared.",
                                    icon: User
                                },
                                {
                                    title: "Ask anything",
                                    desc: "Type your question or speak to ZodiAI directly.",
                                    icon: MessageCircle,
                                    extra: (
                                        <div className="mt-4 flex items-center justify-center gap-3 bg-[var(--surface-light-2)] border border-[var(--border-light)] py-2 px-4 rounded-full shadow-lg">
                                            <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] animate-pulse">
                                                <Mic size={16} />
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--text-light-secondary)]">Tap to speak</span>
                                        </div>
                                    )
                                },
                                {
                                    title: "Get a calm answer",
                                    desc: "Summary → Reasoning → Next step. No doom scrolling.",
                                    icon: Sparkles
                                },
                                {
                                    title: "Save and revisit",
                                    desc: "Previous chats stay in your browser for quick access.",
                                    icon: RotateCcw
                                },
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center text-center group">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--surface-light)] border-4 border-[var(--brand-primary)] shadow-[0_0_0_2px_rgba(222,106,19,0.1)] flex items-center justify-center text-[var(--brand-primary)] mb-4 md:mb-6 z-10 relative group-hover:scale-110 transition-transform duration-300">
                                        <step.icon size={24} className="md:w-8 md:h-8" />
                                        <div className="absolute top-0 right-0 bg-[var(--brand-secondary)] text-[var(--text-light-primary)] w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold border-2 border-[var(--surface-light)]">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-[var(--text-light-primary)] mb-2 md:mb-3">{step.title}</h3>
                                    <p className="text-[var(--text-light-secondary)] text-xs md:text-sm leading-relaxed max-w-[250px] mx-auto">
                                        {step.desc}
                                    </p>
                                    {step.extra}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases            {/* Features Snapshot */}
            <section id="features" className="py-16 md:py-32 bg-[var(--bg-landing)]">
                <div className="container mx-auto px-4 md:px-12 max-w-[1200px]">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="text-[var(--brand-secondary)] font-bold tracking-widest uppercase text-[10px] md:text-sm mb-2 block">Features</span>
                        <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6 text-[var(--text-light-primary)]">More than just a horoscope.</h2>
                        <p className="text-sm md:text-lg text-[var(--text-light-body)] max-w-2xl mx-auto">
                            ZodiAI combines ancient Vedic wisdom with modern AI to give you specific, actionable advice.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { title: "Before a big decision", question: "Should I take this role?", icon: HelpCircle },
                            { title: "Timing feels off", question: "Why is everything delayed lately?", icon: Clock },
                            { title: "Daily direction", question: "What should I focus on today?", icon: Sun },
                            { title: "Relationship confusion", question: "Why do we clash on the same thing?", icon: Heart },
                            { title: "Money noise", question: "Should I be cautious this month?", icon: Lock },
                            { title: "Calm reset", question: "Give me a simple grounding read.", icon: Moon },
                        ].map((useCase, i) => (
                            <div key={i} className="card-cream p-5 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[var(--border-light)] flex flex-col h-full bg-[var(--surface-light)] text-[var(--text-light-primary)]">
                                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                    <div className="p-1.5 md:p-2 rounded-lg bg-[var(--surface-light-2)]/50 text-[var(--text-light-secondary)]">
                                        <useCase.icon size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <h3 className="font-bold text-[var(--text-light-primary)] text-sm md:text-lg">{useCase.title}</h3>
                                </div>
                                <div className="mt-auto bg-[var(--surface-light-2)]/30 p-3 md:p-4 rounded-xl border border-[var(--border-light)]">
                                    <p className="text-[var(--text-light-secondary)] italic text-xs md:text-base font-medium">"{useCase.question}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Testimonials */}
            <section id="testimonials" className="py-16 md:py-32 scroll-mt-20">
                <div className="container mx-auto px-4 md:px-12 max-w-[1200px]">
                    <h2 className="text-2xl md:text-5xl font-bold mb-10 md:mb-20 text-center text-[var(--text-light-primary)]">Voices from our Community</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <TestimonialCard
                            quote="I was skeptical at first, but the depth of insight regarding my moon sign was incredible. It felt like talking to a wise elder."
                            author="Aarav K."
                            role="Software Engineer"
                        />
                        <TestimonialCard
                            quote="What I love most is the tone. It doesn't scare you with doom and gloom. It empowers you to make better choices."
                            author="Priya S."
                            role="Yoga Instructor"
                        />
                        <TestimonialCard
                            quote="Finally, an astrology app that understands the nuance of Vedic charts without being overly complicated."
                            author="Rahul M."
                            role="Student"
                        />
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section id="privacy-section" className="py-12 md:py-20 bg-[var(--surface-light-2)]">
                <div className="container mx-auto px-4 md:px-12 max-w-[1200px]">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 rounded-full bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)]/20 text-[#3E1C0A] text-xs md:text-sm font-medium mb-4 md:mb-6 backdrop-blur-sm">
                            <Sparkles size={12} className="text-[var(--brand-secondary)] md:w-[14px] md:h-[14px]" />
                            <span>Vedic Astrology • AI-Powered • Private</span>
                        </div>
                        <h1 className="text-3xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-tight text-[#3E1C0A]">
                            Your personal AI astrologer. <span className="text-[var(--brand-secondary)]">24/7.</span>
                        </h1>
                        <p className="text-base md:text-2xl text-[#3E1C0A] mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                            Honest, instant Vedic guidance for your daily life. No appointments, just clarity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
                        <div className="bg-[var(--color-plum-dark)] border border-[var(--color-warm-cream)]/10 p-6 md:p-8 rounded-2xl text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-warm-cream)]/5 flex items-center justify-center text-[var(--color-warm-cream)] mx-auto mb-3 md:mb-4">
                                <Save size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--color-warm-cream)] mb-1.5 md:mb-2 text-sm md:text-base">Local storage</h3>
                            <p className="text-[var(--color-warm-cream)]/60 text-xs md:text-sm leading-relaxed">Saved only in your browser (cache), never shared with anyone else.</p>
                        </div>

                        <div className="bg-[var(--color-plum-dark)] border border-[var(--color-warm-cream)]/10 p-6 md:p-8 rounded-2xl text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-warm-cream)]/5 flex items-center justify-center text-[var(--color-warm-cream)] mx-auto mb-3 md:mb-4">
                                <RotateCcw size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--color-warm-cream)] mb-1.5 md:mb-2 text-sm md:text-base">You control it</h3>
                            <p className="text-[var(--color-warm-cream)]/60 text-xs md:text-sm leading-relaxed">Clear your chat history anytime with a single click. It's your data.</p>
                        </div>

                        <div className="bg-[var(--color-plum-dark)] border border-[var(--color-warm-cream)]/10 p-6 md:p-8 rounded-2xl text-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-warm-cream)]/5 flex items-center justify-center text-[var(--color-warm-cream)] mx-auto mb-3 md:mb-4">
                                <Lock size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-[var(--color-warm-cream)] mb-1.5 md:mb-2 text-sm md:text-base">Boundaries</h3>
                            <p className="text-[var(--color-warm-cream)]/60 text-xs md:text-sm leading-relaxed">For reflection and guidance. Not medical, legal, or financial advice.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 md:py-28 bg-[var(--bg-landing)]">
                <div className="container mx-auto px-4 md:px-12 max-w-[1000px]">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--text-light-primary)]">Start free</h2>
                        <p className="text-lg text-[var(--text-light-body)] max-w-2xl mx-auto">
                            Experience the clarity of Vedic astrology without barriers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Free Plan */}
                        <div className="card-cream bg-[var(--surface-light)] p-8 rounded-3xl shadow-xl border-2 border-[var(--brand-primary)]/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-[var(--brand-primary)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl lowercase">
                                Current
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-light-primary)] mb-2">Free</h3>
                            <p className="text-[var(--text-light-secondary)] text-sm mb-6">Perfect for daily guidance.</p>

                            <div className="text-4xl font-bold text-[var(--text-light-primary)] mb-8">
                                ₹0 <span className="text-lg font-normal text-[var(--text-light-secondary)]">/ forever</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Unlimited chat with ZodiAI",
                                    "Daily predictions (Love, Career, etc.)",
                                    "Basic birth chart analysis",
                                    "Local history storage"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[var(--text-light-primary)] text-sm">
                                        <CheckCircle size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/chat"
                                className="w-full btn-primary flex items-center justify-center py-3 text-lg shadow-md hover:shadow-lg"
                            >
                                Start Free
                            </Link>
                        </div>

                        {/* Plus Plan (Waitlist) */}
                        <div className="bg-[#fffbf5] p-6 md:p-8 rounded-3xl border border-[var(--color-bead-brown)]/10 relative opacity-80 hover:opacity-100 transition-opacity">
                            <div className="inline-block bg-[var(--color-plum-dark)] text-[var(--color-warm-cream)] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-3 md:mb-4">
                                Coming Soon
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-1 md:mb-2 text-[var(--text-light-primary)]">Plus</h3>
                            <p className="text-[var(--text-secondary)] text-xs md:text-sm mb-4 md:mb-6 text-[var(--text-light-secondary)]">For deeper self-discovery.</p>

                            <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6 md:mb-8 filter blur-[2px] select-none text-[var(--text-light-primary)]">
                                ₹299 <span className="text-base md:text-lg font-normal">/ month</span>
                            </div>

                            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                {[
                                    "Everything in Free",
                                    "Deeper planetary dive & transits",
                                    "Relationship compatibility reports",
                                    "Saved summaries & PDF exports",
                                    "Priority access during high traffic"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[var(--text-secondary)] text-sm text-[var(--text-light-body)]">
                                        <CheckCircle size={16} className="text-[var(--text-secondary)]/30 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-2 md:py-3 rounded-xl border-2 border-[var(--text-secondary)]/10 text-[var(--text-secondary)] font-bold hover:bg-[var(--text-secondary)]/5 transition-colors cursor-not-allowed text-xs md:text-sm text-[var(--text-light-secondary)]">
                                Join Waitlist
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Band */}
            <div className="bg-[var(--surface-light-2)] border-y-[4px] md:border-y-[6px] border-[var(--color-saffron-orange)] py-12 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-light-primary)] mb-3 md:mb-4">
                        Ask one question. <br className="md:hidden" /> You will feel the difference.
                    </h2>
                    <p className="text-base md:text-xl text-[var(--text-light-body)] mb-6 md:mb-10">
                        Gentle Vedic insights, explained simply.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                        <Link
                            href="/chat"
                            className="btn-primary text-base md:text-xl px-8 md:px-10 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} className="md:w-[22px] md:h-[22px]" />
                            Start Chat
                        </Link>
                        <a
                            href="#how-it-works"
                            className="text-[var(--text-light-primary)] text-sm md:text-base font-bold hover:bg-[var(--text-light-primary)]/5 px-6 md:px-8 py-3 md:py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            See Demo
                            <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                        </a>
                    </div>
                    <p className="mt-6 md:mt-8 text-[10px] md:text-xs text-[var(--text-light-muted)]">
                        No credit card required. Private by default.
                    </p>
                </div>
            </div>

            {/* FAQ Section */}
            <section id="faq" className="py-16 md:py-32 bg-[var(--bg-landing)] relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-12 max-w-[800px]">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6 text-[var(--text-light-primary)]">Frequently Asked Questions</h2>
                        <p className="text-sm md:text-lg text-[var(--text-light-body)] max-w-2xl mx-auto">
                            Honest answers about how ZodiAI works.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <FAQItem
                            question="Is ZodiAI Vedic astrology or Western?"
                            answer="ZodiAI is purely based on Vedic Astrology (Sidereal zodiac). It uses the Lahiri Ayanamsa for calculations, focusing on Moon signs, Nakshatras, and planetary dashas for precise timing."
                        />
                        <FAQItem
                            question="Do I need exact birth time?"
                            answer="An exact time is best for the 'Rising Sign' accuracy. However, even an approximate time (e.g., 'morning') works well for Moon sign predictions, which is the core of Vedic daily guidance."
                        />
                        <FAQItem
                            question="What if I do not know my birth time?"
                            answer="You can still use ZodiAI! We will focus on your Moon sign based on your birth date, which changes only once every 2.5 days, making it accurate enough for general emotional and mental guidance."
                        />
                        <FAQItem
                            question="Is this a replacement for a real astrologer?"
                            answer="No. ZodiAI is a daily companion for reflection and quick clarity. For major life decisions, complex medical issues, or detailed marriage matching, we always recommend consulting a human expert."
                        />
                        <FAQItem
                            question="Does ZodiAI store my data?"
                            answer="We do not store your data anywhere. Your birth details and chat history remain strictly on your local device (browser cache). While chats are processed by AI to generate insights, they are never saved on our servers or used to train public models."
                        />
                        <FAQItem
                            question="Can I delete my chats?"
                            answer="Yes, absolutely. You have a 'Clear Chat' button that instantly wipes your conversation history from your local device. You are in full control."
                        />
                        <FAQItem
                            question="Can I use it in Hindi?"
                            answer="Yes! ZodiAI is trained to understand and reply in both English and Hindi (and Hinglish). Just ask, 'Aaj ka din kaisa rahega?' and it will respond accordingly."
                        />
                        <FAQItem
                            question="What topics can I ask about?"
                            answer="You can ask about Career (job switches, timing), Relationships (compatibility, conflict), Finances (investment timing), and Health (energy levels). It avoids predicting death or scary fatality."
                        />
                        <FAQItem
                            question="Does it give remedies?"
                            answer="It suggests 'Satvic' lifestyle remedies—like specific colors, mantras, fasting days, or acts of charity. It does not prescribe expensive gemstones or fear-based rituals."
                        />
                        <FAQItem
                            question="Is it deterministic predictions?"
                            answer="Vedic astrology indicates 'Karma' patterns, but your 'Free Will' is powerful. ZodiAI shows you the weather forecast; you decide how to dress and walk through it."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[var(--surface-dark)] border-t border-[var(--border-dark)] text-[var(--text-dark-primary)] py-16 md:py-24 pb-32 md:pb-24">
                <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16 text-center md:text-left">
                        {/* Left: Logo & Tagline */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Sparkles size={24} className="text-[var(--brand-primary)]" />
                                <span className="text-2xl font-bold">ZodiAI</span>
                            </div>
                            <p className="text-[var(--text-dark-muted)] max-w-xs mx-auto md:mx-0 leading-relaxed text-sm">
                                Gentle Vedic insights for the modern soul. Navigating the cosmos within.
                            </p>
                        </div>

                        {/* Center: Links */}
                        <div>
                            <ul className="flex flex-wrap justify-center gap-6 text-[var(--text-dark-secondary)] font-medium text-sm">
                                <li><Link href="/terms" className="hover:text-[var(--brand-secondary)] transition-colors">Terms of Use</Link></li>

                                <li><a href="mailto:support@zodiai.app" className="hover:text-[var(--brand-secondary)] transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        {/* Right: Made with care */}
                        <div>
                            <p className="flex items-center gap-2 text-[var(--text-dark-muted)] text-sm">
                                Made with <Heart size={14} className="fill-[var(--cta)] text-[var(--cta)]" /> for clarity
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--border-dark)] text-center text-[var(--text-dark-muted)] text-xs md:text-xs">
                        <p className="max-w-3xl mx-auto leading-relaxed">
                            Disclaimer: ZodiAI is designed for reflection and guidance purposes only. The insights provided are based on astrological principles and AI analysis. This service does not constitute medical, legal, financial, or psychological advice. Please consult qualified professionals for such matters.
                        </p>
                        <p className="mt-4">© {new Date().getFullYear()} Personal-ZodiAI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div >
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="card-cream p-6 md:p-10 flex flex-col h-full hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 w-14 h-14 rounded-full bg-[var(--surface-light-2)]/20 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-[var(--text-light-primary)]">{title}</h3>
            <p className="text-[var(--text-light-secondary)] leading-relaxed text-sm md:text-base">{description}</p>
        </div>
    );
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
    return (
        <div className="card-cream bg-[var(--surface-light)] p-6 md:p-10 flex flex-col h-full">
            <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} className="fill-[var(--brand-secondary)] text-[var(--brand-secondary)]" />
                ))}
            </div>
            <p className="text-[var(--text-light-primary)] mb-8 italic text-base md:text-lg leading-relaxed flex-grow">"{quote}"</p>
            <div className="pt-6 border-t border-[var(--text-light-secondary)]/10">
                <p className="font-bold text-[var(--text-light-primary)]">{author}</p>
                <p className="text-sm text-[var(--text-light-secondary)]">{role}</p>
            </div>
        </div>
    );
}
function Wallet({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
    )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-[var(--border-light)] rounded-xl overflow-hidden bg-[var(--surface-light)] transition-all duration-300 hover:border-[var(--brand-primary)]/20 hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
                <span className="font-bold text-[var(--text-light-primary)] text-base md:text-lg pr-4">{question}</span>
                <ChevronDown
                    size={20}
                    className={`text-[var(--brand-primary)] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-5 pb-5 text-[var(--text-light-body)] text-sm leading-relaxed border-t border-[var(--border-light)] pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

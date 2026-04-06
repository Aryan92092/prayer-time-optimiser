import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ChevronRight, ChevronLeft, Brain, CheckCircle2,
    Download, Loader2, Sparkles, Zap, Bot, RefreshCw, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveMoodCheckin, analyzeMood, getAllCheckins } from '../services/moodService';
import { getAIRecommendation } from '../services/aiService';
import { generateMoodReport } from '../services/generateMoodReport';

/* ─── Questions ──────────────────────────────────────────────────────────── */
const QUESTIONS = [
    {
        id: 'mood',
        question: 'How is your overall mood right now?',
        subtitle: 'Be honest — this is a safe space.',
        labels: ['Very Low', 'Low', 'Okay', 'Good', 'Excellent'],
        emojis: ['😔', '😕', '😐', '🙂', '😄'],
    },
    {
        id: 'sleep',
        question: 'How well did you sleep last night?',
        subtitle: 'Rest is the foundation of a clear mind.',
        labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Very Well'],
        emojis: ['😴', '😫', '😐', '🛌', '✨'],
    },
    {
        id: 'spiritual',
        question: 'How connected do you feel to your spiritual practice?',
        subtitle: 'Your connection to something greater.',
        labels: ['Disconnected', 'Distant', 'Neutral', 'Connected', 'Deeply Connected'],
        emojis: ['❌', '😶', '🕯️', '🙏', '💫'],
    },
    {
        id: 'stress',
        question: 'How calm and peaceful do you feel?',
        subtitle: '5 = Completely at peace, 1 = Overwhelmed.',
        labels: ['Overwhelmed', 'Stressed', 'Some Tension', 'Mostly Calm', 'At Peace'],
        emojis: ['🌪️', '😤', '😬', '😌', '🌸'],
    },
    {
        id: 'hope',
        question: 'How hopeful do you feel about the coming days?',
        subtitle: 'Hope is the seed of all healing.',
        labels: ['No Hope', 'Little Hope', 'Unsure', 'Hopeful', 'Very Hopeful'],
        emojis: ['🌑', '🌘', '🌗', '🌕', '⭐'],
    },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const scoreTheme = (val) => {
    const themes = [null,
        { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-400', text: 'text-red-500' },
        { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-400', text: 'text-orange-500' },
        { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-400', text: 'text-yellow-500' },
        { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-400', text: 'text-emerald-500' },
        { bg: 'bg-primary/10', border: 'border-primary', text: 'text-primary' },
    ];
    return themes[val] || themes[3];
};

const wellnessGradient = {
    emerald: 'from-emerald-400 to-teal-500',
    primary: 'from-primary to-purple-divine',
    yellow: 'from-yellow-400 to-orange-400',
    red: 'from-rose-400 to-red-500',
};

const categoryColor = {
    Productivity:         'bg-violet-500/20 text-violet-200',
    Focus:                'bg-blue-500/20 text-blue-200',
    'Emotional Healing':  'bg-rose-500/20 text-rose-200',
    'Stress Relief':      'bg-teal-500/20 text-teal-200',
    Recovery:             'bg-amber-500/20 text-amber-200',
    Growth:               'bg-emerald-500/20 text-emerald-200',
    Mindfulness:          'bg-purple-500/20 text-purple-200',
    Wellness:             'bg-sky-500/20 text-sky-200',
    'Physical Wellness':  'bg-green-500/20 text-green-200',
    'Emotional Growth':   'bg-pink-500/20 text-pink-200',
    Connection:           'bg-cyan-500/20 text-cyan-200',
    'Creative Healing':   'bg-orange-500/20 text-orange-200',
    'Mental Rest':        'bg-indigo-500/20 text-indigo-200',
    'Self Care':          'bg-fuchsia-500/20 text-fuchsia-200',
};

/* ─── Page Component ──────────────────────────────────────────────────────── */
const MoodCheckInPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(0);  // 0=intro, 1-5=questions, 6=results
    const [answers, setAnswers] = useState({ mood: 3, sleep: 3, spiritual: 3, stress: 3, hope: 3 });
    const [submitting, setSubmitting] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [aiRec, setAiRec] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const TOTAL = QUESTIONS.length;
    const isIntro = step === 0;
    const isResults = step === TOTAL + 1;
    const progress = isIntro ? 0 : isResults ? 100 : Math.round((step / TOTAL) * 100);
    const currentQ = QUESTIONS[step - 1];

    /* ── Submit handler: show results instantly, AI loads in bg ── */
    const handleSubmit = async () => {
        setSubmitting(true);

        // 1. Local analysis is synchronous — show results immediately
        const localResult = analyzeMood(answers);
        setAnalysis(localResult);
        setStep(TOTAL + 1);
        setSubmitting(false);

        // 2. Save to DB + fetch AI in the background
        setAiLoading(true);
        try {
            const [, aiResult] = await Promise.all([
                saveMoodCheckin(user.id, answers).catch(e => console.warn('Save error:', e)),
                getAIRecommendation(answers),
            ]);
            setAiRec(aiResult);
        } catch (err) {
            console.error('Background error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleNext = () => {
        if (step < TOTAL) { setStep(s => s + 1); return; }
        handleSubmit();
    };

    const handleReset = () => {
        setStep(0);
        setAnswers({ mood: 3, sleep: 3, spiritual: 3, stress: 3, hope: 3 });
        setAnalysis(null);
        setAiRec(null);
        setAiLoading(false);
    };

    const handleDownload = async () => {
        setDownloadingPdf(true);
        try {
            const checkins = await getAllCheckins(user.id);
            generateMoodReport(user, checkins);
        } catch (err) {
            console.error('PDF error:', err);
        } finally {
            setDownloadingPdf(false);
        }
    };

    const gradient = analysis ? (wellnessGradient[analysis.colorClass] || wellnessGradient.primary) : wellnessGradient.primary;
    const catColor = aiRec ? (categoryColor[aiRec.category] || categoryColor.Wellness) : categoryColor.Mindfulness;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-32">
            <div className="max-w-3xl mx-auto px-4">

                {/* ── Back button ── */}
                {!isResults && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs mb-8"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                )}

                <AnimatePresence mode="wait">

                    {/* ═══════════════════ INTRO ═══════════════════ */}
                    {isIntro && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="glass-card p-12 md:p-16 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                                className="w-24 h-24 bg-gradient-to-tr from-primary to-saffron rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl"
                            >
                                <Brain size={44} className="text-white" />
                            </motion.div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                                Daily Mood Check-In
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-2 leading-relaxed max-w-lg mx-auto">
                                Answer 5 honest questions and our AI Mood Engine will generate a deeply personalised recommendation for your day.
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-10 font-bold uppercase tracking-widest">
                                5 questions · ~1 minute · Powered by AI
                            </p>

                            <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 mb-10 text-left space-y-3 max-w-md mx-auto">
                                {[
                                    '🧠 Analyse your current mental & spiritual state',
                                    '🤖 Get a personalised AI recommendation',
                                    '📄 Download your full wellness PDF report',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setStep(1)}
                                className="bg-gradient-to-r from-primary to-purple-divine text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 flex items-center gap-3 mx-auto"
                            >
                                Begin Check-In <ChevronRight size={24} />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ═══════════════════ QUESTIONS ═══════════════════ */}
                    {!isIntro && !isResults && currentQ && (
                        <motion.div
                            key={`q-${step}`}
                            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                        >
                            {/* Progress bar header */}
                            <div className="glass-card p-6 md:p-8 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">
                                        Question {step} of {TOTAL}
                                    </p>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        {progress}% complete
                                    </p>
                                </div>
                                <div className="flex gap-1.5">
                                    {QUESTIONS.map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className={`h-2 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            animate={{ scaleX: i < step ? 1 : 0.98 }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Question card */}
                            <div className="glass-card p-8 md:p-12">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                                    {currentQ.question}
                                </h2>
                                <p className="text-slate-400 dark:text-slate-500 font-medium mb-10 text-base">
                                    {currentQ.subtitle}
                                </p>

                                {/* Rating buttons — large and clear */}
                                <div className="grid grid-cols-5 gap-3 mb-10">
                                    {[1, 2, 3, 4, 5].map((val) => {
                                        const selected = answers[currentQ.id] === val;
                                        const t = scoreTheme(val);
                                        return (
                                            <motion.button
                                                key={val}
                                                whileHover={{ y: -6, scale: 1.06 }}
                                                whileTap={{ scale: 0.93 }}
                                                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: val }))}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-200 ${selected ? `${t.bg} ${t.border} shadow-xl scale-105` : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                            >
                                                <span className="text-3xl">{currentQ.emojis[val - 1]}</span>
                                                <span className={`text-[10px] font-black text-center leading-tight ${selected ? t.text : 'text-slate-400'}`}>
                                                    {currentQ.labels[val - 1]}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-4">
                                    {step > 1 && (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setStep(s => s - 1)}
                                            className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black hover:border-primary transition-all"
                                        >
                                            <ChevronLeft size={20} /> Back
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleNext}
                                        disabled={submitting}
                                        className="flex-1 bg-gradient-to-r from-primary to-purple-divine text-white py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {submitting
                                            ? <><Loader2 size={20} className="animate-spin" /> Preparing results…</>
                                            : step === TOTAL
                                                ? <><Sparkles size={18} /> See My AI Recommendation</>
                                                : <>Next Question <ChevronRight size={20} /></>}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════ RESULTS ═══════════════════ */}
                    {isResults && analysis && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                        >
                            {/* Page title */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">AI Analysis Complete</p>
                                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Your Mood Report
                                    </h1>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                                >
                                    <RefreshCw size={14} /> Redo
                                </motion.button>
                            </div>

                            {/* ══ HERO: AI RECOMMENDATION ══ */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#3b1ca8] to-purple-divine p-8 md:p-10 mb-6 text-white shadow-2xl"
                            >
                                {/* Glow orbs */}
                                <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-saffron/15 rounded-full blur-2xl pointer-events-none" />

                                {/* AI header */}
                                <div className="flex items-center justify-between mb-7 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                                            <Bot size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">AI Mood Engine</p>
                                            <p className="text-base font-black text-white leading-tight">Your Personalised Recommendation</p>
                                        </div>
                                    </div>
                                    {aiRec && !aiLoading && (
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${catColor}`}>
                                            {aiRec.category}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {aiLoading ? (
                                        /* Skeleton while AI loads */
                                        <div className="space-y-4 animate-pulse">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/20 rounded-full shrink-0" />
                                                <div className="h-8 bg-white/20 rounded-xl flex-1" />
                                            </div>
                                            <div className="h-5 bg-white/15 rounded-lg w-full" />
                                            <div className="h-5 bg-white/15 rounded-lg w-5/6" />
                                            <div className="h-5 bg-white/10 rounded-lg w-4/5" />
                                            <div className="h-14 bg-white/15 rounded-2xl w-full mt-3" />
                                            <p className="text-white/40 text-xs text-center font-black tracking-widest uppercase pt-1">
                                                AI is analysing your mood data…
                                            </p>
                                        </div>
                                    ) : aiRec ? (
                                        /* Real AI recommendation */
                                        <>
                                            <div className="flex items-center gap-4 mb-5">
                                                <span className="text-5xl drop-shadow-xl">{aiRec.emoji}</span>
                                                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                                                    {aiRec.recommendation}
                                                </h2>
                                            </div>
                                            <p className="text-white/85 font-medium leading-relaxed text-base mb-6">
                                                {aiRec.message}
                                            </p>
                                            <div className="flex items-start gap-3 bg-white/12 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/15">
                                                <Zap size={16} className="text-saffron mt-0.5 shrink-0" />
                                                <p className="text-sm font-black text-white/90 leading-relaxed">
                                                    {aiRec.action}
                                                </p>
                                            </div>
                                            {aiRec.fallback && (
                                                <p className="text-[10px] text-white/30 mt-4 text-right uppercase tracking-widest font-bold">
                                                    ✦ AI engine offline · Default guidance shown
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-white/60 text-base font-medium text-center py-6">
                                            🙏 Take a moment of stillness and let your breath guide you.
                                        </p>
                                    )}
                                </div>
                            </motion.div>

                            {/* ══ WELLNESS STATE BAND ══ */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`bg-gradient-to-r ${gradient} rounded-3xl px-8 py-5 mb-6 flex items-center gap-5 text-white shadow-xl`}
                            >
                                <span className="text-4xl">{analysis.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Your Wellness State</p>
                                    <p className="text-2xl font-black">{analysis.state}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black">{analysis.happiness}%</p>
                                    <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Happiness Score</p>
                                </div>
                            </motion.div>

                            {/* Progress bar */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card px-8 py-5 mb-6">
                                <div className="flex justify-between mb-3">
                                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Overall Wellness</p>
                                    <p className="text-xs font-black text-primary">{analysis.happiness}%</p>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysis.happiness}%` }}
                                        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
                                    />
                                </div>
                            </motion.div>

                            {/* Message */}
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="text-slate-600 dark:text-slate-400 font-medium text-base leading-relaxed mb-8 px-1">
                                {analysis.message}
                            </motion.p>

                            {/* Two-column: Do Today + Avoid Today */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                            >
                                {/* Do Today */}
                                <div className="glass-card p-6">
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">✅ Do Today</p>
                                    <div className="space-y-2.5">
                                        {analysis.doToday.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/15 rounded-2xl px-4 py-3">
                                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 size={11} className="text-white" />
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Avoid Today */}
                                <div className="glass-card p-6">
                                    <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-4">⚠️ Avoid Today</p>
                                    <div className="space-y-2.5">
                                        {analysis.avoidToday.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-red-50 dark:bg-red-900/15 rounded-2xl px-4 py-3">
                                                <span className="text-red-400 mt-0.5 shrink-0 font-black">✕</span>
                                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* ══ ACTION BUTTONS ══ */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/dashboard')}
                                    className={`flex-1 bg-gradient-to-r ${gradient} text-white py-5 rounded-2xl font-black text-lg shadow-xl`}
                                >
                                    View My Practice Plan →
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleDownload}
                                    disabled={downloadingPdf}
                                    className="flex-1 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:border-primary hover:text-primary transition-all text-base"
                                >
                                    {downloadingPdf
                                        ? <><Loader2 size={18} className="animate-spin" /> Generating PDF…</>
                                        : <><FileText size={18} /> Download Full Report</>}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default MoodCheckInPage;

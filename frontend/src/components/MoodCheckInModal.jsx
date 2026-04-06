import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Brain, CheckCircle2, Download, Loader2, Sparkles, Zap, Bot } from 'lucide-react';
import { saveMoodCheckin, analyzeMood, getAllCheckins } from '../services/moodService';
import { getAIRecommendation } from '../services/aiService';
import { generateMoodReport } from '../services/generateMoodReport';

const QUESTIONS = [
    {
        id: 'mood', question: 'How is your overall mood right now?', subtitle: 'Be honest — this is a safe space.',
        labels: ['Very Low', 'Low', 'Okay', 'Good', 'Excellent'], emojis: ['😔', '😕', '😐', '🙂', '😄'],
    },
    {
        id: 'sleep', question: 'How well did you sleep last night?', subtitle: 'Rest is the foundation of a clear mind.',
        labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Very Well'], emojis: ['😴', '😫', '😐', '🛌', '✨'],
    },
    {
        id: 'spiritual', question: 'How connected do you feel to your spiritual practice?', subtitle: 'Your connection to something greater.',
        labels: ['Disconnected', 'Distant', 'Neutral', 'Connected', 'Deeply Connected'], emojis: ['❌', '😶', '🕯️', '🙏', '💫'],
    },
    {
        id: 'stress', question: 'How calm and peaceful do you feel?', subtitle: '5 = Completely at peace, 1 = Overwhelmed.',
        labels: ['Overwhelmed', 'Stressed', 'Some Tension', 'Mostly Calm', 'At Peace'], emojis: ['🌪️', '😤', '😬', '😌', '🌸'],
    },
    {
        id: 'hope', question: 'How hopeful do you feel about the coming days?', subtitle: 'Hope is the seed of all healing.',
        labels: ['No Hope', 'Little Hope', 'Unsure', 'Hopeful', 'Very Hopeful'], emojis: ['🌑', '🌘', '🌗', '🌕', '⭐'],
    },
];

const scoreTheme = (val) => {
    const themes = [null,
        { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', text: 'text-red-500' },
        { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-500' },
        { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-500' },
        { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-500' },
        { bg: 'bg-primary/10', border: 'border-primary', text: 'text-primary' },
    ];
    return themes[val] || themes[3];
};

const colorMap = {
    emerald: { bg: 'from-emerald-400 to-teal-500' },
    primary: { bg: 'from-primary to-purple-divine' },
    yellow: { bg: 'from-yellow-400 to-orange-400' },
    red: { bg: 'from-rose-400 to-red-500' },
};

const categoryColor = {
    Productivity: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    Focus: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    'Emotional Healing': 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    'Stress Relief': 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    Recovery: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    Growth: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    Mindfulness: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    Wellness: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
};

const MoodCheckInModal = ({ user, onClose, onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ mood: 3, sleep: 3, spiritual: 3, stress: 3, hope: 3 });
    const [submitting, setSubmitting] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [aiRec, setAiRec] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const currentQ = QUESTIONS[step - 1];
    const isIntro = step === 0;
    const isResults = step === QUESTIONS.length + 1;
    const progress = isIntro ? 0 : isResults ? 100 : Math.round((step / QUESTIONS.length) * 100);

    const handleNext = async () => {
        if (step < QUESTIONS.length) {
            setStep((s) => s + 1);
            return;
        }

        // ── Last question → compute & show results immediately ──────────────
        setSubmitting(true);

        // 1. Run local analysis instantly (synchronous)
        const localResult = analyzeMood(answers);
        setAnalysis(localResult);

        // 2. Show the results screen RIGHT AWAY — don't wait for network calls
        setStep(QUESTIONS.length + 1);
        setSubmitting(false);
        onComplete?.(localResult);

        // 3. Fire-and-forget: save to DB + fetch AI in the background
        setAiLoading(true);
        try {
            const [, aiResult] = await Promise.all([
                saveMoodCheckin(user.id, answers).catch((e) => console.error('Save error:', e)),
                getAIRecommendation(answers),
            ]);
            setAiRec(aiResult);
        } catch (err) {
            console.error('Background task error:', err);
            // AI service already returns fallback on error, but just in case:
            setAiRec(null);
        } finally {
            setAiLoading(false);
        }
    };

    const handlePdf = async () => {
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

    const theme = analysis ? colorMap[analysis.colorClass] || colorMap.primary : colorMap.primary;
    const catColor = aiRec ? (categoryColor[aiRec.category] || categoryColor.Wellness) : categoryColor.Mindfulness;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.88, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.88, opacity: 0, y: 30 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                >
                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                        <motion.div className="h-full bg-gradient-to-r from-primary to-saffron" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                    </div>

                    {!isResults && (
                        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all z-10">
                            <X size={16} />
                        </button>
                    )}

                    <div className="p-10">
                        <AnimatePresence mode="wait">

                            {/* ── INTRO ── */}
                            {isIntro && (
                                <motion.div key="intro" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
                                    <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}
                                        className="w-20 h-20 bg-gradient-to-tr from-primary to-saffron rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <Brain size={36} className="text-white" />
                                    </motion.div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Daily Wellness Check-In</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-3 leading-relaxed">
                                        Answer 5 quick questions and our AI will generate a personalised recommendation for your day.
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-8 font-semibold uppercase tracking-widest">5 short questions · ~1 minute</p>
                                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 mb-8 text-left space-y-2">
                                        {['Analyse your current mental state', 'Get an AI-powered personalised recommendation', 'Download your personal wellness report'].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0"><CheckCircle2 size={12} className="text-white" /></div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                                        className="w-full bg-gradient-to-r from-primary to-purple-divine text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2">
                                        Begin Check-In <ChevronRight size={22} />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* ── QUESTIONS ── */}
                            {!isIntro && !isResults && currentQ && (
                                <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
                                    <div className="flex gap-1.5 mb-6">
                                        {QUESTIONS.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />))}
                                    </div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Question {step} of {QUESTIONS.length}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{currentQ.question}</h3>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-8">{currentQ.subtitle}</p>

                                    <div className="grid grid-cols-5 gap-2 mb-8">
                                        {[1, 2, 3, 4, 5].map((val) => {
                                            const selected = answers[currentQ.id] === val;
                                            const t = scoreTheme(val);
                                            return (
                                                <motion.button key={val} whileHover={{ y: -4, scale: 1.05 }} whileTap={{ scale: 0.94 }}
                                                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: val }))}
                                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${selected ? `${t.bg} ${t.border} shadow-lg` : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}>
                                                    <span className="text-2xl">{currentQ.emojis[val - 1]}</span>
                                                    <span className={`text-[9px] font-black text-center leading-tight ${selected ? t.text : 'text-slate-400'}`}>{currentQ.labels[val - 1]}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-3">
                                        {step > 1 && (
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep((s) => s - 1)}
                                                className="flex items-center gap-2 px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm hover:border-primary transition-all">
                                                <ChevronLeft size={18} /> Back
                                            </motion.button>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                                            onClick={handleNext}
                                            disabled={submitting}
                                            className="flex-1 bg-gradient-to-r from-primary to-purple-divine text-white py-4 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {submitting
                                                ? <><Loader2 size={18} className="animate-spin" /> Processing…</>
                                                : step === QUESTIONS.length
                                                    ? <><Sparkles size={16} /> See My AI Analysis</>
                                                    : <>Next <ChevronRight size={18} /></>}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── RESULTS ── */}
                            {isResults && analysis && (
                                <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 18 }}>

                                    {/* ══════ HERO: AI RECOMMENDATION CARD ══════ */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-primary/90 to-purple-divine p-7 mb-6 text-white shadow-2xl"
                                    >
                                        {/* Glow orbs */}
                                        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                                        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-saffron/20 rounded-full blur-2xl pointer-events-none" />

                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5 relative z-10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                                    <Bot size={18} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">AI Mood Engine</p>
                                                    <p className="text-sm font-black text-white leading-none">Your Personalised Recommendation</p>
                                                </div>
                                            </div>
                                            {aiRec && !aiLoading && (
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${catColor}`}>
                                                    {aiRec.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content: loading skeleton OR real AI result */}
                                        <div className="relative z-10">
                                            {aiLoading ? (
                                                /* ── Loading skeleton ── */
                                                <div className="space-y-3 animate-pulse">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/20 rounded-full" />
                                                        <div className="h-6 bg-white/20 rounded-xl flex-1" />
                                                    </div>
                                                    <div className="h-4 bg-white/15 rounded-lg w-full" />
                                                    <div className="h-4 bg-white/15 rounded-lg w-4/5" />
                                                    <div className="h-10 bg-white/15 rounded-2xl w-full mt-2" />
                                                    <p className="text-white/50 text-xs text-center pt-1 font-bold tracking-widest uppercase">AI is analysing your mood…</p>
                                                </div>
                                            ) : aiRec ? (
                                                /* ── AI Result ── */
                                                <>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-4xl drop-shadow-lg">{aiRec.emoji}</span>
                                                        <h3 className="text-2xl font-black tracking-tight leading-tight">{aiRec.recommendation}</h3>
                                                    </div>
                                                    <p className="text-white/85 font-medium leading-relaxed text-sm mb-5">
                                                        {aiRec.message}
                                                    </p>
                                                    <div className="flex items-start gap-2.5 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                                                        <Zap size={14} className="text-saffron mt-0.5 shrink-0" />
                                                        <p className="text-xs font-black text-white/90 leading-relaxed">{aiRec.action}</p>
                                                    </div>
                                                    {aiRec.fallback && (
                                                        <p className="text-[9px] text-white/40 mt-3 text-right uppercase tracking-widest font-bold">✦ AI engine offline · Default guidance</p>
                                                    )}
                                                </>
                                            ) : (
                                                /* ── Fallback if both AI and loading are done but aiRec is still null ── */
                                                <p className="text-white/60 text-sm font-medium text-center py-4">
                                                    🙏 Take a moment of stillness and let your breath guide you right now.
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* ══════ WELLNESS STATE (secondary) ══════ */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={`bg-gradient-to-r ${theme.bg} rounded-2xl px-6 py-4 mb-5 flex items-center gap-4 text-white shadow-lg`}
                                    >
                                        <span className="text-3xl">{analysis.emoji}</span>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-75">Your Wellness State</p>
                                            <p className="text-xl font-black">{analysis.state} · {analysis.happiness}%</p>
                                        </div>
                                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                                            <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: `${analysis.happiness}%` }} transition={{ duration: 1.2, delay: 0.4 }} />
                                        </div>
                                    </motion.div>

                                    {/* Message */}
                                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed mb-5 px-1">{analysis.message}</p>

                                    {/* Do Today */}
                                    <div className="mb-4">
                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">✅ Do Today</p>
                                        <div className="space-y-1.5">
                                            {analysis.doToday.map((item, i) => (
                                                <div key={i} className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl px-3 py-2">
                                                    <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Avoid Today */}
                                    <div className="mb-8">
                                        <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">⚠️ Avoid Today</p>
                                        <div className="space-y-1.5">
                                            {analysis.avoidToday.map((item, i) => (
                                                <div key={i} className="flex items-start gap-2 bg-red-50 dark:bg-red-900/10 rounded-xl px-3 py-2">
                                                    <span className="text-red-400 mt-0.5 shrink-0">•</span>
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="space-y-3">
                                        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={onClose}
                                            className={`w-full bg-gradient-to-r ${theme.bg} text-white py-5 rounded-2xl font-black text-lg shadow-xl`}>
                                            View My Practice Plan →
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handlePdf} disabled={downloadingPdf}
                                            className="w-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all">
                                            {downloadingPdf ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Download size={16} /> Download PDF Report</>}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MoodCheckInModal;

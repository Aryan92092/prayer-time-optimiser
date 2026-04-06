import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, AlertCircle, CheckCircle2, RefreshCw, History, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateHealingPlan, saveHealingData, getHealingPlans, toggleStepCompletion } from '../services/healingService';

const EMOTIONS = [
    { label: 'Stressed', emoji: '🔥' },
    { label: 'Anxious', emoji: '💨' },
    { label: 'Sad', emoji: '😔' },
    { label: 'Lonely', emoji: '🌙' },
    { label: 'Overthinking', emoji: '🧠' },
    { label: 'Burned Out', emoji: '☀️' },
    { label: 'Angry', emoji: '⏱️' },
];

const RELIEF_OPTIONS = [
    { label: 'Guided Steps', icon: '📝' },
    { label: 'Quick Exercises', icon: '⚡' },
    { label: 'Light Humor', icon: '😊' },
    { label: 'Suggestions', icon: '💡' },
    { label: 'Quotes', icon: '💬' },
];

const HealingPage = () => {
    const { user } = useAuth();

    // UI states
    const [view, setView] = useState('input'); // 'input' | 'generating' | 'activePlan' | 'history'
    const [errorMsg, setErrorMsg] = useState('');

    // Form states
    const [selectedEmotion, setSelectedEmotion] = useState('');
    const [inputText, setInputText] = useState('');
    const [selectedRelief, setSelectedRelief] = useState([]);

    // Data states
    const [activePlan, setActivePlan] = useState(null);
    const [pastPlans, setPastPlans] = useState([]);
    const [drAishaReply, setDrAishaReply] = useState('');

    useEffect(() => {
        if (!user) return;
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const plans = await getHealingPlans(user.id);
            setPastPlans(plans);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const toggleRelief = (option) => {
        if (selectedRelief.includes(option)) {
            setSelectedRelief(selectedRelief.filter(o => o !== option));
        } else {
            setSelectedRelief([...selectedRelief, option]);
        }
    };

    const handleGenerate = async () => {
        if (!selectedEmotion) {
            setErrorMsg("Please select how you are feeling.");
            return;
        }
        if (!inputText.trim()) {
            setErrorMsg("Please tell Dr. Aisha a bit more about what's going on.");
            return;
        }

        setErrorMsg('');
        setView('generating');

        try {
            // Incorporate all preferences into the text sent to the LLM
            const combinedText = `The user selected the core emotion: ${selectedEmotion}. They want relief in the form of: ${selectedRelief.join(', ') || 'General guidance'}. Their specific details: "${inputText}"`;

            // 1. Call the healing ML model + Dr. Aisha chat reply in parallel
            const [generatedData, chatRes] = await Promise.all([
                generateHealingPlan(combinedText),
                fetch('http://localhost:8000/api/healing/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emotion: selectedEmotion,
                        message: inputText,
                        relief_types: selectedRelief,
                    }),
                }).then(r => r.json()).catch(() => ({ reply: '' }))
            ]);

            // 2. Store Dr. Aisha's personal reply
            if (chatRes?.reply) setDrAishaReply(chatRes.reply);

            // 3. Save to DB
            await saveHealingData(user.id, generatedData);

            // 4. Set Active Plan visually
            setActivePlan(generatedData);

            // 5. Refresh history
            fetchHistory();

            // 6. Show results
            setView('activePlan');

            // Clear form
            setSelectedEmotion('');
            setInputText('');
            setSelectedRelief([]);

        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to reach Dr. Aisha. The AI guides might be offline right now.");
            setView('input');
        }
    };

    const handleToggleStep = async (stepIdx, currentStatus) => {
        if (!activePlan || !activePlan.steps) return;

        const updatedPlan = { ...activePlan };
        updatedPlan.steps[stepIdx].completed = !currentStatus;
        setActivePlan(updatedPlan);

        const dbPlan = pastPlans[0];
        if (dbPlan && dbPlan.healing_steps && dbPlan.healing_steps[stepIdx]) {
            const dbStepId = dbPlan.healing_steps[stepIdx].id;
            try {
                await toggleStepCompletion(dbStepId, !currentStatus);
                fetchHistory();
            } catch (e) {
                console.error("Failed to toggle DB step", e);
                const revertedPlan = { ...activePlan };
                revertedPlan.steps[stepIdx].completed = currentStatus;
                setActivePlan(revertedPlan);
            }
        }
    };

    const severityColors = {
        low: 'text-emerald-500 bg-emerald-50',
        medium: 'text-amber-500 bg-amber-50',
        high: 'text-rose-500 bg-rose-50'
    };

    return (
        <div className="min-h-screen pt-20 pb-32 px-4 selection:bg-primary/30 relative">

            {/* Background glowing gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <div className="max-w-3xl mx-auto border-none">

                {/* Header Toggle */}
                {pastPlans.length > 0 && view !== 'history' && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setView('history')}
                            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
                        >
                            <History size={14} /> Timeline
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* ══════════════ INPUT VIEW (Dr. Aisha Form) ══════════════ */}
                    {view === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col items-center"
                        >
                            {/* Avatar */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-1 shadow-2xl relative z-10 overflow-hidden border border-white flex items-center justify-center">
                                    <span className="text-5xl">🧘‍♀️</span>
                                </div>
                                <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-0.5 shadow-sm text-xs font-black flex items-center gap-1 border border-slate-100 z-20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" /> AI
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-10">
                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">DR. AISHA • AI WELLNESS COUNSELOR</p>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                    How are you feeling <br className="md:hidden" />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-divine via-primary to-saffron">today?</span>
                                </h1>
                            </div>

                            {/* Main Form Card */}
                            <div className="w-full bg-gradient-to-br from-white/60 via-emerald-50/40 to-orange-50/40 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 shadow-primary/5">

                                {/* Step 1: Feeling */}
                                <div className="mb-10">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. How are you feeling today?</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {EMOTIONS.map(emo => (
                                            <button
                                                key={emo.label}
                                                onClick={() => setSelectedEmotion(emo.label)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 border-2 ${selectedEmotion === emo.label
                                                    ? 'bg-sky-400 border-sky-400 text-white shadow-lg shadow-sky-400/30'
                                                    : 'bg-white/50 border-white/60 text-slate-600 hover:bg-white/80 hover:border-slate-200'
                                                    }`}
                                            >
                                                <span>{emo.emoji}</span> {emo.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 2: More Info */}
                                <div className="mb-10">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">2. Tell Dr. Aisha more</h3>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="I'm feeling really anxious and my heart won't stop racing. I can't calm down."
                                        className="w-full h-32 p-5 rounded-2xl border-none focus:ring-4 focus:ring-primary/20 bg-white/50 text-slate-700 text-base resize-none font-medium placeholder:text-slate-400 shadow-inner"
                                    />
                                </div>

                                {/* Step 3: Relief */}
                                <div className="mb-12">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">3. What kind of relief do you want?</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {RELIEF_OPTIONS.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => toggleRelief(opt.label)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 border-2 ${selectedRelief.includes(opt.label)
                                                    ? 'bg-violet-100 border-violet-400 text-violet-700 select-none'
                                                    : 'bg-transparent border-violet-200 text-violet-600 hover:bg-violet-50'
                                                    }`}
                                            >
                                                {selectedRelief.includes(opt.label) && <Sparkles size={14} className="text-violet-500" />}
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMsg && (
                                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                                        <AlertCircle size={16} />
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
                                >
                                    <Sparkles size={20} /> Begin Session <ChevronRight size={20} />
                                </motion.button>

                            </div>
                        </motion.div>
                    )}


                    {/* ══════════════ GENERATING VIEW ══════════════ */}
                    {view === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="py-32 text-center flex flex-col items-center justify-center"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                    className="w-24 h-24 rounded-full border-4 border-dashed border-primary/40 flex items-center justify-center relative z-10 bg-white/40 backdrop-blur-md"
                                >
                                    <span className="text-4xl animate-pulse">🧘‍♀️</span>
                                </motion.div>
                            </div>
                            <h3 className="text-3xl font-black mb-3 text-slate-800">Dr. Aisha is analyzing...</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Preparing your tailored relief plan</p>
                        </motion.div>
                    )}


                    {/* ══════════════ ACTIVE PLAN VIEW ══════════════ */}
                    {view === 'activePlan' && activePlan && (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-xl shadow-inner">
                                        Dr.
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg leading-tight">Your Session Plan</h3>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest">DR. AISHA</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setView('input'); setDrAishaReply(''); }}
                                    className="text-xs font-black text-slate-400 hover:text-slate-700 bg-white py-2 px-4 rounded-full shadow-sm"
                                >
                                    New Session
                                </button>
                            </div>

                            {/* Dr. Aisha Personal Reply Bubble */}
                            {drAishaReply && (
                                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 rounded-[2rem] p-6 md:p-8 shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center text-2xl shadow-inner shrink-0">
                                            🧘‍♀️
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">DR. AISHA • AI WELLNESS COUNSELOR</p>
                                            <p className="text-slate-700 text-base font-medium leading-relaxed italic">
                                                &ldquo;{drAishaReply}&rdquo;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Plan Hero Card */}
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-100">
                                <div className={`inline-flex px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest mb-4 border ${severityColors[activePlan.severity] || severityColors.medium}`}>
                                    {activePlan.severity} Severity
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-slate-900 leading-tight">
                                    {activePlan.plan_title}
                                </h2>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl italic border-l-4 border-primary pl-4">
                                    "{activePlan.summary}"
                                </p>
                            </div>

                            {/* Checklist Card */}
                            <div className="bg-gradient-to-br from-white to-slate-50 p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                        <Sparkles size={18} className="text-primary" /> Action Steps
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-4 py-1.5 rounded-full">
                                        {activePlan.steps.filter(s => s.completed).length} / {activePlan.steps.length} Complete
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {activePlan.steps.map((step, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleToggleStep(idx, !!step.completed)}
                                            className={`flex gap-5 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${step.completed
                                                ? 'border-emerald-200 bg-emerald-50/50 opacity-60'
                                                : 'border-slate-100 bg-white hover:border-primary/20 hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5 ${step.completed
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'border-slate-300 group-hover:border-primary/50'
                                                }`}>
                                                {step.completed && <CheckCircle2 className="text-white" size={16} />}
                                            </div>

                                            <div>
                                                <h4 className={`text-base font-black mb-1 transition-colors ${step.completed ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                                                    {step.title}
                                                </h4>
                                                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}


                    {/* ══════════════ HISTORY TIMELINE VIEW ══════════════ */}
                    {view === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-800">Past Sessions</h3>
                                <button
                                    onClick={() => setView('input')}
                                    className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-200"
                                >
                                    Back
                                </button>
                            </div>

                            <div className="space-y-6">
                                {pastPlans.map((plan) => (
                                    <div key={plan.id} className="p-6 border-l-4 border-l-primary bg-slate-50 flex flex-col md:flex-row gap-6 rounded-r-2xl">
                                        <div className="md:w-1/3">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                                                {new Date(plan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <h4 className="text-lg font-black text-slate-800 mb-2">{plan.title}</h4>
                                            <span className="bg-white border border-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest">
                                                {plan.user_emotions?.emotion}
                                            </span>
                                        </div>
                                        <div className="md:w-2/3 md:pl-6 md:border-l border-slate-200">
                                            <p className="text-sm text-slate-500 italic mb-4">
                                                "{plan.user_emotions?.summary}"
                                            </p>
                                            <div className="space-y-2">
                                                {plan.healing_steps?.map((s) => (
                                                    <div key={s.id} className="flex gap-2 text-sm">
                                                        <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${s.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                        <span className={`font-medium ${s.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {s.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {pastPlans.length === 0 && (
                                    <div className="text-center py-16 text-slate-400 font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        No past sessions found. Start talking to Dr. Aisha to see your history!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default HealingPage;

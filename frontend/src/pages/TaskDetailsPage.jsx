import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, HeartPulse, ShieldCheck, Timer, Volume2, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProgramWithEntries, getActiveProgram } from '../services/programService';
import { getMoodBenefits } from '../services/moodBenefits';
import { useTimer } from '../context/TimerContext';
import { getGuideByTitle } from '../services/scheduleService';

const TaskDetailsPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { openTimer, activeEntry, phase, isMinimized } = useTimer();

    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // Fallback if moodHappiness wasn't passed via state
    const moodHappiness = location.state?.moodHappiness || 50;

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const program = await getActiveProgram(user.id);
                if (!program) return navigate('/dashboard');

                const progData = await getProgramWithEntries(program.id);
                const foundEntry = progData.entries.find(e => String(e.id) === String(taskId));

                if (!foundEntry) {
                    navigate('/dashboard');
                } else {
                    setEntry(foundEntry);
                }
            } catch (err) {
                console.error(err);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
        
        // Cleanup speech synthesis on unmount
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [taskId, user.id, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-saffron rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Sacred Space...</p>
            </div>
        );
    }

    if (!entry) return null;

    const benefits = getMoodBenefits(moodHappiness);

    // Robustly resolve guide data — fallback to local schedule guide map if DB fields are empty
    const localGuide = getGuideByTitle(entry.activity_title);

    // detail_guide may be: array (correct), JSON string (Supabase edge case), or null (old row)
    let detailGuide = entry.detail_guide;
    if (typeof detailGuide === 'string') {
        try { detailGuide = JSON.parse(detailGuide); } catch { detailGuide = null; }
    }
    if (!Array.isArray(detailGuide) || detailGuide.length === 0) {
        detailGuide = localGuide?.detail_guide || null;
    }

    const displayMantra = entry.mantra_lyrics || localGuide?.mantra_lyrics;


    const handleStartSession = () => {
        openTimer(entry, () => {
            // Once the timer marks the task as complete, navigate back
            navigate('/dashboard');
        });
    };

    const toggleSpeech = (text) => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text to speech!");
            return;
        }

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85; // Slightly slower for reflection
            
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-32 pt-8 px-4">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs mb-8"
            >
                <ArrowLeft size={16} /> Back to Path
            </button>

            {/* Header section */}
            <div className="glass-card p-10 md:p-14 mb-8">
                <div className="flex items-center gap-3 bg-primary/10 text-primary w-max px-4 py-2 rounded-full mb-6">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">Day {entry.day_number} · {entry.time_of_day}</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {entry.activity_title}
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                    {entry.activity_description}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Benefits & Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personalized Benefit Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex items-center gap-3 mb-4">
                            <HeartPulse size={24} className="text-indigo-500" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Why doing this today matters</h3>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-4 leading-relaxed">
                            {benefits.text}
                        </p>
                        <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-sm border border-white/50 dark:border-slate-800">
                            <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Expected Benefit</p>
                                <p className="text-slate-900 dark:text-white font-bold">{benefits.benefit}</p>
                            </div>
                        </div>
                    </div>

                    {/* Step by Step Guide */}
                    {detailGuide && (
                        <div className="glass-card p-8 md:p-10">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                                Step-by-Step Guide
                            </h3>
                            <div className="space-y-6">
                                {detailGuide.map((step, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110 flex items-center justify-center text-sm font-black transition-all shrink-0">
                                                {i + 1}
                                            </div>
                                            {i !== detailGuide.length - 1 && (
                                                <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-2" />
                                            )}
                                        </div>
                                        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-1.5 pb-6">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mantra / Verses / Recitation Texts */}
                    {displayMantra && (
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 md:p-12 shadow-2xl border border-slate-700 mt-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-divine/20 blur-3xl rounded-full -mb-20 -ml-20 pointer-events-none" />

                            <div className="relative z-10 text-center">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0">Read & Reflect</p>
                                    <button 
                                        onClick={() => toggleSpeech(displayMantra)}
                                        className={`p-2 rounded-full transition-colors flex items-center justify-center ${isPlaying ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-slate-800 text-primary hover:bg-primary hover:text-white'}`}
                                        title={isPlaying ? "Stop Reading" : "Read Aloud"}
                                    >
                                        {isPlaying ? <Square size={14} fill="currentColor" /> : <Volume2 size={16} />}
                                    </button>
                                </div>
                                <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed italic text-slate-200">
                                    "{displayMantra.split('\n').map((line, idx) => (
                                        <React.Fragment key={idx}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}"
                                </blockquote>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Actions & References */}
                <div className="space-y-8">
                    {/* Action Card */}
                    <div className="glass-card p-8 text-center sticky top-28">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Timer size={32} className="text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ready to align?</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8">
                            A focused session will start the timer and play ambient sounds (if enabled).
                        </p>

                        {(activeEntry?.id === entry.id && phase !== 'none') ? (
                            <button
                                disabled
                                className="w-full bg-slate-200 dark:bg-slate-800 text-slate-400 py-5 rounded-2xl font-black text-lg cursor-not-allowed flex flex-col items-center gap-1"
                            >
                                <span>Session in Progress</span>
                                {isMinimized && <span className="text-[10px] uppercase tracking-widest text-slate-500">Check bottom right timer</span>}
                            </button>
                        ) : (
                            <button
                                onClick={handleStartSession}
                                className="w-full bg-gradient-to-r from-primary to-purple-divine hover:shadow-primary/30 text-white py-5 rounded-2xl font-black shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-lg"
                            >
                                Start Focus Session
                            </button>
                        )}

                        {entry.completed && (
                            <div className="mt-4 inline-flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                                <ShieldCheck size={16} /> Already Completed
                            </div>
                        )}
                    </div>

                    {/* Reference Card */}
                    {entry.reference && (
                        <div className="glass-card p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 overflow-hidden relative border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                            <BookOpen size={120} className="absolute -right-10 -bottom-10 text-slate-100 dark:text-slate-800 rotate-12 opacity-50" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sacred Text</p>
                                <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-tight">
                                    {entry.reference}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TaskDetailsPage;

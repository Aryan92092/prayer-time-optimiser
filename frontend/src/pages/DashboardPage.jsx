import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, BookOpen, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WeeklyAnalytics from '../components/WeeklyAnalytics';
import AchievementBadges from '../components/AchievementBadges';
import TodayFocusCard from '../components/TodayFocusCard';
import { getActiveProgram, getProgramWithEntries, updateEntry, subscribeEntries } from '../services/programService';
import { getJournals, subscribeJournals } from '../services/journalService';
import { getAchievements, checkAndAwardAchievements, subscribeAchievements } from '../services/achievementService';
import { computeInsights, computeWeeklyProgress, getTodayFocus } from '../services/scheduleService';

const DashboardPage = () => {
    const { user } = useAuth();

    const [program, setProgram] = useState(null);
    const [entries, setEntries] = useState([]);
    const [insights, setInsights] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [todayFocus, setTodayFocus] = useState(null);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Recompute derived data whenever entries change
    const refreshDerived = useCallback((freshEntries, prog) => {
        if (!prog) return;
        const ins = computeInsights(freshEntries);
        const weekly = computeWeeklyProgress(freshEntries, prog.start_date);
        const focus = getTodayFocus(freshEntries, prog.start_date);
        setInsights(ins);
        setWeeklyData(weekly);
        setTodayFocus(focus);
    }, []);

    useEffect(() => {
        if (!user) return;
        let unsubEntries, unsubJournals, unsubAchievements;

        const init = async () => {
            try {
                // 1. Fetch active program
                const activeProgram = await getActiveProgram(user.id);
                if (!activeProgram) { setLoading(false); return; }

                // 2. Fetch program + entries
                const progWithEntries = await getProgramWithEntries(activeProgram.id);
                setProgram(progWithEntries);
                setEntries(progWithEntries.entries);
                refreshDerived(progWithEntries.entries, progWithEntries);

                // 3. Fetch journals & achievements
                const [journalData, achievementData] = await Promise.all([
                    getJournals(user.id),
                    getAchievements(user.id),
                ]);
                setJournals(journalData);
                setAchievements(achievementData);

                // 4. Subscribe to real-time changes
                unsubEntries = subscribeEntries(activeProgram.id, (freshEntries) => {
                    setEntries(freshEntries);
                    setProgram(prev => prev ? { ...prev, entries: freshEntries } : null);
                    refreshDerived(freshEntries, activeProgram);
                    // check achievements on any entry change
                    checkAndAwardAchievements(user.id, freshEntries);
                });

                unsubJournals = subscribeJournals(user.id, setJournals);
                unsubAchievements = subscribeAchievements(user.id, setAchievements);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };

        init();
        return () => {
            unsubEntries?.();
            unsubJournals?.();
            unsubAchievements?.();
        };
    }, [user, refreshDerived]);

    const toggleComplete = async (entryId, currentStatus) => {
        try {
            await updateEntry(entryId, !currentStatus);
            // real-time subscription will auto-update the UI
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-primary border-t-saffron rounded-full animate-spin mb-6"></div>
            <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">
                Aligning Your Spirit...
            </p>
        </div>
    );

    if (!program) return (
        <div className="text-center py-32 glass-card mx-auto max-w-2xl">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
                <Heart className="text-primary fill-primary/20" size={48} />
            </div>
            <h2 className="text-5xl font-black mb-6 dark:text-white tracking-tight">Begin Your Journey</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 px-12 leading-relaxed font-medium">
                Every profound path begins with a single step. Let's design a sacred space
                tailored to your spiritual and mental well-being.
            </p>
            <Link
                to="/onboarding"
                className="bg-gradient-to-r from-primary to-purple-divine text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:shadow-primary/30 transition-all inline-block hover:-translate-y-1 active:scale-95 text-lg"
            >
                Create Your Path
            </Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 pt-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                        Namaste, <span className="text-primary">{user?.name || 'Seeker'}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                        Welcome to your sacred sanctuary for today.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/40 dark:border-white/10 shadow-lg">
                    <span className="w-2 h-2 bg-teal-aurora rounded-full" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {program.duration_type} Path • Day 1
                    </span>
                </div>
            </div>

            {/* Smart Today's Focus */}
            <TodayFocusCard
                task={todayFocus}
                onToggle={toggleComplete}
            />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    icon={<TrendingUp className="text-purple-divine" />}
                    label="Spiritual Streak"
                    value={`${insights?.streak || 0}`}
                    sub="Continuous Days"
                    theme="purple"
                />
                <StatCard
                    icon={<Calendar className="text-saffron" />}
                    label="Current Path"
                    value={program.duration_type}
                    sub="Divine Commitment"
                    theme="saffron"
                />
                <StatCard
                    icon={<BookOpen className="text-teal-aurora" />}
                    label="Journal Entries"
                    value={`${journals.length}`}
                    sub="Heartfelt Reflections"
                    theme="teal"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Analytics & Badges */}
                <div className="lg:col-span-2 space-y-12">
                    <WeeklyAnalytics data={weeklyData} />
                    <AchievementBadges unlockedBadges={achievements} />
                </div>

                {/* Right Column: Mini Insights & Level */}
                <div className="space-y-12">
                    {insights && (
                        <div className="glass-card p-10 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                            <h3 className="text-3xl font-black dark:text-white tracking-tight">Divine Insight</h3>

                            <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-divine/10 rounded-[2rem] border border-primary/20 relative group">
                                <span className="absolute -top-3 left-6 px-4 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    {insights.level}
                                </span>
                                <p className="text-lg text-slate-700 dark:text-slate-300 mt-2 font-black italic leading-relaxed">
                                    "{insights.message}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Path Progression</p>
                                        <p className="text-2xl font-black dark:text-white">{insights.completionPercentage}%</p>
                                    </div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Mastery Level</p>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${insights.completionPercentage}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="bg-gradient-to-r from-primary to-saffron h-full rounded-full"
                                    />
                                </div>
                            </div>

                            <Link
                                to="/journal"
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl group"
                            >
                                <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
                                Deepen Reflections
                            </Link>
                        </div>
                    )}

                    <div className="glass-card p-10 bg-gradient-to-br from-teal-aurora/5 to-primary/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-aurora/10 rounded-full blur-2xl" />
                        <h4 className="text-2xl font-black mb-4 dark:text-white tracking-tight">Need Guidance?</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6 leading-relaxed">
                            Our spiritual guides are ready to help you optimize your path and find deeper clarity.
                        </p>
                        <button className="w-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-black hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-sm uppercase tracking-widest">
                            Chat with Guide
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Schedule List */}
            <div className="glass-card p-10 md:p-14">
                <div className="flex items-center gap-4 mb-14">
                    <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="text-saffron" size={28} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black dark:text-white tracking-tight text-slate-900">Your Full Path</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Every moment is a chance to reconnect</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {entries.map((entry, idx) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.03 }}
                            className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col md:flex-row items-center md:items-start gap-8 ${entry.completed
                                ? 'bg-slate-50/50 dark:bg-slate-900/40 border-transparent grayscale'
                                : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 dark:hover:border-primary/30 group'
                                }`}
                        >
                            <button
                                onClick={() => toggleComplete(entry.id, entry.completed)}
                                className="transition-transform active:scale-75"
                            >
                                {entry.completed ? (
                                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                                        <CheckCircle2 size={32} />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                        <Circle size={32} fill="currentColor" fillOpacity={0.1} />
                                    </div>
                                )}
                            </button>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                                            {entry.time_of_day}
                                        </span>
                                        <span className="text-xs font-black text-slate-400">
                                            SEQUENCE {idx + 1}
                                        </span>
                                    </div>
                                    <div className="px-4 py-1 bg-gold-divine/10 text-gold-divine rounded-full text-[10px] font-black">
                                        DAY {entry.day_number}
                                    </div>
                                </div>

                                <h4 className={`text-2xl font-black mb-2 transition-all ${entry.completed
                                    ? 'line-through text-slate-300'
                                    : 'text-slate-900 dark:text-white group-hover:text-primary'
                                    }`}>
                                    {entry.activity_title}
                                </h4>

                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                                    {entry.activity_description}
                                </p>
                            </div>

                            {!entry.completed && (
                                <button
                                    onClick={() => toggleComplete(entry.id, entry.completed)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white"
                                >
                                    Focus Now
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, sub, theme }) => {
    const themes = {
        purple: "bg-purple-divine/10 text-purple-divine shadow-purple-divine/5",
        saffron: "bg-saffron/10 text-saffron shadow-saffron/5",
        teal: "bg-teal-aurora/10 text-teal-aurora shadow-teal-aurora/5"
    };

    return (
        <div className="glass-card p-10 flex items-center gap-8 relative overflow-hidden group">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${themes[theme]}`}>
                {React.cloneElement(icon, { size: 36 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    {label}
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
                    {value}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                    {sub}
                </p>
            </div>
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:opacity-20 transition-opacity ${theme === 'purple' ? 'bg-purple-divine' : theme === 'saffron' ? 'bg-saffron' : 'bg-teal-aurora'}`} />
        </div>
    );
};

export default DashboardPage;

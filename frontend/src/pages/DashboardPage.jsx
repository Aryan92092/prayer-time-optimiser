import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, BookOpen, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WeeklyAnalytics from '../components/WeeklyAnalytics';
import AchievementBadges from '../components/AchievementBadges';
import TodayFocusCard from '../components/TodayFocusCard';
import AIGuidanceCard from '../components/AIGuidanceCard';
import { getActiveProgram, getProgramWithEntries, updateEntry, subscribeEntries } from '../services/programService';
import { getJournals, subscribeJournals } from '../services/journalService';
import { getAchievements, checkAndAwardAchievements, subscribeAchievements } from '../services/achievementService';
import { computeInsights, computeWeeklyProgress, getTodayFocus } from '../services/scheduleService';

// â”€â”€â”€ Animation variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pageVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.10, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
};

// â”€â”€â”€ Animated number counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AnimatedNumber = ({ value, suffix = '' }) => {
    const isNum = !isNaN(Number(value));
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { stiffness: 80, damping: 18 });
    const display = useTransform(spring, (v) => (isNum ? Math.round(v) + suffix : value));

    useEffect(() => {
        if (isNum) motionVal.set(Number(value));
    }, [value, isNum, motionVal]);

    if (!isNum) return <span>{value}</span>;
    return <motion.span>{display}</motion.span>;
};

// â”€â”€â”€ Skeleton card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl ${className}`} />
);

const DashboardSkeleton = () => (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-12 pb-32 pt-20 px-4">
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-5 w-48" />
        </motion.div>
        <motion.div variants={fadeUp}>
            <Skeleton className="h-48 w-full rounded-[3rem]" />
        </motion.div>
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </motion.div>
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
        </motion.div>
    </motion.div>
);

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    const [togglingId, setTogglingId] = useState(null);

    const refreshDerived = useCallback((freshEntries, prog) => {
        if (!prog) return;
        setInsights(computeInsights(freshEntries));
        setWeeklyData(computeWeeklyProgress(freshEntries, prog.start_date));
        setTodayFocus(getTodayFocus(freshEntries, prog.start_date));
    }, []);

    useEffect(() => {
        if (!user) return;
        let unsubEntries, unsubJournals, unsubAchievements;

        const init = async () => {
            try {
                const activeProgram = await getActiveProgram(user.id);
                if (!activeProgram) { setLoading(false); return; }

                const progWithEntries = await getProgramWithEntries(activeProgram.id);
                setProgram(progWithEntries);
                setEntries(progWithEntries.entries);
                refreshDerived(progWithEntries.entries, progWithEntries);

                const [journalData, achievementData] = await Promise.all([
                    getJournals(user.id),
                    getAchievements(user.id),
                ]);
                setJournals(journalData);
                setAchievements(achievementData);

                unsubEntries = subscribeEntries(activeProgram.id, (freshEntries) => {
                    setEntries(freshEntries);
                    setProgram(prev => prev ? { ...prev, entries: freshEntries } : null);
                    refreshDerived(freshEntries, activeProgram);
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
        setTogglingId(entryId);
        try {
            await updateEntry(entryId, !currentStatus);
        } catch (err) {
            console.error(err);
        } finally {
            setTogglingId(null);
        }
    };

    if (loading) return <DashboardSkeleton />;

    if (!program) return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="text-center py-32 glass-card mx-auto max-w-2xl"
        >
            <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10"
            >
                <Heart className="text-primary fill-primary/20" size={48} />
            </motion.div>
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
        </motion.div>
    );

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto space-y-12 pb-32 pt-20"
        >
            {/* â”€â”€ Header â”€â”€ */}
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                        Namaste, <span className="text-primary">{user?.name || 'Seeker'}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                        Welcome to your sacred sanctuary for today.
                    </p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/40 dark:border-white/10 shadow-lg"
                >
                    <span className="w-2 h-2 bg-teal-aurora rounded-full animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {program.duration_type} Path â€¢ Day 1
                    </span>
                </motion.div>
            </motion.div>

            {/* â”€â”€ Today's Focus â”€â”€ */}
            <motion.div variants={fadeUp}>
                <TodayFocusCard task={todayFocus} onToggle={toggleComplete} />
            </motion.div>

            {/* â”€â”€ Stat Cards â”€â”€ */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    icon={<TrendingUp className="text-purple-divine" />}
                    label="Spiritual Streak"
                    value={`${insights?.streak || 0}`}
                    sub="Continuous Days"
                    theme="purple"
                    index={0}
                />
                <StatCard
                    icon={<Calendar className="text-saffron" />}
                    label="Current Path"
                    value={program.duration_type}
                    sub="Divine Commitment"
                    theme="saffron"
                    index={1}
                />
                <StatCard
                    icon={<BookOpen className="text-teal-aurora" />}
                    label="Journal Entries"
                    value={`${journals.length}`}
                    sub="Heartfelt Reflections"
                    theme="teal"
                    index={2}
                />
            </motion.div>

            {/* â”€â”€ Analytics + Insights â”€â”€ */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left */}
                <div className="lg:col-span-2 space-y-12">
                    <WeeklyAnalytics data={weeklyData} />
                    <AchievementBadges unlockedBadges={achievements} />
                </div>

                {/* Right */}
                <div className="space-y-12">
                    {insights && (
                        <motion.div
                            variants={fadeIn}
                            className="glass-card p-10 space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h3 className="text-3xl font-black dark:text-white tracking-tight">Divine Insight</h3>

                            <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-divine/10 rounded-[2rem] border border-primary/20 relative">
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
                                        <p className="text-2xl font-black dark:text-white">
                                            <AnimatedNumber value={insights.completionPercentage} suffix="%" />
                                        </p>
                                    </div>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">Mastery Level</p>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${insights.completionPercentage}%` }}
                                        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
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
                        </motion.div>
                    )}

                    <motion.div
                        variants={fadeIn}
                        className="glass-card p-10 bg-gradient-to-br from-teal-aurora/5 to-primary/5 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-aurora/10 rounded-full blur-2xl" />
                        <h4 className="text-2xl font-black mb-4 dark:text-white tracking-tight">Need Guidance?</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6 leading-relaxed">
                            Our spiritual guides are ready to help you optimize your path and find deeper clarity.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-black hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-sm uppercase tracking-widest"
                        >
                            Chat with Guide
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>

            {/* â”€â”€ Full Schedule â”€â”€ */}
            <motion.div variants={fadeUp} className="glass-card p-10 md:p-14">
                <div className="flex items-center gap-4 mb-14">
                    <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="text-saffron" size={28} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black dark:text-white tracking-tight text-slate-900">Your Full Path</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Every moment is a chance to reconnect</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <AnimatePresence initial={false}>
                        {entries.map((entry, idx) => (
                            <EntryRow
                                key={entry.id}
                                entry={entry}
                                idx={idx}
                                toggling={togglingId === entry.id}
                                onToggle={toggleComplete}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

// â”€â”€â”€ Entry Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EntryRow = ({ entry, idx, toggling, onToggle }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ delay: idx * 0.025, type: 'spring', stiffness: 260, damping: 24 }}
        className={`p-8 rounded-[2.5rem] border-2 transition-colors duration-300 flex flex-col md:flex-row items-center md:items-start gap-8 ${entry.completed
                ? 'bg-slate-50/50 dark:bg-slate-900/40 border-transparent'
                : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 dark:hover:border-primary/30 group'
            }`}
    >
        {/* Toggle button */}
        <motion.button
            whileTap={{ scale: 0.72 }}
            whileHover={{ scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={() => onToggle(entry.id, entry.completed)}
            disabled={toggling}
            className="shrink-0 transition-opacity disabled:opacity-60"
        >
            <AnimatePresence mode="wait">
                {entry.completed ? (
                    <motion.div
                        key="done"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500"
                    >
                        <CheckCircle2 size={32} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors"
                    >
                        <Circle size={32} fill="currentColor" fillOpacity={0.1} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>

        {/* Content */}
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

            <motion.h4
                animate={{ opacity: entry.completed ? 0.4 : 1 }}
                className={`text-2xl font-black mb-2 transition-all ${entry.completed ? 'line-through text-slate-300' : 'text-slate-900 dark:text-white group-hover:text-primary'
                    }`}
            >
                {entry.activity_title}
            </motion.h4>

            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                {entry.activity_description}
            </p>
        </div>

        {/* Focus now CTA */}
        {!entry.completed && (
            <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onToggle(entry.id, entry.completed)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white"
            >
                Focus Now
            </motion.button>
        )}
    </motion.div>
);

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StatCard = ({ icon, label, value, sub, theme, index }) => {
    const themes = {
        purple: 'bg-purple-divine/10 text-purple-divine shadow-purple-divine/5',
        saffron: 'bg-saffron/10 text-saffron shadow-saffron/5',
        teal: 'bg-teal-aurora/10 text-teal-aurora shadow-teal-aurora/5',
    };
    const glowColors = { purple: 'bg-purple-divine', saffron: 'bg-saffron', teal: 'bg-teal-aurora' };

    return (
        <motion.div
            variants={fadeUp}
            custom={index}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
            className="glass-card p-10 flex items-center gap-8 relative overflow-hidden group cursor-default"
        >
            <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl ${themes[theme]}`}
            >
                {React.cloneElement(icon, { size: 36 })}
            </motion.div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
                    <AnimatedNumber value={value} />
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">{sub}</p>
            </div>
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:opacity-25 transition-opacity duration-500 ${glowColors[theme]}`} />
        </motion.div>
    );
};

export default DashboardPage;



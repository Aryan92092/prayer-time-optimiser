import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, BookOpen, TrendingUp, Heart, Lock, FileText, SmilePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WeeklyAnalytics from '../components/WeeklyAnalytics';
import AchievementBadges from '../components/AchievementBadges';
import TodayFocusCard from '../components/TodayFocusCard';
import { getActiveProgram, getProgramWithEntries, updateEntry, subscribeEntries } from '../services/programService';
import { getJournals, subscribeJournals } from '../services/journalService';
import { getAchievements, checkAndAwardAchievements, subscribeAchievements } from '../services/achievementService';
import { computeInsights, computeWeeklyProgress, getTodayFocus, isDayLocked } from '../services/scheduleService';
import { getLastCheckin, isMoodCheckDue, getAllCheckins } from '../services/moodService';
import { generateMoodReport } from '../services/generateMoodReport';

const colorMap = {
    emerald: { bg: 'from-emerald-400 to-teal-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    primary: { bg: 'from-primary to-purple-divine', text: 'text-primary', iconBg: 'bg-primary/10' },
    yellow: { bg: 'from-yellow-400 to-orange-400', text: 'text-yellow-500', iconBg: 'bg-yellow-500/10' },
    red: { bg: 'from-rose-400 to-red-500', text: 'text-red-500', iconBg: 'bg-red-500/10' },
};

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [entries, setEntries] = useState([]);
    const [insights, setInsights] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [todayFocus, setTodayFocus] = useState(null);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
    const [lastMood, setLastMood] = useState(null);

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
                // 1. Fetch active program & mood
                const [activeProgram, lastCheck] = await Promise.all([
                    getActiveProgram(user.id),
                    getLastCheckin(user.id)
                ]);

                if (lastCheck) {
                    setLastMood(lastCheck);
                }

                if (isMoodCheckDue(lastCheck)) {
                    // Redirect to the dedicated mood check-in page after a short delay
                    setTimeout(() => navigate('/mood-checkin'), 800);
                }

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

                // 3.5 Manually check and award any missed achievements from prior sessions
                await checkAndAwardAchievements(user.id, progWithEntries.entries);
                const updatedAchievements = await getAchievements(user.id);
                setAchievements(updatedAchievements);

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
        const newStatus = !currentStatus;
        // Optimistic update — flip immediately in local state
        setEntries(prev => {
            const updated = prev.map(e =>
                e.id === entryId ? { ...e, completed: newStatus } : e
            );
            refreshDerived(updated, program);
            return updated;
        });
        try {
            await updateEntry(entryId, newStatus);
            // Real-time subscription will confirm the change, but let's manually trigger badge calculations
            // just in case Realtime is turned off or lagging on the achievements table.

            // Re-get the entries fresh to calculate the streak correctly
            const progWithEntries = await getProgramWithEntries(program.id);
            await checkAndAwardAchievements(user.id, progWithEntries.entries);

            const updatedAchievements = await getAchievements(user.id);
            setAchievements(updatedAchievements);

        } catch (err) {
            console.error(err);
            // Revert on failure
            setEntries(prev => {
                const reverted = prev.map(e =>
                    e.id === entryId ? { ...e, completed: currentStatus } : e
                );
                refreshDerived(reverted, program);
                return reverted;
            });
        }
    };

    // Navigate to dedicated app task via Link instead of local modal now

    const downloadReport = async () => {
        try {
            const checkins = await getAllCheckins(user.id);
            generateMoodReport(user, checkins);
        } catch (err) {
            console.error('PDF error:', err);
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
        <div className="text-center py-32 glass-card mx-auto max-w-2xl mt-12">
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

            {/* If no program but user wants mood check out of curiosity */}
            <div className="mt-8">
                <button onClick={() => navigate('/mood-checkin')} className="text-slate-400 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                    <SmilePlus size={16} /> Take a Quick Mood Check
                </button>
            </div>
        </div>
    );

    const moodAvg = lastMood ? ((lastMood.mood_score || 0) + (lastMood.sleep_score || 0) + (lastMood.spiritual_score || 0) + (lastMood.stress_score || 0) + (lastMood.hope_score || 0)) / 5 : 0;
    const moodHappiness = Math.round((moodAvg / 5) * 100);
    const moodClass = moodHappiness >= 80 ? 'emerald' : moodHappiness >= 60 ? 'primary' : moodHappiness >= 40 ? 'yellow' : 'red';
    const mTheme = colorMap[moodClass];

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
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button onClick={() => navigate('/mood-checkin')} className="flex items-center gap-2 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/40 dark:border-white/10 shadow-lg transition-all active:scale-95 group">
                        <SmilePlus size={16} className="text-saffron group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Mood Check</span>
                    </button>
                    <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/40 dark:border-white/10 shadow-lg">
                        <span className="w-2 h-2 bg-teal-aurora rounded-full shrink-0" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                            {program.duration_type} Path
                        </span>
                    </div>
                </div>
            </div>

            {/* Mood Banner */}
            <AnimatePresence>
                {lastMood && (
                    <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0 }}
                        className={`mx-4 relative overflow-hidden bg-gradient-to-r ${mTheme.bg} rounded-[2rem] p-6 text-white shadow-lg`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner">
                                    {moodHappiness >= 80 ? '🌟' : moodHappiness >= 60 ? '😊' : moodHappiness >= 40 ? '😐' : '💙'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Your Latest State</p>
                                    <h3 className="text-2xl font-black">{moodHappiness >= 80 ? 'Thriving' : moodHappiness >= 60 ? 'Balanced' : moodHappiness >= 40 ? 'Needs Care' : 'Struggling'} ({moodHappiness}%)</h3>
                                </div>
                            </div>
                            <button onClick={downloadReport} className="shrink-0 bg-white text-slate-900 border-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <FileText size={16} className={mTheme.text} /> Download Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Today's Focus */}
            <TodayFocusCard
                task={todayFocus}
                onToggle={toggleComplete}
                onFocusNow={(task) => navigate(`/task/${task.id}`, { state: { moodHappiness } })}
            />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard icon={<TrendingUp className="text-purple-divine" />} label="Spiritual Streak" value={`${insights?.streak || 0}`} sub="Continuous Days" theme="purple" />
                <StatCard icon={<Calendar className="text-saffron" />} label="Current Day" value={`Day ${todayFocus?.day_number || 1}`} sub="Divine Commitment" theme="saffron" />
                <StatCard icon={<BookOpen className="text-teal-aurora" />} label="Journal Entries" value={`${journals.length}`} sub="Heartfelt Reflections" theme="teal" />
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
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${insights.completionPercentage}%` }} transition={{ duration: 1.5, ease: "circOut" }}
                                        className="bg-gradient-to-r from-primary to-saffron h-full rounded-full" />
                                </div>
                            </div>
                            <Link to="/journal" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl group">
                                <BookOpen size={20} className="group-hover:rotate-12 transition-transform" /> Deepen Reflections
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
                    <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar className="text-saffron" size={28} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black dark:text-white tracking-tight text-slate-900">Your Full Path</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Every moment is a chance to reconnect</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {entries.map((entry, idx) => {
                        const locked = isDayLocked(entries, entry.day_number);

                        return (
                            <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.02 }}
                                className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col md:flex-row items-center md:items-start gap-8 ${locked ? 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent grayscale select-none' :
                                    entry.completed ? 'bg-slate-50/50 dark:bg-slate-900/40 border-transparent' :
                                        'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 dark:hover:border-primary/30 group'
                                    }`}>

                                <button onClick={() => !locked && toggleComplete(entry.id, entry.completed)} disabled={locked}
                                    className={`transition-transform shrink-0 ${!locked && 'active:scale-75 cursor-pointer'} ${locked && 'cursor-not-allowed opacity-50'}`}>
                                    {entry.completed ? (
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                                            <CheckCircle2 size={32} />
                                        </div>
                                    ) : locked ? (
                                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                            <Lock size={20} />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                            <Circle size={32} fill="currentColor" fillOpacity={0.1} />
                                        </div>
                                    )}
                                </button>

                                <div className={`flex-1 text-center md:text-left ${locked ? 'opacity-50' : ''}`}>
                                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                                                {entry.time_of_day}
                                            </span>
                                            {locked && (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center gap-1">
                                                    <Lock size={10} /> Complete Day {entry.day_number - 1} First
                                                </span>
                                            )}
                                        </div>
                                        <div className="px-4 py-1 bg-gold-divine/10 text-gold-divine rounded-full text-[10px] font-black shrink-0">
                                            DAY {entry.day_number}
                                        </div>
                                    </div>

                                    <h4 className={`text-2xl font-black mb-2 transition-all ${entry.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                        {entry.activity_title}
                                    </h4>

                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mb-4">
                                        {entry.activity_description}
                                    </p>

                                    {/* Subtitle / Reference text visible right on the card if not locked */}
                                    {!locked && entry.reference && (
                                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl mb-4">
                                            <BookOpen size={14} /> {entry.reference}
                                        </div>
                                    )}

                                </div>

                                {!entry.completed && !locked && (
                                    <Link to={`/task/${entry.id}`} state={{ moodHappiness }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white shrink-0 mt-2">
                                        View Details
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
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

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target } from 'lucide-react';

const badges = [
    { type: 'Starter', label: 'Starter', icon: <Zap size={24} />, color: 'from-orange-400 to-saffron', glow: 'shadow-saffron/40', description: '3 Day Streak' },
    { type: 'Disciplined', label: 'Disciplined', icon: <Star size={24} />, color: 'from-blue-400 to-primary', glow: 'shadow-primary/40', description: '7 Day Streak' },
    { type: 'Unstoppable', label: 'Unstoppable', icon: <Target size={24} />, color: 'from-purple-500 to-purple-divine', glow: 'shadow-purple-divine/40', description: '14 Day Streak' },
    { type: 'Master', label: 'Master', icon: <Trophy size={24} />, color: 'from-yellow-300 to-gold-divine', glow: 'shadow-gold-divine/40', description: 'Program Master' },
];

const AchievementBadges = ({ unlockedBadges = [] }) => {
    const unlockedTypes = unlockedBadges.map(b => b.badge_type);

    return (
        <div className="glass-card p-10">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-gold-divine/10 rounded-2xl flex items-center justify-center">
                    <Trophy className="text-gold-divine" size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-black tracking-tight dark:text-white">Hall of Honor</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Milestones of your spiritual evolution</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {badges.map((badge) => {
                    const isUnlocked = unlockedTypes.includes(badge.type);
                    return (
                        <motion.div
                            key={badge.type}
                            initial={isUnlocked ? { scale: 0.8, opacity: 0 } : {}}
                            animate={isUnlocked ? { scale: 1, opacity: 1 } : { opacity: 0.3 }}
                            whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                            className="relative group flex flex-col items-center text-center p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-white/40 dark:hover:border-white/10 transition-all duration-500"
                        >
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 transition-transform duration-500 group-hover:rotate-12 ${isUnlocked ? `bg-gradient-to-br ${badge.color} ${badge.glow}` : 'bg-slate-200 dark:bg-slate-800'}`}>
                                {badge.icon}
                            </div>
                            <div>
                                <p className={`font-black text-lg mb-1 ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {badge.label}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                                    {badge.description}
                                </p>
                            </div>

                            {/* Unlocked Glow */}
                            {isUnlocked && (
                                <div className={`absolute -inset-1 rounded-[2.6rem] bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementBadges;

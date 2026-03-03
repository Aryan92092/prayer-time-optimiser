import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const TodayFocusCard = ({ task, onToggle }) => {
    if (!task) return null;

    const isMotivational = task.allCompleted || task.message;

    return (
        <motion.div
            initial={{ y: -24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 }}
            className="divine-glow relative overflow-hidden bg-gradient-to-br from-primary via-purple-divine to-saffron p-10 rounded-[3rem] text-white shadow-2xl border border-white/20"
        >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <span className="w-1.5 h-1.5 bg-gold-divine rounded-full animate-pulse" />
                        {isMotivational ? 'Daily Reflection' : 'Sacred Focus'}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                        className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight"
                    >
                        {isMotivational ? task.message : task.activity_title}
                    </motion.h2>

                    {!isMotivational && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="text-white/80 line-clamp-2 text-lg font-medium max-w-xl"
                        >
                            {task.activity_description}
                        </motion.p>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!isMotivational && (
                        <motion.button
                            key="cta"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 280 }}
                            whileHover={{ scale: 1.06, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onToggle(task.id, false)}
                            className="group bg-white text-slate-900 px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-xl text-lg"
                        >
                            Mark Completed
                            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    )}

                    {isMotivational && task.allCompleted && (
                        <motion.div
                            key="done"
                            initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                            className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20"
                        >
                            <div className="w-12 h-12 bg-teal-aurora rounded-2xl flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={28} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xl leading-none">Complete!</p>
                                <p className="text-white/70 text-sm font-medium">Your spirit shines bright today.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Decorative blobs */}
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[-40%] right-[-10%] w-96 h-96 bg-white rounded-full blur-[100px]"
            />
            <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.12, 0.06] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-[-20%] left-[-5%] w-64 h-64 bg-saffron rounded-full blur-[80px]"
            />
        </motion.div>
    );
};

export default TodayFocusCard;

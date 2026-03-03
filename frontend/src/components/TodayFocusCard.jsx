import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const TodayFocusCard = ({ task, onToggle }) => {
    if (!task) return null;

    const isMotivational = task.allCompleted || task.message;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="divine-glow relative overflow-hidden bg-gradient-to-br from-primary via-purple-divine to-saffron p-10 rounded-[3rem] text-white shadow-2xl border border-white/20"
        >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        <span className="w-1.5 h-1.5 bg-gold-divine rounded-full animate-pulse" />
                        {isMotivational ? 'Daily Reflection' : 'Sacred Focus'}
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        {isMotivational ? task.message : task.activity_title}
                    </h2>

                    {!isMotivational && (
                        <p className="text-white/80 line-clamp-2 text-lg font-medium max-w-xl">
                            {task.activity_description}
                        </p>
                    )}
                </div>

                {!isMotivational && (
                    <button
                        onClick={() => onToggle(task.id, false)}
                        className="group bg-white text-slate-900 px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-primary/30 text-lg"
                    >
                        Mark Completed
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}

                {isMotivational && task.allCompleted && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
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
            </div>

            {/* Premium Decorative elements */}
            <div className="absolute top-[-40%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-5%] w-64 h-64 bg-saffron/10 rounded-full blur-[80px]"></div>
        </motion.div>
    );
};

export default TodayFocusCard;

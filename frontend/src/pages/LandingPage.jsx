import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Sun, Moon, Wind, Heart } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-saffron/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/40 dark:border-white/10 mb-8 shadow-xl">
                        <span className="w-2 h-2 bg-saffron rounded-full animate-ping" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                            The Sanctuary for Your Soul
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                        Cultivate Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-divine to-saffron animate-text-gradient">
                            Internal Peace
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Personalized spiritual paths designed to bring clarity, structure,
                        and divine connection to your modern life.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <Link
                            to="/register"
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg px-10 py-5 rounded-full font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                        >
                            Start Your Journey
                            <Heart className="group-hover:fill-current fill-transparent transition-all duration-300" size={20} />
                        </Link>
                        <Link
                            to="/login"
                            className="glass-card text-slate-900 dark:text-white text-lg px-10 py-5 rounded-full font-black hover:bg-white/60 dark:hover:bg-white/10 transition-all border-white/60"
                        >
                            Continue Your Path
                        </Link>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-10 mt-32 max-w-6xl w-full relative z-10">
                    <FeatureCard
                        icon={<Sun className="text-saffron" size={32} />}
                        title="Sacred Rituals"
                        desc="Daily activities curated for your spiritual evolution and mental clarity."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Shield className="text-teal-aurora" size={32} />}
                        title="All Paths Honored"
                        desc="Whether religious or personal, we provide the space for your unique connection."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={<Wind className="text-primary" size={32} />}
                        title="Breath of Life"
                        desc="Simplified routines that fit into your busy day, leaving room for what matters."
                        delay={0.6}
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="glass-card p-10 flex flex-col items-center text-center group cursor-default"
    >
        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-inner flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform duration-500">
            {icon}
        </div>
        <h3 className="text-2xl font-black mb-4 dark:text-white">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </motion.div>
);

export default LandingPage;

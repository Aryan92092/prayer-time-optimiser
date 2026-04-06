import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';

const EmailVerifiedPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); navigate('/login', { replace: true }); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center py-20 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="divine-glow glass-card p-12 w-full max-w-xl relative overflow-hidden text-center"
            >
                <motion.div
                    initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                >
                    <CheckCircle2 className="text-white" size={48} strokeWidth={2.5} />
                </motion.div>

                {[...Array(5)].map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [(i - 2) * 30, (i - 2) * 50], y: [-10, -60] }}
                        transition={{ duration: 1.5, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        className="absolute top-20 left-1/2 pointer-events-none">
                        <Sparkles size={14} className="text-saffron" />
                    </motion.div>
                ))}

                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">
                    Email Verified! 🎉
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-2 leading-relaxed">
                    Your account has been successfully verified. <br /> Welcome to your sacred journey.
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="text-xs text-slate-400 dark:text-slate-600 font-semibold uppercase tracking-widest mb-10">
                    Redirecting to login in <span className="text-primary font-black">{countdown}</span>s…
                </motion.p>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-10 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                        initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 10, ease: 'linear' }} />
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-divine text-white px-10 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95">
                        <ArrowLeft size={20} /> Go to Login
                    </Link>
                </motion.div>

                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
            </motion.div>
        </div>
    );
};

export default EmailVerifiedPage;

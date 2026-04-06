import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordReset } from '../services/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await sendPasswordReset(email);
            setSent(true);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center py-20 px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="divine-glow glass-card p-12 w-full max-w-xl relative overflow-hidden text-center">
                <AnimatePresence mode="wait">
                    {!sent ? (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <KeyRound className="text-white" size={30} />
                            </div>
                            <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Forgot Password?</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                            {error && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 text-sm font-black uppercase tracking-widest">
                                    {error}
                                </motion.div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-8 text-left">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Your Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
                                            placeholder="your@soul.com" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full bg-gradient-to-r from-primary to-purple-divine text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                    {submitting ? <><Loader2 size={20} className="animate-spin" /> Sending Link…</> : 'Send Reset Link'}
                                </button>
                            </form>
                            <p className="mt-10 text-slate-500 dark:text-slate-400 font-medium">
                                <Link to="/login" className="inline-flex items-center gap-1 text-primary font-black hover:text-purple-divine transition-colors">
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 14 }}>
                            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <CheckCircle2 className="text-white" size={40} />
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Check Your Inbox</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-2 leading-relaxed">We've sent a password reset link to</p>
                            <p className="text-primary font-black text-lg mb-8 break-all">{email}</p>
                            <p className="text-sm text-slate-400 dark:text-slate-600 mb-10 leading-relaxed">
                                Didn't receive it? Check your spam folder, or{' '}
                                <button onClick={() => setSent(false)} className="text-primary font-black hover:underline">try again</button>.
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-divine text-white px-10 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95">
                                <ArrowLeft size={20} /> Back to Login
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;

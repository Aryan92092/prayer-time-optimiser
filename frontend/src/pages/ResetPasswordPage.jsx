import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../services/authService';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    // Read the reset token from the URL: /reset-password?token=xxxx
    const resetToken = new URLSearchParams(window.location.search).get('token');
    const sessionReady = !!resetToken;

    const strength = (() => {
        if (password.length === 0) return null;
        if (password.length < 6) return { label: 'Weak', color: 'bg-red-400', width: '25%' };
        if (password.length < 10) return { label: 'Fair', color: 'bg-yellow-400', width: '55%' };
        if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password))
            return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
        return { label: 'Good', color: 'bg-primary', width: '75%' };
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        setSubmitting(true);
        try {
            await resetPassword(resetToken, password);
            setDone(true);
            setTimeout(() => navigate('/login', { replace: true }), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!sessionReady && !done) {
        return (
            <div className="min-h-[80vh] flex flex-col justify-center items-center py-20 px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="divine-glow glass-card p-12 w-full max-w-xl text-center">
                    <Loader2 size={40} className="animate-spin text-primary mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Verifying your reset link…</h2>
                    <p className="text-slate-500 dark:text-slate-400">Please wait, this only takes a moment.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center py-20 px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="divine-glow glass-card p-12 w-full max-w-xl relative overflow-hidden text-center">
                {done ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 14 }}>
                        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <CheckCircle2 className="text-white" size={40} />
                        </div>
                        <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Password Updated!</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">Your password has been successfully changed.</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 font-semibold uppercase tracking-widest">Redirecting to login…</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <ShieldCheck className="text-white" size={30} />
                        </div>
                        <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Set New Password</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">Choose a strong new password for your account.</p>
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 text-sm font-black uppercase tracking-widest">
                                {error}
                            </motion.div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-8 text-left">
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-5 pr-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
                                        placeholder="At least 8 characters" required />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {strength && (
                                    <div className="space-y-1 mt-1">
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <motion.div className={`h-full rounded-full ${strength.color}`} initial={{ width: '0%' }} animate={{ width: strength.width }} transition={{ duration: 0.3 }} />
                                        </div>
                                        <p className={`text-xs font-black ml-1 ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative">
                                    <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full px-6 py-5 pr-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
                                        placeholder="Repeat your password" required />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full bg-gradient-to-r from-primary to-purple-divine text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                {submitting ? <><Loader2 size={20} className="animate-spin" /> Updating…</> : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;

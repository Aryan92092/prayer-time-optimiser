import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register, user, loading } = useAuth();
    const navigate = useNavigate();

    // If already logged in, go straight to dashboard
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await register(formData);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="divine-glow glass-card p-12 w-full max-w-xl relative overflow-hidden text-center"
            >
                <div className="mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Heart className="text-white fill-white" size={32} />
                    </div>
                    <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Begin Your Path</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Create your sacred account to start your journey.</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 text-sm font-black uppercase tracking-widest"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">What shall we call you?</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                            placeholder="Your name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Connection</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Private Key</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-primary to-purple-divine text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {submitting ? (
                            <><Loader2 size={20} className="animate-spin" /> Creating Account...</>
                        ) : 'Create Your Sanctuary'}
                    </button>
                </form>

                <p className="mt-10 text-slate-500 dark:text-slate-400 font-medium">
                    Already a seeker? <Link to="/login" className="text-primary font-black hover:text-purple-divine transition-colors ml-1">Log in here</Link>
                </p>

                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -mr-16 -mb-16" />
            </motion.div>
        </div>
    );
};

export default RegisterPage;

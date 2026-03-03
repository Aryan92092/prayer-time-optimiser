import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
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
                    <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Step back into your sacred space.</p>
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

                <form onSubmit={handleSubmit} className="space-y-8 text-left">
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Connection</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
                            placeholder="your@soul.com"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Private Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-purple-divine text-white py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        Re-Enter Sanctuary
                    </button>
                </form>

                <p className="mt-12 text-slate-500 dark:text-slate-400 font-medium">
                    New seeker? <Link to="/register" className="text-primary font-black hover:text-purple-divine transition-colors ml-1">Begin Your Path</Link>
                </p>

                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -ml-16 -mb-16" />
            </motion.div>
        </div>
    );
};

export default LoginPage;

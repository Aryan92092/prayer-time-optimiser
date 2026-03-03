import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { setupProfile } from '../services/profileService';
import { createProgram } from '../services/programService';

const steps = [
    { id: 1, title: 'What brings you here?', field: 'overwhelm_reason' },
    { id: 2, title: 'Current stress level', field: 'stress_level' },
    { id: 3, title: 'Your life role', field: 'user_role' },
    { id: 4, title: 'Spiritual preference', field: 'spiritual_preference' },
    { id: 5, title: 'Program duration', field: 'duration_type' }
];

const OnboardingPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        overwhelm_reason: '',
        stress_level: 'moderate',
        user_role: 'student',
        spiritual_preference: 'non-religious',
        religion_type: '',
        duration_type: '1 week',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            const profileData = {
                stress_level: formData.stress_level,
                overwhelm_reason: formData.overwhelm_reason,
                spiritual_preference: formData.spiritual_preference,
                religion_type: formData.religion_type,
                user_role: formData.user_role,
            };

            // 1. Save spiritual profile to Supabase
            await setupProfile(user.id, profileData);

            // 2. Calculate end date and create program
            const days = formData.duration_type === '1 week' ? 7 : 14;
            const end = new Date();
            end.setDate(end.getDate() + days);

            await createProgram(
                user.id,
                {
                    start_date: formData.start_date,
                    end_date: end.toISOString().split('T')[0],
                    duration_type: formData.duration_type,
                },
                profileData
            );

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Onboarding failed: ' + err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-20 px-4">
            <div className="mb-12 flex items-center justify-center gap-2">
                {steps.map(s => (
                    <div
                        key={s.id}
                        className={`h-1.5 transition-all duration-500 rounded-full ${step >= s.id ? 'w-12 bg-primary' : 'w-6 bg-slate-200 dark:bg-slate-800'}`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="divine-glow glass-card p-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-purple-divine to-saffron" />

                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black dark:text-white tracking-tight leading-tight">What brings you to <br /><span className="text-primary italic">HopePath</span> today?</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Be honest with yourself. This is your safe space.</p>
                            <textarea
                                className="w-full p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary bg-slate-50 dark:bg-slate-900/50 text-xl h-48 resize-none dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium"
                                placeholder="Work load, personal loss, academic pressure..."
                                value={formData.overwhelm_reason}
                                onChange={(e) => setFormData({ ...formData, overwhelm_reason: e.target.value })}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl font-black dark:text-white tracking-tight">How heavy is your heart?</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Assess your current stress level.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['mild', 'moderate', 'severe'].map(lvl => (
                                    <button
                                        key={lvl}
                                        onClick={() => setFormData({ ...formData, stress_level: lvl })}
                                        className={`p-10 rounded-[2rem] border-2 font-black uppercase tracking-widest transition-all text-sm group ${formData.stress_level === lvl ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400 hover:border-primary/30'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full mx-auto mb-4 animate-pulse ${lvl === 'mild' ? 'bg-teal-aurora' : lvl === 'moderate' ? 'bg-saffron' : 'bg-red-500'}`} />
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black dark:text-white tracking-tight">Your life role</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['student', 'professional', 'parent'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setFormData({ ...formData, user_role: role })}
                                        className={`p-10 rounded-[2.5rem] border-2 font-black capitalize transition-all text-xl ${formData.user_role === role ? 'border-purple-divine bg-purple-divine text-white shadow-xl shadow-purple-divine/20' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400 hover:border-purple-divine/30'}`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-10">
                            <h2 className="text-4xl font-black dark:text-white tracking-tight text-center md:text-left">Choose your spiritual path</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <button
                                    onClick={() => setFormData({ ...formData, spiritual_preference: 'non-religious', religion_type: '' })}
                                    className={`p-10 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${formData.spiritual_preference === 'non-religious' ? 'border-teal-aurora bg-teal-aurora text-white shadow-xl shadow-teal-aurora/20' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400'}`}
                                >
                                    <div className="flex flex-col h-full justify-between gap-10">
                                        <div>
                                            <p className="font-black text-2xl mb-2">Non-Religious / Mindful</p>
                                            <p className={`text-sm font-medium ${formData.spiritual_preference === 'non-religious' ? 'text-white/80' : 'text-slate-500'}`}>Manifestation, deep gratitude, and breathing techniques.</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.spiritual_preference === 'non-religious' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                    </div>
                                </button>

                                <div className={`p-10 rounded-[2.5rem] border-2 transition-all ${formData.spiritual_preference === 'religious' ? 'border-saffron bg-saffron text-white shadow-xl shadow-saffron/20' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400'}`}>
                                    <button
                                        onClick={() => setFormData({ ...formData, spiritual_preference: 'religious' })}
                                        className="font-black text-2xl w-full text-left flex justify-between items-center group"
                                    >
                                        Religious Path
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.spiritual_preference === 'religious' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-saffron/10'}`}>
                                            <ArrowRight size={20} />
                                        </div>
                                    </button>

                                    <div className="mt-8 grid grid-cols-2 gap-3 h-32">
                                        {['hindu', 'muslim', 'sikh', 'christian'].map(rel => (
                                            <button
                                                key={rel}
                                                disabled={formData.spiritual_preference !== 'religious'}
                                                onClick={() => setFormData({ ...formData, religion_type: rel })}
                                                className={`py-3 px-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest capitalize transition-all ${formData.religion_type === rel ? 'bg-white text-saffron border-white' : 'border-white/20 hover:border-white/50 text-white/70'}`}
                                            >
                                                {rel}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-10">
                            <div className="text-center">
                                <h2 className="text-4xl font-black dark:text-white tracking-tight">Final Commitment</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">Select the duration of your first program.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {['1 week', '2 weeks'].map(dur => (
                                    <button
                                        key={dur}
                                        onClick={() => setFormData({ ...formData, duration_type: dur })}
                                        className={`py-14 rounded-[3rem] border-2 font-black uppercase tracking-widest transition-all text-xl ${formData.duration_type === dur ? 'border-primary bg-primary text-white shadow-2xl shadow-primary/30' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400 hover:border-primary/30'}`}
                                    >
                                        {dur}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-16 flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Previous
                            </button>
                        ) : <div />}

                        <button
                            onClick={step === 5 ? handleSubmit : handleNext}
                            className="bg-gradient-to-r from-primary via-purple-divine to-saffron text-white px-12 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 hover:-translate-y-1 active:scale-95"
                        >
                            {step === 5 ? 'Engrave My Path' : 'Continue Forward'}
                            <ArrowRight size={22} />
                        </button>
                    </div>

                    {/* Decorative blobs */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mb-32" />
                    <div className="absolute top-0 left-0 w-64 h-64 bg-saffron/5 rounded-full blur-[100px] -ml-32 -mt-32" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default OnboardingPage;

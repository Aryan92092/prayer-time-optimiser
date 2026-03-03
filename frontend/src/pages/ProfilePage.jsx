import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Shield, Bell, Heart, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, subscribeProfile } from '../services/profileService';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Fetch profile immediately then listen for real-time updates
        getProfile(user.id).then(data => {
            setProfile(data);
            setLoading(false);
        });

        const unsub = subscribeProfile(user.id, (data) => setProfile(data));
        return unsub;
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-primary border-t-saffron rounded-full animate-spin mb-6"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-20 px-4 space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8 px-4">
                <div className="w-32 h-32 bg-gradient-to-tr from-primary to-purple-divine rounded-[2.5rem] flex items-center justify-center shadow-2xl relative group">
                    <User size={64} className="text-white" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-saffron rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                        <Settings size={16} className="text-white animate-spin-slow" />
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-5xl font-black tracking-tight dark:text-white mb-2">{user?.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                        <Mail size={18} className="text-primary" />
                        {user?.email}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="divine-glow glass-card p-10 relative overflow-hidden"
                    >
                        <h2 className="text-3xl font-black mb-8 dark:text-white flex items-center gap-3">
                            <Shield className="text-primary" />
                            Spiritual Identity
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <ProfileField
                                label="Current Path"
                                value={profile?.spiritual_preference || 'Not Set'}
                                sub={profile?.religion_type || 'Mindful Focus'}
                            />
                            <ProfileField
                                label="Life Role"
                                value={profile?.user_role || 'Seeker'}
                                sub="Active Engagement"
                            />
                            <ProfileField
                                label="Heart Heavy"
                                value={profile?.stress_level || 'Moderate'}
                                sub="Internal State"
                            />
                            <ProfileField
                                label="Account Status"
                                value="Premium Elite"
                                sub="Sacred Access"
                            />
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <button
                                onClick={() => alert('Profile editing coming soon!')}
                                className="bg-gradient-to-r from-primary to-purple-divine text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Update Sacred Profile
                            </button>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Sync: Active</p>
                        </div>
                    </motion.div>

                    <div className="glass-card p-10 border-slate-100 dark:border-slate-800">
                        <h3 className="text-2xl font-black mb-6 dark:text-white">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Heart size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm dark:text-white">Completed Morning Reflection</p>
                                        <p className="text-xs text-slate-500 font-medium">{i} days ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-8 border-slate-100 dark:border-slate-800 bg-gradient-to-b from-primary/5 to-transparent">
                        <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
                            <Bell className="text-saffron" size={20} />
                            Sanctuary Settings
                        </h3>
                        <div className="space-y-6">
                            <ToggleItem label="Divine Reminders" active={true} />
                            <ToggleItem label="Daily Quotes" active={true} />
                            <ToggleItem label="Community Spirit" active={false} />
                            <ToggleItem label="Public Profile" active={false} />
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                        <h3 className="text-xl font-black mb-4 relative z-10">Premium Support</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 font-medium">Connect with our guides for personalized spiritual optimization.</p>
                        <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all relative z-10">
                            Sacred Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileField = ({ label, value, sub }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black dark:text-white capitalize">{value}</p>
        <p className="text-xs font-medium text-slate-500">{sub}</p>
    </div>
);

const ToggleItem = ({ label, active }) => (
    <div className="flex items-center justify-between group">
        <span className="text-sm font-bold dark:text-slate-300 group-hover:text-primary transition-colors">{label}</span>
        <div className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
        </div>
    </div>
);

export default ProfilePage;

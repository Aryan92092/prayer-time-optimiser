import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Shield, Bell, Heart, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, setupProfile, subscribeProfile } from '../services/profileService';
import { cancelActiveProgram, createProgram } from '../services/programService';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        spiritual_preference: 'non-religious',
        religion_type: '',
        duration_type: '1 week'
    });

    // Sanctuary settings state
    const [sanctuary, setSanctuary] = useState({
        divineReminders: true,
        dailyQuotes: true,
        communitySpirit: false,
        publicProfile: false,
    });
    const toggleSanctuary = (key) => setSanctuary(prev => ({ ...prev, [key]: !prev[key] }));

    useEffect(() => {
        if (!user) return;

        // Fetch profile immediately then listen for real-time updates
        getProfile(user.id).then(data => {
            setProfile(data);
            if (data) {
                setEditForm({
                    spiritual_preference: data.spiritual_preference || 'non-religious',
                    religion_type: data.religion_type || '',
                    duration_type: data.duration_type || '1 week' // fallback if not in profile
                });
            }
            setLoading(false);
        });

        const unsub = subscribeProfile(user.id, (data) => {
            setProfile(data);
            if (data && !isEditing) {
                setEditForm({
                    spiritual_preference: data.spiritual_preference || 'non-religious',
                    religion_type: data.religion_type || '',
                    duration_type: data.duration_type || '1 week'
                });
            }
        });
        return unsub;
    }, [user, isEditing]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // 1. Update Core Profile
            const updatedData = {
                ...profile,
                spiritual_preference: editForm.spiritual_preference,
                religion_type: editForm.religion_type
            };
            await setupProfile(user.id, updatedData);

            // 2. Cancel entirely old schedule
            await cancelActiveProgram(user.id);

            // 3. Create fresh new schedule & program based on new duration/religion
            const days = editForm.duration_type === '1 week' ? 7 : 14;
            const start = new Date();
            const end = new Date();
            end.setDate(end.getDate() + days - 1); // 7 days means today + 6 days future

            await createProgram(
                user.id,
                {
                    start_date: start.toISOString().split('T')[0],
                    end_date: end.toISOString().split('T')[0],
                    duration_type: editForm.duration_type,
                },
                updatedData
            );

            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update profile: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

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
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black dark:text-white flex items-center gap-3">
                                <Shield className="text-primary" />
                                Spiritual Identity
                            </h2>
                            {isEditing && (
                                <button
                                    onClick={handleEditToggle}
                                    className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <ProfileField
                                            label="Current Path"
                                            value={profile?.spiritual_preference || 'Not Set'}
                                            sub={profile?.religion_type?.replace(/_/g, ' ') || 'Mindful Focus'}
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

                                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                        <button
                                            onClick={handleEditToggle}
                                            className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-divine text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            Update Sacred Profile
                                        </button>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Sync: Active</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Spiritual Path Selection */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold dark:text-white">Choose New Path</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setEditForm({ ...editForm, spiritual_preference: 'non-religious', religion_type: '' })}
                                                className={`p-6 rounded-[2rem] border-2 text-left transition-all ${editForm.spiritual_preference === 'non-religious' ? 'border-teal-aurora bg-teal-aurora text-white shadow-xl shadow-teal-aurora/20' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400'}`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-black text-xl">Mindful Focus</p>
                                                    {editForm.spiritual_preference === 'non-religious' && <CheckCircle2 size={20} />}
                                                </div>
                                                <p className="text-xs font-medium opacity-80">Gratitude and breathing techniques.</p>
                                            </button>

                                            <button
                                                onClick={() => setEditForm({ ...editForm, spiritual_preference: 'religious' })}
                                                className={`p-6 rounded-[2rem] border-2 text-left transition-all ${editForm.spiritual_preference === 'religious' ? 'border-saffron bg-saffron text-white shadow-xl shadow-saffron/20' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400'}`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-black text-xl">Religious Path</p>
                                                    {editForm.spiritual_preference === 'religious' && <CheckCircle2 size={20} />}
                                                </div>
                                                <p className="text-xs font-medium opacity-80">Follow ancient daily rituals.</p>
                                            </button>
                                        </div>

                                        {/* Categories List */}
                                        {editForm.spiritual_preference === 'religious' && (
                                            <div className="mt-6 p-6 rounded-[2rem] border-2 border-saffron bg-saffron/5 dark:bg-saffron/10 max-h-[350px] overflow-y-auto custom-scrollbar space-y-6">
                                                {[
                                                    { category: "Abrahamic", religions: ['christian', 'muslim', 'judaism', 'bahai', 'druze', 'samaritanism'] },
                                                    { category: "Dharmic", religions: ['hindu', 'buddhism', 'jainism', 'sikh', 'ayyavazhi'] },
                                                    { category: "East Asian", religions: ['taoism', 'confucianism', 'shinto', 'chinese_folk', 'tenrikyo'] },
                                                    { category: "Indigenous & Tribal", religions: ['african_traditional', 'native_american', 'australian_aboriginal', 'maori', 'shamanism', 'amazonian', 'inuit', 'pacific_island'] },
                                                    { category: "Iranian", religions: ['zoroastrianism', 'yazidism', 'manichaeism', 'zurvanism'] },
                                                    { category: "New Movements", religions: ['scientology', 'raelism', 'falun_gong', 'unification_church', 'eckankar'] },
                                                    { category: "Philosophical / Non-theistic", religions: ['atheism', 'agnosticism', 'humanism', 'stoicism', 'existentialism'] }
                                                ].map(group => (
                                                    <div key={group.category} className="space-y-3">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                                                            {group.category}
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                            {group.religions.map(rel => (
                                                                <button
                                                                    key={rel}
                                                                    onClick={() => setEditForm(prev => ({ ...prev, religion_type: rel }))}
                                                                    className={`py-2 px-2 rounded-xl border-2 font-bold text-[10px] sm:text-xs tracking-wider capitalize transition-all ${editForm.religion_type === rel
                                                                        ? 'bg-saffron text-white border-saffron shadow-md'
                                                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-saffron/50'
                                                                        }`}
                                                                >
                                                                    {rel.replace(/_/g, ' ')}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Duration Selection */}
                                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xl font-bold dark:text-white">Program Duration</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['1 week', '2 weeks'].map(dur => (
                                                <button
                                                    key={dur}
                                                    onClick={() => setEditForm({ ...editForm, duration_type: dur })}
                                                    className={`py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-sm transition-all ${editForm.duration_type === dur ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-slate-400'}`}
                                                >
                                                    {dur}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving || (editForm.spiritual_preference === 'religious' && !editForm.religion_type)}
                                            className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isSaving ? 'Configuring Path...' : 'Save & Restructure Schedule'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                            <ToggleItem label="Divine Reminders" active={sanctuary.divineReminders} onClick={() => toggleSanctuary('divineReminders')} />
                            <ToggleItem label="Daily Quotes" active={sanctuary.dailyQuotes} onClick={() => toggleSanctuary('dailyQuotes')} />
                            <ToggleItem label="Community Spirit" active={sanctuary.communitySpirit} onClick={() => toggleSanctuary('communitySpirit')} />
                            <ToggleItem label="Public Profile" active={sanctuary.publicProfile} onClick={() => toggleSanctuary('publicProfile')} />
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                        <h3 className="text-xl font-black mb-4 relative z-10">Premium Support</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 font-medium">Connect with our guides for personalized spiritual optimization.</p>
                        <button
                            onClick={() => alert('🕊️ Sacred Chat is coming soon! Our spiritual guides will be available in the next update.')}
                            className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all relative z-10"
                        >
                            Sacred Chat — Coming Soon
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

const ToggleItem = ({ label, active, onClick }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
        <span className="text-sm font-bold dark:text-slate-300 group-hover:text-primary transition-colors select-none">{label}</span>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
        </div>
    </div>
);

export default ProfilePage;

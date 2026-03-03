import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, Sun, Moon, User } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
            <div className="glass-card px-8 py-4 flex justify-between items-center border-white/20 dark:border-white/5 !rounded-full shadow-2xl">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-saffron rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <Heart className="text-white fill-white" size={20} />
                    </div>
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-saffron dark:from-primary-light dark:to-gold-divine tracking-tight">
                        HopePath
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-8">
                                <NavLink to="/dashboard" label="Dashboard" />
                                <NavLink to="/journal" label="Journal" />
                                <NavLink to="/profile" label="Profile" />
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block" />

                            <div className="flex items-center gap-4">
                                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-500 font-bold transition-colors text-sm px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                                >
                                    <LogOut size={16} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-5">
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary font-bold transition-colors">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-primary to-purple-divine text-white px-8 py-3 rounded-full font-black hover:shadow-xl hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                            >
                                Begin Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, label }) => (
    <Link
        to={to}
        className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light font-black text-sm tracking-wide uppercase transition-colors relative group"
    >
        {label}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
    </Link>
);

const ThemeToggle = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
    >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
);

export default Navbar;

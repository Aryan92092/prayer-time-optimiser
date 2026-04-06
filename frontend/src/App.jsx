import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import EmailVerifiedPage from './pages/EmailVerifiedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { TimerProvider } from './context/TimerContext';
import FocusTimerModal from './components/FocusTimerModal';
import TaskDetailsPage from './pages/TaskDetailsPage';
import MoodCheckInPage from './pages/MoodCheckInPage';
import HealingPage from './pages/HealingPage';

// Shows a nice spinner while session is being restored
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <div className="w-14 h-14 border-4 border-primary border-t-saffron rounded-full animate-spin" />
      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Aligning Your Spirit...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Redirects logged-in users away from public auth pages
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // don't flash redirect
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <AuthProvider>
      <TimerProvider>
        <Router>
          <div className="min-h-screen transition-colors duration-500 selection:bg-primary/30 relative">
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
                <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
                <Route path="/email-verified" element={<EmailVerifiedPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mood-checkin"
                  element={
                    <ProtectedRoute>
                      <MoodCheckInPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/task/:taskId"
                  element={
                    <ProtectedRoute>
                      <TaskDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/journal"
                  element={
                    <ProtectedRoute>
                      <JournalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/healing"
                  element={
                    <ProtectedRoute>
                      <HealingPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Global Timer Modal */}
            <FocusTimerModal />
          </div>
        </Router>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;

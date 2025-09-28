import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/ui/Loading';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProfileForm } from './components/profile/ProfileForm';
import { DietPlanner } from './components/diet/DietPlanner';
import { WorkoutPlanner } from './components/workout/WorkoutPlanner';
import { ProgressTracker } from './components/progress/ProgressTracker';

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex min-h-screen items-center justify-center p-6">
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfileForm />;
      case 'diet':
        return <DietPlanner />;
      case 'workout':
        return <WorkoutPlanner />;
      case 'progress':
        return <ProgressTracker />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
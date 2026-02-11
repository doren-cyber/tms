
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UserRole } from './types';
import { Dashboard } from './views/Dashboard';
import { Bookings } from './views/Bookings';
import { Approvals } from './views/Approvals';
import { TransportOps } from './views/TransportOps';
import { Settings } from './views/Settings';
import { Reports } from './views/Reports';
import { Vehicles } from './views/Vehicles';
import { Drivers } from './views/Drivers';
import { HTMService } from './store';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('htm_user');
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      HTMService.setCurrentUser(user);
    }
  }, []);

  const handleLogin = (user: any) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setCurrentUser(user);
      HTMService.setCurrentUser(user);
      localStorage.setItem('htm_user', JSON.stringify(user));
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('htm_user');
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 z-10 relative">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-200">H</div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">HTM-VBS</h1>
            <p className="text-slate-500 mt-3 font-medium text-sm">Enterprise Hospital Transport</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-4">Select Access Portal</p>
            {HTMService.getAllUsers().map((user) => (
              <button
                key={user.id}
                disabled={isLoggingIn}
                onClick={() => handleLogin(user)}
                className={`w-full group flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all ${isLoggingIn ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-blue-500 transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
          
          {isLoggingIn && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Verifying Credentials</p>
            </div>
          )}

          <div className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
            Hospital IT Infrastructure Group &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'bookings': return <Bookings />;
      case 'approvals': return <Approvals />;
      case 'transport-ops': return <TransportOps />;
      case 'vehicles': return <Vehicles />;
      case 'drivers': return <Drivers />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;

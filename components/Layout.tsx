
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Icons, COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onViewChange, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard, roles: [UserRole.STAFF, UserRole.DEPT_HEAD, UserRole.OPERATOR, UserRole.TRANSPORT_HEAD, UserRole.ADMIN] },
    { id: 'bookings', label: 'My Bookings', icon: Icons.Booking, roles: [UserRole.STAFF, UserRole.DEPT_HEAD] },
    { id: 'approvals', label: 'Approvals', icon: Icons.Check, roles: [UserRole.DEPT_HEAD, UserRole.ADMIN] },
    { id: 'transport-ops', label: 'Operations', icon: Icons.Vehicle, roles: [UserRole.OPERATOR, UserRole.TRANSPORT_HEAD, UserRole.ADMIN] },
    { id: 'vehicles', label: 'Vehicles', icon: Icons.Vehicle, roles: [UserRole.TRANSPORT_HEAD, UserRole.ADMIN] },
    { id: 'drivers', label: 'Drivers', icon: Icons.Driver, roles: [UserRole.TRANSPORT_HEAD, UserRole.ADMIN] },
    { id: 'reports', label: 'Reports', icon: Icons.Report, roles: [UserRole.TRANSPORT_HEAD, UserRole.ADMIN] },
    { id: 'settings', label: 'Settings', icon: Icons.Settings, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col h-full`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">H</div>
          {isSidebarOpen && <span className="text-white font-bold tracking-tight text-xl">HTM-VBS</span>}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                currentView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Icons.LogOut />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {menuItems.find(i => i.id === currentView)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Icons.Bell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

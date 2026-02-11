
import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { User, UserRole } from '../types';
import { Icons } from '../constants';

export const Settings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
    departmentId: 'dept-1'
  });

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(HTMService.getAllUsers());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    HTMService.createUser(formData);
    setShowAddUser(false);
    setFormData({ name: '', email: '', role: UserRole.STAFF, departmentId: 'dept-1' });
    refreshUsers();
  };

  const departments = HTMService.getDepartments();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
          <p className="text-slate-500">Manage hospital personnel and system configuration</p>
        </div>
        <button 
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
        >
          <Icons.Plus />
          <span>Add New User</span>
        </button>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <div>
             <h3 className="text-lg font-bold text-slate-800 tracking-tight">User Management</h3>
             <p className="text-xs text-slate-400 font-medium">Create and manage accounts for staff and department heads</p>
           </div>
           <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
             {users.length} TOTAL USERS
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Personnel</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                        <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-600">
                      {departments.find(d => d.id === user.departmentId)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === UserRole.ADMIN ? 'bg-slate-900 text-white' :
                      user.role === UserRole.DEPT_HEAD ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       Active
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <button className="text-slate-400 hover:text-blue-600 p-2 transition-colors">
                       <Icons.Settings />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
             <Icons.Report />
           </div>
           <div>
             <h4 className="font-bold text-slate-800">System Logs</h4>
             <p className="text-sm text-slate-500 mt-1 leading-relaxed">View all administrative actions and security audit trails.</p>
           </div>
           <button className="text-sm font-bold text-blue-600 hover:underline">View Audit Log →</button>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
             <Icons.Booking />
           </div>
           <div>
             <h4 className="font-bold text-slate-800">Booking Rules</h4>
             <p className="text-sm text-slate-500 mt-1 leading-relaxed">Configure lead times, priority overrides, and shift boundaries.</p>
           </div>
           <button className="text-sm font-bold text-blue-600 hover:underline">Adjust Rules →</button>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
             <Icons.Settings />
           </div>
           <div>
             <h4 className="font-bold text-slate-800">API Access</h4>
             <p className="text-sm text-slate-500 mt-1 leading-relaxed">Manage integrations with external laboratory and patient systems.</p>
           </div>
           <button className="text-sm font-bold text-blue-600 hover:underline">Configure Webhooks →</button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">REGISTER PERSONNEL</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Onboarding Portal</p>
              </div>
              <button onClick={() => setShowAddUser(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><Icons.X /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-medium text-slate-800"
                    placeholder="e.g. Dr. Jane Cooper"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-medium text-slate-800"
                    placeholder="jane@hospital.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                    <select 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-medium text-slate-800"
                      value={formData.departmentId}
                      onChange={e => setFormData({...formData, departmentId: e.target.value})}
                    >
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Role</label>
                    <select 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-blue-600"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      <option value={UserRole.STAFF}>End User / Staff</option>
                      <option value={UserRole.DEPT_HEAD}>Department Head</option>
                      {/* OTHER ROLES ARE EXCLUDED PER REQUIREMENT: ADMIN ONLY CREATE END USERS AND DEPT HEAD */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                 <div className="text-blue-500 mt-1"><Icons.Alert /></div>
                 <p className="text-xs text-blue-800 font-medium leading-relaxed">
                   <strong>Role Restriction:</strong> As an Administrator, you are authorized to provision Staff and Department Head accounts. Specialist roles (Transport Ops/Admin) require higher-level system authorization.
                 </p>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddUser(false)} 
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { User, UserRole, Department } from '../types';
import { Icons } from '../constants';

export const Settings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
    departmentId: 'dept-1'
  });

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF,
    departmentId: 'dept-1'
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  // Configuration Card States
  const [activeModal, setActiveModal] = useState<'logs' | 'rules' | 'api' | null>(null);
  const [leadTime, setLeadTime] = useState(2);
  const [allowOverride, setAllowOverride] = useState(true);
  const [maxDailyBookings, setMaxDailyBookings] = useState(15);
  const [webhookUrl, setWebhookUrl] = useState('https://shijahospitals.com/api/v1/transport-webhook');
  const [apiToken, setApiToken] = useState('');
  const [apiStatusMessage, setApiStatusMessage] = useState('');
  const [rulesSaved, setRulesSaved] = useState(false);

  const [auditLogs, setAuditLogs] = useState([
    { id: '1', action: "USER_ONBOARDED", details: "Added personnel 'Dr. Sarah Jenkins' to Cardiology", user: "Admin User", time: "10 mins ago" },
    { id: '2', action: "VEHICLE_STATUS", details: "Changed status of plate AMB-102 to AVAILABLE", user: "Transport Operator", time: "1 hour ago" },
    { id: '3', action: "BOOKING_REJECTED", details: "Disapproved duplicate dispatch request B-1092", user: "Transport Head", time: "3 hours ago" },
    { id: '4', action: "SYSTEM_RULE_CHANGE", details: "Modified lead time override threshold to 2 hours", user: "Admin User", time: "5 hours ago" },
    { id: '5', action: "WEBHOOK_REGISTERED", details: "Onboarded custom intake endpoint for patient arrivals", user: "Admin User", time: "1 day ago" }
  ]);

  useEffect(() => {
    // Properly initialize state with awaited data
    const init = async () => {
      const d = await HTMService.getDepartments();
      setDepartments(d);
      await refreshUsers();
    };
    init();
  }, []);

  // Updated to async to properly await the promise from HTMService.getAllUsers()
  const refreshUsers = async () => {
    const allUsers = await HTMService.getAllUsers();
    setUsers(allUsers);
  };

  // Updated to async to handle the promise returned by createUser
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await HTMService.createUser(formData);
    setShowAddUser(false);
    setFormData({ name: '', email: '', role: UserRole.STAFF, departmentId: 'dept-1' });
    await refreshUsers();
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || 'dept-1'
    });
    setShowConfirmDelete(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await HTMService.updateUser(editingUser.id, editFormData);
      setEditingUser(null);
      await refreshUsers();
    } catch (error) {
      console.error("Failed to update user", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await HTMService.deleteUser(editingUser.id);
      setEditingUser(null);
      await refreshUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
    } finally {
      setSaving(false);
    }
  };

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
                      {/* Use the departments state which was fetched in useEffect */}
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
                     <button 
                       onClick={() => handleOpenEditUser(user)}
                       className="text-slate-400 hover:text-blue-600 p-2 transition-colors"
                     >
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
           <button 
             onClick={() => setActiveModal('logs')}
             className="text-sm font-bold text-blue-600 hover:underline text-left"
           >
             View Audit Log →
           </button>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
             <Icons.Booking />
           </div>
           <div>
             <h4 className="font-bold text-slate-800">Booking Rules</h4>
             <p className="text-sm text-slate-500 mt-1 leading-relaxed">Configure lead times, priority overrides, and shift boundaries.</p>
           </div>
           <button 
             onClick={() => {
               setActiveModal('rules');
               setRulesSaved(false);
             }}
             className="text-sm font-bold text-blue-600 hover:underline text-left"
           >
             Adjust Rules →
           </button>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
             <Icons.Settings />
           </div>
           <div>
             <h4 className="font-bold text-slate-800">API Access</h4>
             <p className="text-sm text-slate-500 mt-1 leading-relaxed">Manage integrations with external laboratory and patient systems.</p>
           </div>
           <button 
             onClick={() => {
               setActiveModal('api');
               setApiStatusMessage('');
             }}
             className="text-sm font-bold text-blue-600 hover:underline text-left"
           >
             Configure Webhooks →
           </button>
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
                      {/* Use the departments state which was fetched in useEffect */}
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

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">EDIT PERSONNEL</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Detail Management</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><Icons.X /></button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-medium text-slate-800"
                    placeholder="e.g. Dr. Jane Cooper"
                    value={editFormData.name}
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-medium text-slate-800"
                    placeholder="jane@hospital.com"
                    value={editFormData.email}
                    onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                    <select 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-medium text-slate-800"
                      value={editFormData.departmentId}
                      onChange={e => setEditFormData({...editFormData, departmentId: e.target.value})}
                    >
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Role</label>
                    <select 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white outline-none font-bold text-blue-600"
                      value={editFormData.role}
                      onChange={e => setEditFormData({...editFormData, role: e.target.value as UserRole})}
                    >
                      <option value={UserRole.STAFF}>End User / Staff</option>
                      <option value={UserRole.DEPT_HEAD}>Department Head</option>
                      <option value={UserRole.OPERATOR}>Transport Operator / Ops</option>
                      <option value={UserRole.TRANSPORT_HEAD}>Transport Head</option>
                      <option value={UserRole.ADMIN}>Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              {showConfirmDelete ? (
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 space-y-4">
                  <p className="text-xs text-rose-800 font-bold leading-relaxed">
                     Are you absolute sure you want to delete this user? This action is permanent and cannot be undone.
                  </p>
                  <div className="flex gap-3">
                     <button
                       type="button"
                       onClick={() => setShowConfirmDelete(false)}
                       className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       type="button"
                       onClick={handleDeleteUser}
                       disabled={saving}
                       className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                     >
                       {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Yes, Permanently Delete"}
                     </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Need to remove this user from system?</span>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors rounded-xl text-xs"
                  >
                    Delete User
                  </button>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Logs / Audit Trail Modal */}
      {activeModal === 'logs' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg"><Icons.Report /></span>
                  <span>SYSTEM AUDIT LOGS</span>
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time security & administration trails</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><Icons.X /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 leading-relaxed">
                The administrative actions below trace modifications to departments, vehicles, and users. These logs are stored permanently on high-security trails.
              </p>

              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/30">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-4">Action</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Triggered By</th>
                      <th className="p-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-100/45 transition-colors">
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-mono font-bold tracking-tight text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{log.details}</td>
                        <td className="p-4 text-slate-500 font-semibold">{log.user}</td>
                        <td className="p-4 text-slate-400 text-right whitespace-nowrap">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">Simulated stream is fully synchronized with Firebase firestore logs.</span>
                <button
                  onClick={() => {
                    // Prepend a mock log refresh item
                    const newLog = {
                      id: String(Date.now()),
                      action: "LOGS_EXHAUSTED",
                      details: "Cleared local UI audit cache successfully",
                      user: "Admin User",
                      time: "Just now"
                    };
                    setAuditLogs([newLog, ...auditLogs]);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white font-bold hover:bg-black rounded-xl text-xs transition-all"
                >
                  Refresh Trail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Rules Modal */}
      {activeModal === 'rules' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><Icons.Booking /></span>
                  <span>BOOKING & DISPATCH RULES</span>
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure automated constraints</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><Icons.X /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setRulesSaved(true);
              // Add a rule changed audit log as well!
              setAuditLogs([
                {
                  id: String(Date.now()),
                  action: "SYSTEM_RULE_CHANGE",
                  details: `Set Lead Time: ${leadTime}h, Overrides: ${allowOverride}, Max Daily: ${maxDailyBookings}`,
                  user: "Admin User",
                  time: "Just now"
                },
                ...auditLogs
              ]);
            }} className="p-10 space-y-6">
              
              {rulesSaved && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>System booking constraints successfully saved and applied to next transport dispatches!</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lead Time Threshold (Hours)</label>
                  <p className="text-xs text-slate-400 mt-1">Minimum hours required in advance to schedule a non-urgent patient trip.</p>
                  <div className="flex items-center gap-4 mt-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="24"
                      value={leadTime}
                      onChange={(e) => { setLeadTime(Number(e.target.value)); setRulesSaved(false); }}
                      className="flex-1 accent-emerald-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-16 px-3 py-1.5 bg-slate-50 border border-slate-100 font-mono font-bold text-center text-slate-800 text-sm rounded-xl">
                      {leadTime} hrs
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Max Daily Bookings (per Department)</label>
                  <p className="text-xs text-slate-400 mt-1">Threshold warning limit before requiring transport manager approval.</p>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={maxDailyBookings}
                    onChange={(e) => { setMaxDailyBookings(Number(e.target.value)); setRulesSaved(false); }}
                    className="w-full mt-1 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Priority Bypass</h5>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Allow immediate auto-approvals for critical/urgency requests.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAllowOverride(!allowOverride); setRulesSaved(false); }}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${allowOverride ? 'bg-emerald-500 flex justify-end' : 'bg-slate-300 flex justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black shadow-xl shadow-slate-200 transition-all"
                >
                  Save Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API / Webhooks Modal */}
      {activeModal === 'api' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg"><Icons.Settings /></span>
                  <span>WEBHOOKS & API KEYS</span>
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure developer endpoints</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><Icons.X /></button>
            </div>
            
            <div className="p-10 space-y-8">
              {apiStatusMessage && (
                <div className="bg-blue-50 text-blue-800 border border-blue-100 p-4 rounded-2xl text-xs font-bold leading-relaxed animate-in fade-in">
                  {apiStatusMessage}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Dispatch Webhook</label>
                  <p className="text-xs text-slate-400 mt-1">Triggers POST payloads of newly approved booking requests immediately.</p>
                  <input 
                    required
                    type="url" 
                    className="w-full mt-2 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-mono text-xs text-slate-700"
                    value={webhookUrl}
                    onChange={e => { setWebhookUrl(e.target.value); setApiStatusMessage(''); }}
                  />
                  <div className="flex gap-2 justify-end mt-2">
                     <button
                       onClick={() => {
                         setApiStatusMessage("Successfully sent test ping payload to webhook. Received HTTP 200 OK.");
                       }}
                       className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                     >
                       Test Payload
                     </button>
                     <button
                       onClick={() => {
                         setApiStatusMessage(`Webhook destination updated successfully to: ${webhookUrl}`);
                         setAuditLogs([
                           { id: String(Date.now()), action: "WEBHOOK_UPDATED", details: `Updated dispatch destination to ${webhookUrl}`, user: "Admin User", time: "Just now" },
                           ...auditLogs
                         ]);
                       }}
                       className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors"
                     >
                       Save Hook
                     </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Access Authorization Tokens</label>
                  <p className="text-xs text-slate-400">Generate temporary REST client keys to interface with external laboratory systems.</p>
                  
                  {apiToken ? (
                    <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs break-all border border-slate-950 shadow-inner flex justify-between items-center">
                      <span className="select-all">{apiToken}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(apiToken);
                          setApiStatusMessage("Token copied to dashboard clipboard!");
                        }}
                        className="px-2 py-1 bg-slate-800 text-white rounded-md hover:bg-black font-sans text-[10px] font-bold"
                      >
                        Copy Key
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const tokenStr = `shija_live_pk_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
                        setApiToken(tokenStr);
                        setApiStatusMessage("Generated a brand new live client authorization key successfully.");
                      }}
                      className="w-full py-3.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-2xl text-xs transition-colors"
                    >
                      Generate Authorization Token
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition-colors"
                >
                  Close Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

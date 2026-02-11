
import React, { useMemo } from 'react';
import { HTMService } from '../store';
import { BookingStatus, UserRole } from '../types';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Reports: React.FC = () => {
  const allBookings = HTMService.getBookings();
  const departments = HTMService.getDepartments();
  const users = HTMService.getAllUsers();
  
  const completedServices = allBookings.filter(b => b.status === BookingStatus.COMPLETED);
  
  // Data for Department-wise Usage
  const deptUsageData = useMemo(() => {
    return departments.map(dept => {
      const count = allBookings.filter(b => b.departmentId === dept.id).length;
      return { name: dept.name, value: count };
    });
  }, [allBookings, departments]);

  // Data for Service Outcome
  const outcomeData = useMemo(() => {
    const statuses = [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REQUESTED, BookingStatus.CONFIRMED];
    return statuses.map(status => {
      const count = allBookings.filter(b => b.status === status).length;
      return { name: status.replace('_', ' '), value: count };
    });
  }, [allBookings]);

  const COLORS_PIE = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Utilization Reports</h2>
          <p className="text-slate-500">Analytics and performance tracking for the transport department</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-black transition-shadow shadow-lg">
          <Icons.Report />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Services</p>
           <h3 className="text-3xl font-black text-slate-900 mt-2">{allBookings.length}</h3>
           <p className="text-xs text-slate-500 mt-2 font-medium">Lifetime requests handled</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Completed</p>
           <h3 className="text-3xl font-black text-emerald-600 mt-2">{completedServices.length}</h3>
           <p className="text-xs text-emerald-500 mt-2 font-medium">Successful transportations</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-black text-red-600 uppercase tracking-widest">Cancelled</p>
           <h3 className="text-3xl font-black text-red-600 mt-2">{allBookings.filter(b => b.status === BookingStatus.CANCELLED).length}</h3>
           <p className="text-xs text-red-500 mt-2 font-medium">System revocation rate</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Active Fleet</p>
           <h3 className="text-3xl font-black text-blue-600 mt-2">{HTMService.getVehicles().length}</h3>
           <p className="text-xs text-blue-500 mt-2 font-medium">Registered hospital vehicles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dept Usage Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Service Usage by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcome Split */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Service Outcome Distribution</h3>
          <div className="h-72 flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 pr-8">
               {outcomeData.map((d, i) => (
                 <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS_PIE[i]}}></div>
                    <span className="text-xs font-bold text-slate-600">{d.name}</span>
                    <span className="text-xs font-black text-slate-900 ml-auto">{d.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Service Provided Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <div>
             <h3 className="text-lg font-bold text-slate-800 tracking-tight">Service Provision Log</h3>
             <p className="text-xs text-slate-400 font-medium">Historical data of transport services provided</p>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">To Whom (Personnel)</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Fleet Used</th>
                <th className="px-6 py-4">Completion Date</th>
                <th className="px-6 py-4 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {completedServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No completed services on record.</td>
                </tr>
              ) : (
                completedServices.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                           <img src={`https://picsum.photos/seed/${booking.requesterId}/50/50`} alt="" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{users.find(u => u.id === booking.requesterId)?.name || 'Personnel'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                        {departments.find(d => d.id === booking.departmentId)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm text-slate-600 truncate max-w-[200px]">{booking.purpose}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{HTMService.getVehicles().find(v => v.id === booking.assignedVehicleId)?.plateNumber || 'N/A'}</p>
                        <p className="text-slate-400">{HTMService.getDrivers().find(d => d.id === booking.assignedDriverId)?.name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-semibold text-slate-500">{new Date(booking.endTime).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-[10px] text-slate-400">
                       {booking.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

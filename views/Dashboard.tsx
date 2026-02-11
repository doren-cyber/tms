
import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { Icons } from '../constants';
import { HTMService } from '../store';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', bookings: 40, trips: 24 },
  { name: 'Tue', bookings: 30, trips: 13 },
  { name: 'Wed', bookings: 20, trips: 38 },
  { name: 'Thu', bookings: 27, trips: 39 },
  { name: 'Fri', bookings: 18, trips: 48 },
  { name: 'Sat', bookings: 23, trips: 38 },
  { name: 'Sun', bookings: 34, trips: 43 },
];

export const Dashboard: React.FC = () => {
  const stats = HTMService.getStats();
  const user = HTMService.getCurrentUser();
  const authorizedBookings = HTMService.getAuthorizedBookings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title={user.role === UserRole.DEPT_HEAD ? "Dept. Bookings" : "Total Bookings"} 
          value={stats.totalBookings} 
          icon={<Icons.Booking />} 
          color="bg-blue-600" 
          trend="+12%" 
          trendUp={true} 
        />
        <DashboardCard 
          title="Pending Approvals" 
          value={stats.pendingApprovals} 
          icon={<Icons.Check />} 
          color="bg-amber-500" 
        />
        <DashboardCard 
          title="Active Trips" 
          value={stats.activeTrips} 
          icon={<Icons.Vehicle />} 
          color="bg-emerald-500" 
          trend={`${stats.activeTrips} ongoing`} 
          trendUp={true}
        />
        <DashboardCard 
          title="Vehicles Available" 
          value={stats.availableVehicles} 
          icon={<Icons.Search />} 
          color="bg-slate-700" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Booking Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="trips" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Transport Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="trips" stroke="#22c55e" fillOpacity={1} fill="url(#colorTrips)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {user.role === UserRole.DEPT_HEAD ? "Departmental Requests" : "Recent Transport Requests"}
          </h3>
          <button className="text-blue-600 font-semibold text-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Pickup / Drop</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {authorizedBookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-medium text-slate-500">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${booking.requesterId}/50/50`} alt="" />
                      </div>
                      <span className="font-semibold text-slate-700">
                        {HTMService.getAllUsers().find(u => u.id === booking.requesterId)?.name || 'Personnel'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <p className="text-slate-400">From: <span className="text-slate-700 font-medium">{booking.pickupLocation}</span></p>
                      <p className="text-slate-400">To: <span className="text-slate-700 font-medium">{booking.dropLocation}</span></p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700' : 
                      booking.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 
                      booking.status === 'ON_TRIP' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {booking.priority}
                    </span>
                  </td>
                </tr>
              ))}
              {authorizedBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No active transport requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

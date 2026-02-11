
import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { Booking, BookingStatus, PriorityLevel } from '../types';
import { Icons } from '../constants';

export const Approvals: React.FC = () => {
  const [pending, setPending] = useState<Booking[]>([]);
  const [confirmingAction, setConfirmingAction] = useState<{ id: string, type: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    const user = HTMService.getCurrentUser();
    const all = HTMService.getBookings();
    // Respective dept head has full authority for their department only
    setPending(all.filter(b => 
      b.status === BookingStatus.REQUESTED && 
      b.departmentId === user.departmentId
    ));
  };

  const handleAction = (id: string, approve: boolean) => {
    HTMService.updateBookingStatus(id, approve ? BookingStatus.APPROVED : BookingStatus.CANCELLED);
    setConfirmingAction(null);
    refreshList();
  };

  const departments = HTMService.getDepartments();
  const currentDept = departments.find(d => d.id === HTMService.getCurrentUser().departmentId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-slate-500">
            Reviewing requests for <span className="text-blue-600 font-bold">{currentDept?.name || 'Your Department'}</span>
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
            <Icons.Check />
          </div>
          <h3 className="text-xl font-bold text-slate-800">All clear!</h3>
          <p className="text-slate-500 mt-2">There are no pending transport requests requiring your authorization.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Request Details</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pending.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-8">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Icons.Booking />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{booking.purpose}</p>
                        <p className="text-sm text-slate-500 mt-1">From: {booking.pickupLocation} → To: {booking.dropLocation}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                              <img src={`https://picsum.photos/seed/${booking.requesterId}/50/50`} alt="" />
                           </div>
                           <span className="text-xs font-semibold text-slate-600">
                             Requested by: {HTMService.getAllUsers().find(u => u.id === booking.requesterId)?.name || 'Personnel'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">{new Date(booking.startTime).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-500">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      booking.priority === PriorityLevel.EMERGENCY ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {booking.priority}
                    </span>
                  </td>
                  <td className="px-6 py-8 text-right">
                    {confirmingAction?.id === booking.id ? (
                      <div className="flex flex-col items-end gap-2 animate-in slide-in-from-right-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Confirm {confirmingAction.type}?
                        </p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleAction(booking.id, confirmingAction.type === 'approve')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-lg active:scale-95 ${
                              confirmingAction.type === 'approve' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'
                            }`}
                          >
                            Yes, {confirmingAction.type}
                          </button>
                          <button 
                            onClick={() => setConfirmingAction(null)}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setConfirmingAction({ id: booking.id, type: 'approve' })}
                          className="p-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transition-all shadow-sm active:scale-95 group"
                          title="Approve Request"
                        >
                          <Icons.Check />
                        </button>
                        <button 
                          onClick={() => setConfirmingAction({ id: booking.id, type: 'reject' })}
                          className="p-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all shadow-sm active:scale-95 group"
                          title="Reject Request"
                        >
                          <Icons.X />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

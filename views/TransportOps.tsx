
import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { Booking, BookingStatus, PriorityLevel, Driver, Vehicle } from '../types';
import { Icons } from '../constants';
import { VehicleMap } from '../components/VehicleMap';

export const TransportOps: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'live'>('pending');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [assignData, setAssignData] = useState({ vehicle: '', driver: '' });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewDate, setViewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newTimes, setNewTimes] = useState({ start: '', end: '' });

  useEffect(() => {
    refreshData();
    // Setup interval for "real-time" update feel
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        refreshData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [viewDate, activeTab]);

  const refreshData = () => {
    setBookings(HTMService.getBookings());
  };

  const activeTrips = bookings.filter(b => b.status === BookingStatus.ON_TRIP);

  const filteredBookings = bookings.filter(b => {
    const bDate = new Date(b.startTime).toISOString().split('T')[0];
    if (activeTab === 'pending') return b.status === BookingStatus.APPROVED;
    if (activeTab === 'live') return b.status === BookingStatus.ON_TRIP;
    return [BookingStatus.CONFIRMED, BookingStatus.ON_TRIP, BookingStatus.COMPLETED].includes(b.status) && bDate === viewDate;
  });

  const availableVehicles = HTMService.getVehicles().filter(v => v.status === 'AVAILABLE' || v.id === assignData.vehicle);
  const availableDrivers = HTMService.getDrivers().filter(d => d.status === 'AVAILABLE' || d.id === assignData.driver);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  useEffect(() => {
    if (selectedBooking) {
      setAssignData({
        vehicle: selectedBooking.assignedVehicleId || '',
        driver: selectedBooking.assignedDriverId || '',
      });
      setNewTimes({
        start: selectedBooking.startTime.slice(0, 16),
        end: selectedBooking.endTime.slice(0, 16)
      });
      setIsCancelling(false);
      setIsRescheduling(false);
      setCancelReason('');
    }
  }, [selectedBookingId, selectedBooking]);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingId && assignData.vehicle && assignData.driver) {
      HTMService.assignVehicleAndDriver(selectedBookingId, assignData.vehicle, assignData.driver);
      setSelectedBookingId(null);
      refreshData();
    }
  };

  const handleQuickStart = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedBookingId && assignData.vehicle && assignData.driver) {
      HTMService.assignVehicleAndDriver(selectedBookingId, assignData.vehicle, assignData.driver);
      HTMService.updateBookingStatus(selectedBookingId, BookingStatus.ON_TRIP);
      setSelectedBookingId(null);
      refreshData();
    }
  };

  const handleStartConfirmedTrip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    HTMService.updateBookingStatus(id, BookingStatus.ON_TRIP);
    refreshData();
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingId && newTimes.start && newTimes.end) {
      HTMService.rescheduleBooking(selectedBookingId, new Date(newTimes.start).toISOString(), new Date(newTimes.end).toISOString());
      setIsRescheduling(false);
      refreshData();
    }
  };

  const handleUpdateStatus = (status: BookingStatus) => {
    if (selectedBookingId) {
      HTMService.updateBookingStatus(selectedBookingId, status);
      refreshData();
      if (status === BookingStatus.COMPLETED) {
        setSelectedBookingId(null);
      }
    }
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingId && cancelReason.trim()) {
      HTMService.updateBookingStatus(selectedBookingId, BookingStatus.CANCELLED, { cancelReason });
      setSelectedBookingId(null);
      setIsCancelling(false);
      setCancelReason('');
      refreshData();
    }
  };

  const getDriverName = (id?: string) => HTMService.getDrivers().find(d => d.id === id)?.name || 'Unknown';
  const getVehiclePlate = (id?: string) => HTMService.getVehicles().find(v => v.id === id)?.plateNumber || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transport Operations</h2>
          <p className="text-slate-500">Logistics & Fleet Scheduling Management</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Schedule Date</label>
              <input 
                type="date" 
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
                className="text-sm font-bold text-blue-600 outline-none cursor-pointer"
              />
           </div>
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-bold text-slate-700">{HTMService.getVehicles().filter(v => v.status === 'AVAILABLE').length} Fleet Ready</span>
           </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-8">
        <button 
          onClick={() => { setActiveTab('pending'); setSelectedBookingId(null); }}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Pending Queue ({bookings.filter(b => b.status === BookingStatus.APPROVED).length})
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button 
          onClick={() => { setActiveTab('confirmed'); setSelectedBookingId(null); }}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'confirmed' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {viewDate === new Date().toISOString().split('T')[0] ? "Today's Schedule" : `Schedule for ${viewDate}`}
          {activeTab === 'confirmed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button 
          onClick={() => { setActiveTab('live'); setSelectedBookingId(null); }}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'live' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${activeTrips.length > 0 ? 'animate-pulse' : ''}`}></div>
          Live Fleet Track ({activeTrips.length})
          {activeTab === 'live' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'live' && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden mb-6 h-[450px]">
               <VehicleMap activeTrips={activeTrips} />
            </div>
          )}

          {filteredBookings.length === 0 ? (
             <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-16 rounded-3xl text-center text-slate-400 animate-in fade-in">
                <div className="mb-4 flex justify-center opacity-20"><Icons.Vehicle /></div>
                No transport tasks {activeTab === 'pending' ? 'in the pending queue' : activeTab === 'live' ? 'currently active' : `found for ${viewDate}`}
             </div>
          ) : (
            filteredBookings.map(booking => (
              <div 
                key={booking.id} 
                className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer animate-in slide-in-from-left-2 ${
                  selectedBookingId === booking.id ? 'border-blue-500 shadow-lg shadow-blue-50' : 'border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
                onClick={() => setSelectedBookingId(booking.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">{booking.purpose}</h4>
                      {booking.priority === PriorityLevel.EMERGENCY && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">EMERGENCY</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{booking.pickupLocation} <span className="mx-1 text-slate-300">→</span> {booking.dropLocation}</p>
                    
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                          <Icons.Users />
                          <span>{HTMService.getAllUsers().find(u => u.id === booking.requesterId)?.name || 'Personnel'}</span>
                          <span className="text-slate-300 mx-1">|</span>
                          <span className="text-blue-600 font-black">{HTMService.getDepartments().find(d => d.id === booking.departmentId)?.name}</span>
                        </div>
                    </div>

                    {(booking.assignedVehicleId) && (
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Icons.Vehicle />
                          <span>{getVehiclePlate(booking.assignedVehicleId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Icons.Driver />
                          <span>{getDriverName(booking.assignedDriverId)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-slate-400 font-medium">{new Date(booking.startTime).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === BookingStatus.CONFIRMED && (
                        <button 
                          onClick={(e) => handleStartConfirmedTrip(e, booking.id)}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Start Trip
                        </button>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        booking.status === BookingStatus.ON_TRIP ? 'bg-emerald-500 text-white' : 
                        booking.status === BookingStatus.CONFIRMED ? 'bg-indigo-500 text-white' : 
                        booking.status === BookingStatus.COMPLETED ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl sticky top-24 min-h-[500px]">
            {!selectedBookingId ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
                  <Icons.Driver />
                </div>
                <h4 className="text-slate-800 font-bold mb-1">Logistics Detail</h4>
                <p className="text-slate-400 text-sm px-4 leading-relaxed">Choose a trip from the list to view department details, assign fleet, or manage execution status.</p>
              </div>
            ) : isCancelling ? (
              <form onSubmit={handleConfirmCancel} className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className="pb-4 border-b">
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Administrator Override</p>
                   <p className="font-bold text-slate-800 truncate mt-1">Cancel Confirmation Required</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Reason for Cancellation</label>
                  <textarea 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-sm min-h-[120px]"
                    placeholder="Provide justification for cancelling this transport..."
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                  />
                </div>
                <div className="pt-4 space-y-3">
                  <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95">
                    Revoke and Cancel Request
                  </button>
                  <button type="button" onClick={() => setIsCancelling(false)} className="w-full text-slate-400 font-bold py-2 text-xs">Go Back</button>
                </div>
              </form>
            ) : isRescheduling ? (
              <form onSubmit={handleReschedule} className="space-y-6 animate-in slide-in-from-top-2">
                <div className="pb-4 border-b">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Fleet Coordination</p>
                   <p className="font-bold text-slate-800 truncate mt-1">Reschedule Trip Slot</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">New Start Time</label>
                    <input 
                      type="datetime-local" 
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTimes.start}
                      onChange={e => setNewTimes({...newTimes, start: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">New End Time</label>
                    <input 
                      type="datetime-local" 
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTimes.end}
                      onChange={e => setNewTimes({...newTimes, end: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 shadow-lg active:scale-95">
                    Apply New Schedule
                  </button>
                  <button type="button" onClick={() => setIsRescheduling(false)} className="w-full text-slate-400 font-bold py-2 text-xs">Back to Assignment</button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="pb-4 border-b">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Transport Detail</p>
                   <p className="font-bold text-slate-800 truncate mt-1">{selectedBooking?.purpose}</p>
                   <div className="mt-2 flex gap-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        selectedBooking?.status === BookingStatus.ON_TRIP ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedBooking?.status.replace('_', ' ')}
                      </span>
                   </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trip Status Control</p>
                  
                  {selectedBooking?.status === BookingStatus.CONFIRMED && (
                    <button 
                      onClick={() => handleUpdateStatus(BookingStatus.ON_TRIP)}
                      className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Start Active Trip
                    </button>
                  )}

                  {selectedBooking?.status === BookingStatus.ON_TRIP && (
                    <button 
                      onClick={() => handleUpdateStatus(BookingStatus.COMPLETED)}
                      className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 shadow-lg active:scale-95"
                    >
                      <Icons.Check />
                      Mark Completed
                    </button>
                  )}

                  {selectedBooking?.status === BookingStatus.APPROVED && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                       <p className="text-[11px] text-blue-800 font-semibold leading-relaxed">
                        This request is awaiting logistics confirmation. Assign a fleet member to move to the CONFIRMED stage.
                       </p>
                    </div>
                  )}
                  {selectedBooking?.status === BookingStatus.COMPLETED && (
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500">Service completed and logged.</p>
                     </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Resource Allocation</p>
                    {![BookingStatus.ON_TRIP, BookingStatus.COMPLETED].includes(selectedBooking?.status as BookingStatus) && (
                      <button 
                        onClick={() => setIsRescheduling(true)}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Icons.Settings /> Reschedule
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAssign} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500">Fleet Vehicle</label>
                      <select 
                        required
                        disabled={[BookingStatus.ON_TRIP, BookingStatus.COMPLETED].includes(selectedBooking?.status as BookingStatus)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-60"
                        value={assignData.vehicle}
                        onChange={e => setAssignData({...assignData, vehicle: e.target.value})}
                      >
                        <option value="">Assign Vehicle...</option>
                        {availableVehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.plateNumber} — {v.type} ({v.status})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500">Personnel Driver</label>
                      <select 
                        required
                        disabled={[BookingStatus.ON_TRIP, BookingStatus.COMPLETED].includes(selectedBooking?.status as BookingStatus)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-60"
                        value={assignData.driver}
                        onChange={e => setAssignData({...assignData, driver: e.target.value})}
                      >
                        <option value="">Select Personnel...</option>
                        {availableDrivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} — {d.shift} ({d.status})</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 space-y-3">
                      {selectedBooking?.status === BookingStatus.APPROVED && (
                        <button 
                          onClick={handleQuickStart}
                          disabled={!assignData.vehicle || !assignData.driver}
                          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:grayscale"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Confirm & Start Trip
                        </button>
                      )}

                      {![BookingStatus.ON_TRIP, BookingStatus.COMPLETED].includes(selectedBooking?.status as BookingStatus) && (
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm">
                          <Icons.Check />
                          Confirm Logistics Only
                        </button>
                      )}
                      
                      {selectedBooking?.status !== BookingStatus.COMPLETED && (
                        <button 
                          type="button" 
                          onClick={() => setIsCancelling(true)}
                          className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-2 border-2 border-transparent hover:bg-red-50 rounded-2xl transition-all text-xs"
                        >
                          <Icons.X />
                          Cancel Transport Request
                        </button>
                      )}

                      <button type="button" onClick={() => setSelectedBookingId(null)} className="w-full text-slate-400 font-bold py-2 text-xs">Close Details</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

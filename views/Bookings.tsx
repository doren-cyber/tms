
import React, { useState } from 'react';
import { HTMService } from '../store';
import { BookingStatus, PriorityLevel, VehicleType } from '../types';
import { Icons } from '../constants';

export const Bookings: React.FC = () => {
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    pickupLocation: '',
    dropLocation: '',
    startTime: '',
    duration: '1',
    passengers: 1,
    priority: PriorityLevel.NORMAL,
    vehicleType: VehicleType.CAR,
    hasEquipment: false,
    equipmentDescription: '',
  });

  const bookings = HTMService.getBookings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    HTMService.createBooking({
      ...formData,
      endTime: new Date(new Date(formData.startTime).getTime() + parseInt(formData.duration) * 3600000).toISOString()
    });
    setShowNewBooking(false);
    // Reset form
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transport Requests</h2>
          <p className="text-slate-500">Manage and track your vehicle bookings</p>
        </div>
        <button 
          onClick={() => setShowNewBooking(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200"
        >
          <Icons.Plus />
          <span>New Booking</span>
        </button>
      </div>

      {showNewBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Request Transportation</h3>
              <button onClick={() => setShowNewBooking(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><Icons.X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-slate-700">Purpose of Travel</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Patient transfer, Lab equipment pickup"
                    value={formData.purpose}
                    onChange={e => setFormData({...formData, purpose: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Pickup Location</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Wart/Room/Building"
                    value={formData.pickupLocation}
                    onChange={e => setFormData({...formData, pickupLocation: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Drop-off Location</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Destination address"
                    value={formData.dropLocation}
                    onChange={e => setFormData({...formData, dropLocation: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Pickup Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Est. Duration (Hours)</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  >
                    {[1,2,3,4,6,8,12,24].map(h => <option key={h} value={h}>{h} Hour(s)</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Priority Level</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.priority === PriorityLevel.NORMAL ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-100'}`}>
                      <input type="radio" className="hidden" name="priority" checked={formData.priority === PriorityLevel.NORMAL} onChange={() => setFormData({...formData, priority: PriorityLevel.NORMAL})} />
                      Normal
                    </label>
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.priority === PriorityLevel.EMERGENCY ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-slate-100'}`}>
                      <input type="radio" className="hidden" name="priority" checked={formData.priority === PriorityLevel.EMERGENCY} onChange={() => setFormData({...formData, priority: PriorityLevel.EMERGENCY})} />
                      Emergency
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Vehicle Type</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.vehicleType}
                    onChange={e => setFormData({...formData, vehicleType: e.target.value as VehicleType})}
                  >
                    {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setShowNewBooking(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                booking.priority === PriorityLevel.EMERGENCY ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
              }`}>
                {booking.priority}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                booking.status === BookingStatus.REQUESTED ? 'bg-amber-100 text-amber-700' :
                booking.status === BookingStatus.APPROVED ? 'bg-blue-100 text-blue-700' :
                booking.status === BookingStatus.CONFIRMED ? 'bg-indigo-100 text-indigo-700' :
                booking.status === BookingStatus.ON_TRIP ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            
            <h4 className="font-bold text-slate-800 line-clamp-1">{booking.purpose}</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="flex-1 truncate">{booking.pickupLocation}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                <span className="flex-1 truncate">{booking.dropLocation}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-medium">
                <Icons.Booking />
                <span>{new Date(booking.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">ID: {booking.id}</span>
              <button className="text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Details →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

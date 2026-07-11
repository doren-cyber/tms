
import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { Vehicle, VehicleType } from '../types';
import { Icons } from '../constants';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'MAINTENANCE'>('ALL');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await HTMService.getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to load vehicles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter(v => filter === 'ALL' || v.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hospital Fleet</h2>
          <p className="text-slate-500">Manage and monitor vehicle availability and health</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['ALL', 'AVAILABLE', 'BUSY', 'MAINTENANCE'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                filter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm">
           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-500 text-sm font-semibold">Loading vehicle roster...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                   vehicle.type === VehicleType.AMBULANCE ? 'bg-red-500 shadow-red-100' : 
                   vehicle.type === VehicleType.VAN ? 'bg-blue-500 shadow-blue-100' : 'bg-slate-700 shadow-slate-100'
                 }`}>
                   <Icons.Vehicle />
                 </div>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   vehicle.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                   vehicle.status === 'BUSY' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                 }`}>
                   {vehicle.status}
                 </span>
              </div>

              <div className="space-y-1">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{vehicle.type}</p>
                 <h3 className="text-xl font-bold text-slate-900">{vehicle.plateNumber}</h3>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Capacity</p>
                    <p className="text-sm font-bold text-slate-800">{vehicle.capacity} PAX</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Load Cap.</p>
                    <p className="text-sm font-bold text-slate-800">{vehicle.equipmentLoad} KG</p>
                 </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
                 <span>Last Service</span>
                 <span>{new Date(vehicle.lastServiceDate).toLocaleDateString()}</span>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${
                   vehicle.status === 'AVAILABLE' ? 'w-full bg-emerald-500' : 
                   vehicle.status === 'BUSY' ? 'w-2/3 bg-blue-500' : 'w-1/3 bg-amber-500'
                 }`}></div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-slate-100 text-slate-400 font-semibold italic">
              No matching vehicles found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

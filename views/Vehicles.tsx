import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { Vehicle, VehicleType } from '../types';
import { Icons } from '../constants';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'MAINTENANCE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [type, setType] = useState<VehicleType>(VehicleType.CAR);
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<'AVAILABLE' | 'BUSY' | 'MAINTENANCE'>('AVAILABLE');
  const [equipmentLoad, setEquipmentLoad] = useState(100);
  const [lastServiceDate, setLastServiceDate] = useState('');
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setPlateNumber('');
    setType(VehicleType.CAR);
    setCapacity(4);
    setStatus('AVAILABLE');
    setEquipmentLoad(100);
    setLastServiceDate(new Date().toISOString().split('T')[0]);
    setShowConfirmDelete(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setType(vehicle.type);
    setCapacity(vehicle.capacity);
    setStatus(vehicle.status);
    setEquipmentLoad(vehicle.equipmentLoad);
    setLastServiceDate(vehicle.lastServiceDate);
    setShowConfirmDelete(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingVehicle) {
        await HTMService.updateVehicle(editingVehicle.id, {
          plateNumber,
          type,
          capacity,
          status,
          equipmentLoad,
          lastServiceDate,
        });
      } else {
        await HTMService.createVehicle({
          plateNumber,
          type,
          capacity,
          status,
          equipmentLoad,
          lastServiceDate,
        });
      }
      await fetchVehicles();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save vehicle", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingVehicle) return;
    setSubmitting(true);
    try {
      await HTMService.deleteVehicle(editingVehicle.id);
      await fetchVehicles();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete vehicle", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vehicles.filter(v => filter === 'ALL' || v.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hospital Fleet</h2>
          <p className="text-slate-500">Manage and monitor vehicle availability and health</p>
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            {['ALL', 'AVAILABLE', 'BUSY', 'MAINTENANCE'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
             <Icons.Plus />
             <span>Add Vehicle</span>
          </button>
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
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleOpenEdit(vehicle)}
                     className="p-1.5 text-slate-300 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                     title="Edit Vehicle"
                   >
                     <Icons.Settings />
                   </button>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     vehicle.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                     vehicle.status === 'BUSY' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                   }`}>
                     {vehicle.status}
                   </span>
                 </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingVehicle ? 'Edit Fleet Vehicle' : 'Add Fleet Vehicle'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-all"
              >
                <Icons.X />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Plate Number</label>
                <input 
                  type="text" 
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. AMB-103"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-800 transition-all uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Vehicle Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 bg-white transition-all"
                  >
                    {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 bg-white transition-all"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Capacity (PAX)</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Load Capacity (KG)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={equipmentLoad}
                    onChange={(e) => setEquipmentLoad(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Last Service Date</label>
                <input 
                  type="date" 
                  required
                  value={lastServiceDate}
                  onChange={(e) => setLastServiceDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 transition-all"
                />
              </div>

              {editingVehicle && (
                <div className="pt-2">
                  {showConfirmDelete ? (
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 space-y-3">
                      <p className="text-xs text-rose-800 font-bold leading-relaxed">
                         Confirm permanent deletion of this vehicle from the fleet registry?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowConfirmDelete(false)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={submitting}
                          className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700 transition-colors"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
                      <span>Remove from fleet?</span>
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(true)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors rounded-lg"
                      >
                        Delete Vehicle
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

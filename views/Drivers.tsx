
import React, { useState, useEffect } from 'react';
import { HTMService } from '../store';
import { Driver } from '../types';
import { Icons } from '../constants';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [status, setStatus] = useState<'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY'>('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);

  const fetchDrivers = async () => {
    try {
      const data = await HTMService.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error("Failed to load drivers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setName('');
    setPhone('');
    setLicenseNumber('');
    setShift('MORNING');
    setStatus('AVAILABLE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setPhone(driver.phone);
    setLicenseNumber(driver.licenseNumber);
    setShift(driver.shift);
    setStatus(driver.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDriver) {
        await HTMService.updateDriver(editingDriver.id, {
          name,
          phone,
          licenseNumber,
          shift,
          status,
        });
      } else {
        await HTMService.createDriver({
          name,
          phone,
          licenseNumber,
          shift,
          status,
        });
      }
      await fetchDrivers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save driver", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transport Personnel</h2>
          <p className="text-slate-500">Fleet drivers, shift management and status monitoring</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black shadow-lg transition-all flex items-center gap-2"
        >
           <Icons.Plus />
           Add Personnel
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-slate-500 text-sm font-semibold">Loading personnel roster...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">License</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                         <img src={`https://picsum.photos/seed/${driver.id}/100/100`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{driver.name}</p>
                        <p className="text-xs text-slate-400">{driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs font-bold text-slate-500">{driver.licenseNumber}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      driver.shift === 'MORNING' ? 'bg-amber-50 text-amber-700' : 
                      driver.shift === 'EVENING' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-800 text-white'
                    }`}>
                      {driver.shift}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          driver.status === 'AVAILABLE' ? 'bg-emerald-500' : 
                          driver.status === 'ON_DUTY' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'
                        }`}></div>
                        <span className="text-xs font-bold text-slate-700">{driver.status.replace('_', ' ')}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <button 
                       onClick={() => handleOpenEdit(driver)}
                       className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
                     >
                        <Icons.Settings />
                     </button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingDriver ? 'Edit Personnel' : 'Add New Personnel'}
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">License Number</label>
                  <input 
                    type="text" 
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. DL-12345"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Duty Shift</label>
                  <select
                    value={shift}
                    onChange={(e: any) => setShift(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800 bg-white transition-all"
                  >
                    <option value="MORNING">MORNING</option>
                    <option value="EVENING">EVENING</option>
                    <option value="NIGHT">NIGHT</option>
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
                    <option value="ON_DUTY">ON DUTY</option>
                    <option value="OFF_DUTY">OFF DUTY</option>
                  </select>
                </div>
              </div>

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


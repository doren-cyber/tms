
import React, { useState } from 'react';
import { HTMService } from '../store';
import { Driver } from '../types';
import { Icons } from '../constants';

export const Drivers: React.FC = () => {
  const [drivers] = useState<Driver[]>(HTMService.getDrivers());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transport Personnel</h2>
          <p className="text-slate-500">Fleet drivers, shift management and status monitoring</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black shadow-lg transition-all flex items-center gap-2">
           <Icons.Plus />
           Add Personnel
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
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
                   <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                      <Icons.Settings />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

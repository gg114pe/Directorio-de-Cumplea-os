import { Statistics } from '../types.ts';
import { MONTH_NAMES_ES } from '../utils/birthdayHelpers.ts';
import { MONTH_COLORS } from './BirthdayCard.tsx';
import { Cake, Users, Compass } from 'lucide-react';

interface StatsDashboardProps {
  stats: Statistics;
}

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  // Find maximum count for normalising bar charts
  const maxMonthCount = Math.max(...Object.values(stats.monthDistribution), 1);

  return (
    <div id="stats-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Metrics Row */}
      <div className="md:col-span-1 flex flex-col gap-4">
        {/* Total birthdays count */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shadow-sm shadow-slate-100/40 hover:shadow-md hover:border-slate-200 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">CUMPLEAÑOS TOTALES</p>
            <h4 className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalCount}</h4>
            <p className="text-slate-400 text-[9px] font-mono uppercase font-semibold">REGISTROS FRATERNALES</p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Cake className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        {/* Average Age */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shadow-sm shadow-slate-100/40 hover:shadow-md hover:border-slate-200 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">PROMEDIO DE EDAD</p>
            <h4 className="text-3xl font-black text-slate-800 tracking-tight">
              {stats.averageAge} <span className="text-xs font-mono font-black text-slate-450">AÑOS</span>
            </h4>
            <p className="text-slate-400 text-[9px] font-mono uppercase font-semibold">CÓMPUTO FRATERNAL</p>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl">
            <Users className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        {/* Most Common Zodiac */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shadow-sm shadow-slate-100/40 hover:shadow-md hover:border-slate-200 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">SIGNO DETERMINANTE</p>
            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 pt-1.5">
              <span className="text-base select-none">🌟</span>
              {stats.mostCommonZodiac}
            </h4>
            <p className="text-slate-400 text-[9px] font-mono uppercase font-semibold">ZODÍACO RADIAL</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Compass className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* Monthly Distribution Column (Chart) */}
      <div className="md:col-span-2 bg-white p-6 border border-slate-100 rounded-2xl flex flex-col justify-between relative shadow-sm shadow-slate-100/40 hover:shadow-md hover:border-slate-200 transition-all duration-300">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-tight mb-0.5">DISTRIBUCIÓN MENSUAL</h3>
          <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider font-medium">Cantidad de natalicios registrados en cada mes lunar</p>
        </div>

        {/* Interactive Custom Bar Chart */}
        <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-36 pt-6 border-b border-slate-50">
          {MONTH_NAMES_ES.map((monthName, i) => {
            const count = stats.monthDistribution[i] || 0;
            const percentage = (count / maxMonthCount) * 100;
            const monthBg = MONTH_COLORS[i] || 'bg-slate-500';

            return (
              <div key={monthName} className="flex flex-col items-center flex-1 group relative">
                {/* Tooltip bubble */}
                <div className="opacity-0 group-hover:opacity-100 absolute -translate-y-12 bg-slate-900 text-white text-[9px] font-mono py-1 px-2 rounded-lg transition-opacity duration-150 pointer-events-none z-10 uppercase whitespace-nowrap shadow-md">
                  {count} {count === 1 ? 'REGISTRO' : 'REGISTROS'}
                </div>

                {/* Bar */}
                <div className="w-full flex justify-center">
                  <div
                    className={`w-full max-w-[16px] transition-all duration-300 ease-out rounded-t-full ${
                      count > 0 
                        ? `${monthBg} hover:opacity-85 shadow-[0_2px_4px_rgba(0,0,0,0.05)]`
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                    style={{ height: `${Math.max(percentage, 5)}%` }}
                  />
                </div>

                {/* Subtitle letter */}
                <span className="text-[9px] font-bold font-mono text-slate-400 mt-2 select-none group-hover:text-slate-900 group-hover:scale-105 transition-all uppercase">
                  {monthName.substring(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

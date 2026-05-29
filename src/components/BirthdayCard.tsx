import React from 'react';
import { Birthday } from '../types.ts';
import { getAge, getZodiacSign, getDaysUntil, MONTH_NAMES_ES, parseDateComponents } from '../utils/birthdayHelpers.ts';
import { Trash2, Edit2, Calendar, Star, Sparkles, Share2 } from 'lucide-react';

interface BirthdayCardProps {
  key?: string;
  birthday: Birthday;
  onEdit?: (b: Birthday) => void;
  onDelete?: (id: string) => void;
  onExportTribute?: (b: Birthday) => void;
  baseDate?: Date;
}

export const MONTH_COLORS = [
  'bg-indigo-900',  // Enero - Azul Prusia
  'bg-amber-500',   // Febrero - Oro Masónico
  'bg-slate-500',   // Marzo - Gris Cantero
  'bg-blue-700',    // Abril - Azul Cobalto
  'bg-yellow-600',  // Mayo - Oro Viejo
  'bg-slate-700',   // Junio - Gris Cincel
  'bg-blue-600',    // Julio - Azul Logia
  'bg-amber-600',   // Agosto - Dorado Imperial
  'bg-zinc-500',    // Septiembre - Gris Granito
  'bg-indigo-700',  // Octubre - Azul Fraternal
  'bg-amber-400',   // Noviembre - Oro Claro
  'bg-slate-800'    // Diciembre - Gris Pizarra
];

export default function BirthdayCard({ birthday, onEdit, onDelete, onExportTribute, baseDate = new Date() }: BirthdayCardProps) {
  const age = getAge(birthday.date, baseDate);
  const zodiac = getZodiacSign(birthday.date);
  const { days, nextAge } = getDaysUntil(birthday.date, baseDate);
  const { day, month, year } = parseDateComponents(birthday.date);

  const isToday = days === 0;
  const isSoon = days > 0 && days <= 30;
  const formattedDay = day < 10 ? `0${day}` : day;
  const monthColor = MONTH_COLORS[month - 1] || 'bg-slate-500';

  return (
    <div
      id={`birthday-card-${birthday.id}`}
      className={`relative group bg-white rounded-2xl p-5 flex flex-col justify-between transition-all duration-305 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 border ${
        isToday
          ? 'border-amber-400 ring-2 ring-amber-400/10 bg-gradient-to-br from-indigo-50/35 via-white to-white shadow-md shadow-amber-150/20'
          : isSoon
          ? 'border-amber-200 bg-gradient-to-br from-amber-50/15 via-white to-white'
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Sleek top indicator line */}
      <div className="absolute top-0 left-5 right-5 h-[3px] rounded-b-full flex overflow-hidden">
        <span className={`h-full w-12 ${monthColor}`}></span>
        {isToday && <span className="h-full flex-grow bg-amber-500"></span>}
        {isSoon && !isToday && <span className="h-full flex-grow bg-amber-400"></span>}
      </div>

      <div className="flex justify-between items-start gap-3 pt-2">
        <div className="flex-grow space-y-1.5">
          <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base tracking-tight leading-snug group-hover:text-indigo-700 transition-colors">
            {birthday.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono tracking-wider">
            <span className="uppercase text-indigo-705 text-indigo-700 font-semibold bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded">
              {MONTH_NAMES_ES[month - 1]} {formattedDay}
            </span>
            <span>•</span>
            <span className="text-slate-400 font-semibold">AÑO {year}</span>
            <span>•</span>
            <span className="font-sans text-[9px] px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded uppercase font-medium">
              {zodiac.symbol} {zodiac.name}
            </span>
          </div>
        </div>

        {/* Right side date/age details */}
        <div className="text-right shrink-0 flex flex-col items-end">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
            <span className="block text-base font-bold font-mono text-slate-800 leading-none">
              {age}
            </span>
            <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider block mt-0.5">
              Años
            </span>
          </div>
        </div>
      </div>

      {/* Footer block inside card / status with clean layout */}
      <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex justify-between items-center text-[10px]">
        <div className="font-mono text-slate-400 uppercase tracking-tight">
          {isToday ? (
            <span className="text-amber-600 font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ¡HOY CUMPLE! 🎖️
            </span>
          ) : isSoon ? (
            <span className="text-indigo-600 font-bold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              FALTAN {days} DÍAS (TURNA {nextAge})
            </span>
          ) : (
            <span>
              Faltan <span className="font-bold text-slate-600 font-mono text-[11px]">{days}</span> días
            </span>
          )}
        </div>

        {/* Flat compact controls */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
          {onExportTribute && (
            <button
              id={`export-btn-${birthday.id}`}
              onClick={() => onExportTribute(birthday)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors focus:outline-none border border-slate-100/50 hover:border-amber-100"
              title="Exportar Homenaje (WhatsApp)"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onEdit && (
            <button
              id={`edit-btn-${birthday.id}`}
              onClick={() => onEdit(birthday)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none border border-slate-100/50 hover:border-indigo-100"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              id={`delete-btn-${birthday.id}`}
              onClick={() => onDelete(birthday.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-605 hover:bg-rose-50 transition-colors focus:outline-none border border-slate-100/50 hover:border-rose-100"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

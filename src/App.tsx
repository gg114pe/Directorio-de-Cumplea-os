import { useState, useEffect, useMemo } from 'react';
import { Birthday, Statistics } from './types.ts';
import { INITIAL_BIRTHDAYS } from './birthdaysData.ts';
import {
  calculateStatistics,
  getAge,
  getDaysUntil,
  getMonthName,
  MONTH_NAMES_ES,
  parseDateComponents
} from './utils/birthdayHelpers.ts';
import BirthdayCard, { MONTH_COLORS } from './components/BirthdayCard.tsx';
import StatsDashboard from './components/StatsDashboard.tsx';
import AddBirthdayModal from './components/AddBirthdayModal.tsx';
import TributeExportModal from './components/TributeExportModal.tsx';
import { 
  Cake, 
  Search, 
  Plus, 
  Filter, 
  CalendarDays, 
  RefreshCw, 
  Gift, 
  ChevronRight, 
  Calendar, 
  Sparkles,
  BarChart4,
  Info
} from 'lucide-react';

export default function App() {
  // Birthdays state with standard localStorage sync
  const [birthdays, setBirthdays] = useState<Birthday[]>(() => {
    const saved = localStorage.getItem('birthdays_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing birthdays from localStorage', e);
      }
    }
    return INITIAL_BIRTHDAYS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [birthdayToEdit, setBirthdayToEdit] = useState<Birthday | null>(null);
  const [selectedBirthdayForTribute, setSelectedBirthdayForTribute] = useState<Birthday | null>(null);
  const [isTributeModalOpen, setIsTributeModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Base current date
  const [baseDate] = useState(() => new Date());

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('birthdays_list', JSON.stringify(birthdays));
  }, [birthdays]);

  // Handle adding or updating birthdays
  const handleSaveBirthday = (data: Omit<Birthday, 'id'> & { id?: string }) => {
    if (data.id) {
      // Edit mode
      setBirthdays(prev =>
        prev.map(b => (b.id === data.id ? { ...b, name: data.name, date: data.date } : b))
      );
    } else {
      // Add mode
      const newBirthday: Birthday = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        name: data.name,
        date: data.date
      };
      setBirthdays(prev => [newBirthday, ...prev]);
    }
  };

  // Handle deletion
  const handleDeleteBirthday = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cumpleaños?')) {
      setBirthdays(prev => prev.filter(b => b.id !== id));
    }
  };

  // Trigger edit modal
  const handleTriggerEdit = (birthday: Birthday) => {
    setBirthdayToEdit(birthday);
    setIsAddModalOpen(true);
  };

  // Reset to original pre-loaded list
  const handleResetToDefault = () => {
    if (confirm('¿Deseas restablecer la lista original con los 36 cumpleaños predeterminados? Se perderán los cambios manuales.')) {
      setBirthdays(INITIAL_BIRTHDAYS);
      setSearchTerm('');
      setSelectedMonth('all');
    }
  };

  // Calculate current database statistics dynamically with support for simulated dates
  const stats = useMemo(() => {
    return calculateStatistics(birthdays, baseDate);
  }, [birthdays, baseDate]);

  // Group and sort the data for rendering by months
  const monthlyGroups = useMemo(() => {
    const groups: Record<number, Birthday[]> = {};
    for (let i = 0; i < 12; i++) {
      groups[i] = [];
    }

    // Filter birthdays on user options
    const filtered = birthdays.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const { month } = parseDateComponents(b.date);
      const matchesMonth = selectedMonth === 'all' || (month - 1).toString() === selectedMonth;
      return matchesSearch && matchesMonth;
    });

    filtered.forEach(b => {
      const { month } = parseDateComponents(b.date);
      groups[month - 1].push(b);
    });

    // Make array representation, sorting days chronologically inside each month group
    return Object.entries(groups)
      .map(([mIdxStr, bList]) => {
        const monthIndex = parseInt(mIdxStr, 10);
        const sortedList = [...bList].sort((a, b) => {
          const dayA = parseDateComponents(a.date).day;
          const dayB = parseDateComponents(b.date).day;
          return dayA - dayB;
        });
        return {
          monthIndex,
          monthName: MONTH_NAMES_ES[monthIndex],
          birthdays: sortedList
        };
      })
      .filter(group => {
        // If specific month is chosen, show only that one. Otherwise, hide months with 0 records to maintain visual cleanliness.
        if (selectedMonth !== 'all') {
          return group.monthIndex.toString() === selectedMonth;
        }
        return group.birthdays.length > 0;
      });
  }, [birthdays, searchTerm, selectedMonth]);

  // Compute the top upcoming birthdays celebrating in the next days with support for simulated dates
  const upcomingBirthdays = useMemo(() => {
    return [...birthdays]
      .map(b => {
        const { days, nextAge } = getDaysUntil(b.date, baseDate);
        return { birthday: b, days, nextAge };
      })
      .sort((a, b) => a.days - b.days)
      .slice(0, 3); // Get the top 3 closest upcoming arrivals
  }, [birthdays, baseDate]);

  const todaysBirthdays = useMemo(() => {
    const targetMonth = baseDate.getMonth() + 1;
    const targetDay = baseDate.getDate();
    return birthdays.filter(b => {
      const { month, day } = parseDateComponents(b.date);
      return month === targetMonth && day === targetDay;
    });
  }, [birthdays, baseDate]);

  const activeTodayBirthdayCount = todaysBirthdays.length;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-50/70 to-slate-100 text-slate-800 selection:bg-indigo-900 selection:text-white pb-16">
      {/* Interactive Birthday Confetti/Celebration Top header info */}
      {activeTodayBirthdayCount > 0 && (
        <div id="today-alert" className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white text-center py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest border-b border-amber-500/25 shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>S:. F:. U:. ¡HOY TENEMOS UNA CELEBRACIÓN DE NATALICIO ACTIVA EN LA LOGIA! 🎉</span>
        </div>
      )}

      {/* Main Structural Header Container in exact Geometric Balance Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <img 
              src="/src/assets/images/lodge_logo_1780075461158.png" 
              alt="Logo Giuseppe Garibaldi 114" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full shadow-md bg-stone-50 border border-stone-200/50 p-0.5 filter hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                Directorio de Cumpleaños
              </h1>
              <p className="text-slate-500 font-semibold text-[11px] sm:text-xs mt-0.5 uppercase tracking-widest font-mono">
                REGISTRO ANUAL DE MIEMBROS & ESTADÍSTICAS
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-start sm:justify-end">
            <button
              id="trigger-tribute-btn"
              onClick={() => {
                setBirthdayToEdit(null);
                setSelectedBirthdayForTribute(null);
                setIsTributeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 hover:scale-[1.015] active:scale-95 text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-amber-105" />
              <span>Homenajes WhatsApp 📱</span>
            </button>

            <button
              id="trigger-add-btn"
              onClick={() => {
                setBirthdayToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 hover:scale-[1.015] text-white active:scale-95 text-xs font-semibold uppercase tracking-wider shadow-sm border border-indigo-950/20 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Añadir Registro</span>
            </button>

            <button
              id="toggle-stats-btn"
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                showStats 
                  ? 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart4 className="w-4 h-4" />
              <span className="hidden sm:inline">{showStats ? 'Ocultar Análisis' : 'Mostrar Análisis'}</span>
              <span className="sm:hidden">{showStats ? 'Ocultar' : 'Análisis'}</span>
            </button>

            <button
              id="reset-db-btn"
              onClick={handleResetToDefault}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              title="Restablecer datos por defecto"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>
      </div>

      {/* Main Structural Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Ceremonial Custom Lodge Birthday Greeting Announcement */}
        {activeTodayBirthdayCount > 0 && (
          <div 
            id="lodge-announcement-card" 
            className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-amber-500/35 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-indigo-950/25 animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            {/* Elegant Masonic columns layout indicator side lines */}
            <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-amber-500/80"></div>
            <div className="absolute top-0 bottom-0 right-0 w-[4px] bg-amber-500/80"></div>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>

            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                  <span className="text-[12px] font-black">∴ ∴ ∴</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold tracking-widest text-sans font-mono block text-white/90">A:. B:. R:. L:. S:. GIUSEPPE GARIBALDI N° 114</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                  <span className="text-[12px] font-black">∴ ∴ ∴</span>
                </div>
              </div>

              <div className="py-2 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                  ★ circular oficial de felicitación ★
                </span>
                <h2 className="font-display text-2xl md:text-3xl text-white font-extrabold tracking-tight">
                  {todaysBirthdays.length === 1 ? 'Homenaje a un Hermano Celebrante' : 'Homenaje Colectivo de Natalicio'}
                </h2>
                <div className="w-16 h-[2.5px] bg-amber-500 mx-auto my-3 rounded-full"></div>
              </div>

              {/* Personalized notification statement */}
              <p className="font-sans text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed text-justify sm:text-center tracking-wide font-medium first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-400 first-letter:mr-2">
                {todaysBirthdays.length === 1 ? (
                  <>
                    La augusta y benemérita fraternidad comparte con hondo regocijo el natalicio de nuestro estimado hermano <strong className="text-white font-extrabold">{todaysBirthdays[0].name.toUpperCase()}</strong>, quien el día de hoy celebra <strong className="text-amber-400 font-extrabold">{getAge(todaysBirthdays[0].date, baseDate)} años</strong> de noble y fructífera existence terrenal. Que el Gran Arquitecto del Universo bendiga su sendero de luz tradicional, concediéndole siempre salud inquebrantable, sabiduría y paz inalterable.
                  </>
                ) : (
                  <>
                    La augusta y benemérita fraternidad se une para extender un fraternal saludo grupal de felicitaciones a nuestros distinguidos hermanos celebrantes:{' '}
                    {todaysBirthdays.map((b, i) => (
                      <span key={`group-celebrant-${b.id}`}>
                        {i > 0 && (i === todaysBirthdays.length - 1 ? ' y ' : ', ')}
                        <strong className="text-white font-extrabold">{b.name.toUpperCase()}</strong> ({getAge(b.date, baseDate)} años)
                      </span>
                    ))}
                    , en el feliz y noble aniversario de sus natalicios. Que la concordia fecunda, la ventura familiar y la iluminación masónica guíen perpetuamente cada una de sus obras y esfuerzos cotidianos.
                  </>
                )}
              </p>

              {/* Official Lodge validation sign-off */}
              <div className="pt-5 border-t border-dashed border-white/10 mt-4 flex flex-col items-center space-y-1">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                  CON EL MÁS FRATERNO ABRAZO, ENVÍA:
                </span>
                <span className="text-xs font-bold tracking-wider text-amber-400 font-mono bg-white/5 px-3.5 py-1.5 border border-white/10 rounded-xl">
                  A:. B:. R:. L:. S:. GIUSEPPE GARIBALDI N° 114
                </span>
                <span className="text-[10px] font-serif italic text-slate-300 pt-1">
                  Pto:. Geométrico, {baseDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).toUpperCase()} de {baseDate.getFullYear()} (E:. V:.)
                </span>
                
                <div className="pt-4 flex justify-center w-full">
                  <button
                    id="export-todays-tribute-btn"
                    onClick={() => {
                      if (todaysBirthdays.length > 0) {
                        setSelectedBirthdayForTribute(todaysBirthdays[0]);
                        setIsTributeModalOpen(true);
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 hover:scale-[1.015] active:scale-95 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg shadow-amber-500/20 border border-amber-400/30 transition-all duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse text-amber-100" />
                    <span>Generar Homenaje (JPG para WhatsApp) 📱</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Statistics Panel with toggle option */}
        {showStats && (
          <div className="animate-in fade-in duration-300">
            <StatsDashboard stats={stats} />
          </div>
        )}

        {/* Highlight Section: Next Up / Proximos Cumpleanos */}
        <section id="upcoming-showcase" className="bg-white p-6 rounded-2xl border border-slate-100 relative shadow-sm shadow-slate-100/40">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-4 h-4 text-indigo-900 animate-pulse" />
            <h2 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider">PRÓXIMAS CELEBRACIONES</h2>
            <span className="text-[9px] bg-indigo-50 text-indigo-900 px-2 py-0.5 font-bold uppercase tracking-widest rounded-md border border-indigo-100/30">PRONTO</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingBirthdays.map(({ birthday, days, nextAge }) => {
              const dateObj = new Date(birthday.date);
              const dayStr = parseDateComponents(birthday.date).day;
              const formattedDay = dayStr < 10 ? `0${dayStr}` : dayStr;
              const isToday = days === 0;

              return (
                <div
                  key={`upcoming-${birthday.id}`}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isToday
                      ? 'bg-amber-50/20 border-amber-300 shadow-sm shadow-amber-100/30'
                      : 'bg-slate-50/45 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider">
                        {MONTH_NAMES_ES[dateObj.getMonth()]} {formattedDay}
                      </span>
                      <h4 className="font-display font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-tight line-clamp-1 mt-0.5">
                        {birthday.name}
                      </h4>
                    </div>
                    {isToday ? (
                      <span className="text-lg animate-bounce">🎖️</span>
                    ) : (
                      <div className="bg-white px-2 py-0.5 border border-slate-100 rounded-md text-center text-xs font-mono font-bold tabular-nums">
                        <span className="font-bold text-slate-750 text-slate-705 text-slate-700">{days}d</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    {isToday ? (
                      <span className="text-amber-600 font-extrabold pb-0.5">¡Hoy cumple {nextAge} años! 🥳</span>
                    ) : (
                      <>Cumple <span className="font-bold text-slate-700">{nextAge} años</span></>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Filter Navigation & Search Section */}
        <section id="filters-controls-section" className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm shadow-slate-100/40">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                id="search-input"
                type="text"
                placeholder="BUSCAR NOMBRE DE HERMANO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold uppercase placeholder-slate-400 text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-900/5 focus:border-indigo-900 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-[9px] uppercase font-bold text-slate-450 hover:text-slate-900 bg-slate-250/50 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Quick Month Filter Selector */}
            <div className="w-full md:w-auto flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-auto bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold uppercase py-2.5 px-3.5 focus:outline-none text-slate-705 focus:bg-white focus:ring-4 focus:ring-indigo-900/5 focus:border-indigo-900 transition-all duration-200"
              >
                <option value="all">VER TODOS LOS MESES</option>
                {MONTH_NAMES_ES.map((monthName, i) => (
                  <option key={`opt-${i}`} value={i.toString()}>
                    {monthName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick interactive Month Badges */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 border ${
                selectedMonth === 'all'
                  ? 'bg-indigo-900 border-indigo-900 text-white shadow-sm shadow-indigo-900/10'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              Todos ({birthdays.length})
            </button>
            {MONTH_NAMES_ES.map((name, idx) => {
              const count = birthdays.filter(b => parseDateComponents(b.date).month - 1 === idx).length;
              return (
                <button
                  key={`badge-${idx}`}
                  onClick={() => setSelectedMonth(idx.toString())}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border ${
                    selectedMonth === idx.toString()
                      ? 'bg-indigo-900 border-indigo-900 text-white shadow-sm shadow-indigo-900/10'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                    selectedMonth === idx.toString() ? 'bg-indigo-950 text-white' : 'bg-slate-150 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Render Month Groups of Birthdays */}
        <section id="birthday-groups-container" className="space-y-10">
          {monthlyGroups.length > 0 ? (
            monthlyGroups.map((group) => {
              const currentMonthIndex = baseDate.getMonth();
              const isCurrentMonth = group.monthIndex === currentMonthIndex;
              const indicatorBg = MONTH_COLORS[group.monthIndex] || 'bg-slate-900';
              const formattedMonthIndex = group.monthIndex + 1 < 10 ? `0${group.monthIndex + 1}` : group.monthIndex + 1;

              return (
                <div 
                  key={`month-group-${group.monthIndex}`} 
                  id={`month-block-${group.monthIndex}`}
                  className="space-y-4 scroll-mt-24"
                >
                  {/* Category Month Title Header with solid line indicator */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display font-extrabold text-slate-800 text-xl tracking-tight uppercase">
                        {formattedMonthIndex} {group.monthName}
                      </h2>
                      {/* Geometric theme bar */}
                      <span className={`h-1.5 w-8 rounded-full ${indicatorBg}`}></span>
                      {isCurrentMonth && (
                        <span className="text-[9px] text-indigo-900 font-bold bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Mes en Curso
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-450 uppercase">
                      {group.birthdays.length} {group.birthdays.length === 1 ? 'REGISTRO' : 'REGISTROS'}
                    </span>
                  </div>

                  {/* Grid layout containing birthday records */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.birthdays.map((b) => (
                      <BirthdayCard
                        key={b.id}
                        birthday={b}
                        onEdit={handleTriggerEdit}
                        onDelete={handleDeleteBirthday}
                        onExportTribute={(birthday) => {
                          setSelectedBirthdayForTribute(birthday);
                          setIsTributeModalOpen(true);
                        }}
                        baseDate={baseDate}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* No Results Empty State */
            <div id="empty-state" className="bg-white p-12 text-center border border-slate-100 rounded-3xl max-w-lg mx-auto shadow-sm shadow-slate-100/50">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 text-xl font-mono font-black border border-slate-100">
                !
              </div>
              <h3 className="font-display font-bold text-slate-850 text-sm uppercase tracking-wider mb-1">
                No se encontraron cumpleaños
              </h3>
              <p className="text-slate-450 text-xs font-mono uppercase mb-6 max-w-sm mx-auto leading-relaxed">
                No hay resultados para la búsqueda "{searchTerm}"{selectedMonth !== 'all' && ` en el mes de ${getMonthName(parseInt(selectedMonth, 10))}`}.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('all');
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-slate-850 transition-all duration-200"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </section>

        {/* Elegant design footer from geometric layout */}
        <footer className="mt-16 border-t border-slate-205 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-900 rounded-full"></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Q1 (Ene-Mar)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Q2 (Abr-Jun)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-500 rounded-full"></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Q3 (Jul-Sep)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Q4 (Oct-Dic)</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            REGISTRO OFICIAL - RITO YORK MASÓNICO &nbsp;|&nbsp; G:. G:. 114
          </div>
        </footer>
      </main>

      {/* Add / Edit Birthday overlay modal logic */}
      <AddBirthdayModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setBirthdayToEdit(null);
        }}
        onSave={handleSaveBirthday}
        birthdayToEdit={birthdayToEdit}
      />

      {/* Tribute export module overlay modal logic */}
      <TributeExportModal
        isOpen={isTributeModalOpen}
        onClose={() => {
          setIsTributeModalOpen(false);
          setSelectedBirthdayForTribute(null);
        }}
        initialBirthday={selectedBirthdayForTribute}
        allBirthdays={birthdays}
        baseDate={baseDate}
      />
    </div>
  );
}


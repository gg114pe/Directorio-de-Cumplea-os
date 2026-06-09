import React, { useState, useEffect, useRef } from 'react';
import { Birthday } from '../types.ts';
import { X, Download, Eye, Sparkles, Languages, Settings2 } from 'lucide-react';
import { getAge, getZodiacSign, MONTH_NAMES_ES, parseDateComponents } from '../utils/birthdayHelpers.ts';
import { toJpeg } from 'html-to-image';

interface TributeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBirthday: Birthday | null;
  allBirthdays: Birthday[];
  baseDate?: Date;
}

type ThemeType = 'royal-navy' | 'masonic-gold' | 'parchment-vintage' | 'temple-charcoal';

export default function TributeExportModal({
  isOpen,
  onClose,
  initialBirthday,
  allBirthdays,
  baseDate = new Date()
}: TributeExportModalProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('★ CIRCULAR OFICIAL DE FELICITACIÓN ★');
  const [customLodgeName, setCustomLodgeName] = useState<string>('A:. B:. R:. L:. S:. GIUSEPPE GARIBALDI N° 114');
  const [customSignOff, setCustomSignOff] = useState<string>('Pto:. Geométrico, Pto:. de la Amistad (E:. V:.)');
  const [theme, setTheme] = useState<ThemeType>('royal-navy');
  const [showAge, setShowAge] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const captureRef = useRef<HTMLDivElement>(null);

  // Sync selected brother
  useEffect(() => {
    if (initialBirthday) {
      setSelectedId(initialBirthday.id);
    } else if (allBirthdays.length > 0) {
      setSelectedId(allBirthdays[0].id);
    }
  }, [initialBirthday, isOpen, allBirthdays]);

  if (!isOpen) return null;

  const currentBirthday = allBirthdays.find(b => b.id === selectedId) || initialBirthday || allBirthdays[0];

  if (!currentBirthday) return null;

  const age = getAge(currentBirthday.date, baseDate);
  const zodiac = getZodiacSign(currentBirthday.date);
  const { day, month, year } = parseDateComponents(currentBirthday.date);
  const formattedDay = day < 10 ? `0${day}` : day;
  const monthName = MONTH_NAMES_ES[month - 1];

  // Generate JPG helper
  const handleExportJPG = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    setSuccessMsg('');

    try {
      // Small timeout to ensure rendering is settled
      await new Promise(resolve => setTimeout(resolve, 250));

      const dataUrl = await toJpeg(captureRef.current, {
        quality: 0.95,
        pixelRatio: 2, // 2x scale for crisp mobile display on WhatsApp
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '540px' // Keep strict dimensions
        }
      });

      const fileName = `Homenaje_${currentBirthday.name.replace(/\s+/g, '_')}_G114.jpg`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setSuccessMsg('¡Homenaje generado e iniciado descarga! Listo para compartir por WhatsApp.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Error rendering image', error);
      alert('Hubo un error al generar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Pure CSS inline SVG for Masonic Seal (Square & Compasses with G)
  const MasonicBadge = ({ color = '#d97706' }: { color?: string }) => (
    <svg className="w-14 h-14 mx-auto drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="1.5" strokeDasharray="1 3" />
      <circle cx="50" cy="50" r="41" stroke={color} strokeWidth="1" />
      {/* Compasses (Upper) */}
      <path d="M50 20 L75 80" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 20 L25 80" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M43 32 L57 32" stroke={color} strokeWidth="1.5" />
      {/* Square (Lower) */}
      <path d="M25 50 L50 78 L75 50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* The Letter G */}
      <text x="50" y="56" fill={color} fontSize="18" fontFamily="Georgia, serif" fontWeight="bold" textAnchor="middle">G</text>
      {/* Three Dots ∴ */}
      <circle cx="50" cy="12" r="1.5" fill={color} />
      <circle cx="47" cy="16" r="1.5" fill={color} />
      <circle cx="53" cy="16" r="1.5" fill={color} />
    </svg>
  );

  // Theme Styles Configuration
  const getThemeStyles = () => {
    switch (theme) {
      case 'masonic-gold':
        return {
          bg: 'bg-gradient-to-b from-stone-900 via-amber-950/40 to-stone-950',
          border: 'border-amber-500/50',
          accent: 'text-amber-400',
          badgeColor: '#fbbf24',
          textMuted: 'text-stone-300',
          textTitle: 'text-white',
          textBody: 'text-stone-200',
          bannerBg: 'bg-stone-900/40 border-stone-800'
        };
      case 'parchment-vintage':
        return {
          bg: 'bg-gradient-to-b from-[#fbf8f0] to-[#f5ebd6]',
          border: 'border-amber-800/45',
          accent: 'text-amber-800',
          badgeColor: '#92400e',
          textMuted: 'text-stone-600',
          textTitle: 'text-amber-955 text-stone-900',
          textBody: 'text-stone-800',
          bannerBg: 'bg-[#ede0c4] border-[#dfcdab]'
        };
      case 'temple-charcoal':
        return {
          bg: 'bg-gradient-to-b from-slate-900 via-slate-900 to-zinc-950',
          border: 'border-slate-500/30',
          accent: 'text-indigo-400',
          badgeColor: '#818cf8',
          textMuted: 'text-slate-400',
          textTitle: 'text-white',
          textBody: 'text-slate-200',
          bannerBg: 'bg-slate-900/30 border-slate-800'
        };
      case 'royal-navy':
      default:
        return {
          bg: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950',
          border: 'border-amber-500/40',
          accent: 'text-amber-400',
          badgeColor: '#fbbf24',
          textMuted: 'text-slate-300',
          textTitle: 'text-white',
          textBody: 'text-slate-200',
          bannerBg: 'bg-white/5 border-white/10'
        };
    }
  };

  const t = getThemeStyles();

  return (
    <div id="tribute-export-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="tribute-export-container"
        className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-indigo-950/30 transform transition-all duration-300 border border-slate-100 flex flex-col md:flex-row my-8"
      >
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="w-full md:w-5/12 p-6 border-r border-slate-100 flex flex-col justify-between space-y-6 bg-slate-50/50">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-900" />
                <h3 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                  Exportar para WhatsApp
                </h3>
              </div>
              <button 
                id="tribute-close-btn-sidebar"
                onClick={onClose} 
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 font-medium uppercase font-mono tracking-tight leading-relaxed mb-6">
              Genera una tarjeta de felicitación fraternal y elegante con las triples de la Logia para enviar directamente por móvil.
            </p>

            <div className="space-y-4">
              {/* Brother Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Seleccionar Hermano
                </label>
                <select
                  id="tribute-brother-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold uppercase py-2.5 px-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-900/5 focus:border-indigo-900 transition-all duration-200"
                >
                  {allBirthdays.map((b) => {
                    const bDate = parseDateComponents(b.date);
                    return (
                      <option key={b.id} value={b.id}>
                        {b.name} ({bDate.day} de {MONTH_NAMES_ES[bDate.month - 1]})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Diseño Visual / Tema
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('royal-navy')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                      theme === 'royal-navy'
                        ? 'bg-indigo-950 border-indigo-950 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Royal Gold
                  </button>
                  <button
                    onClick={() => setTheme('masonic-gold')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                      theme === 'masonic-gold'
                        ? 'bg-stone-900 border-stone-900 text-amber-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    York Slate
                  </button>
                  <button
                    onClick={() => setTheme('parchment-vintage')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                      theme === 'parchment-vintage'
                        ? 'bg-amber-100/50 border-amber-800 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pergamino
                  </button>
                  <button
                    onClick={() => setTheme('temple-charcoal')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                      theme === 'temple-charcoal'
                        ? 'bg-slate-800 border-slate-800 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Templo Cincel
                  </button>
                </div>
              </div>

              {/* Show Age Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 my-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 font-mono">Mostrar Edad en Tarjeta</span>
                <button
                  type="button"
                  onClick={() => setShowAge(!showAge)}
                  className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none ${
                    showAge ? 'bg-indigo-900' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                      showAge ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Editable Lodge Settings */}
              <div className="space-y-2 pt-2 border-t border-slate-100/60">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <Settings2 className="w-3 h-3 text-slate-400" />
                  <span>Personalizar Textos</span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customLodgeName}
                    onChange={(e) => setCustomLodgeName(e.target.value)}
                    placeholder="Nombre de la Logia"
                    className="w-full bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase p-2 focus:outline-none focus:border-indigo-900"
                    title="Nombre oficial de la Logia"
                  />
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Título de la Circular"
                    className="w-full bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase p-2 focus:outline-none focus:border-indigo-900"
                    title="Título oficial de la Circular de Felicitación"
                  />
                  <input
                    type="text"
                    value={customSignOff}
                    onChange={(e) => setCustomSignOff(e.target.value)}
                    placeholder="Punto Geométrico"
                    className="w-full bg-white border border-slate-200 rounded-lg text-[10px] font-medium p-2 focus:outline-none focus:border-indigo-900"
                    title="Punto Geométrico de envío"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3.5">
            {successMsg && (
              <p className="p-2.5 bg-green-50 border border-green-150 rounded-xl text-[10px] text-green-700 font-bold uppercase tracking-wide text-center leading-relaxed">
                {successMsg}
              </p>
            )}

            <button
              id="tribute-download-btn"
              onClick={handleExportJPG}
              disabled={isExporting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 animate-bounce" />
              {isExporting ? 'Procesando...' : 'Descargar JPG de Homenaje'}
            </button>

            <div className="text-[9px] text-slate-450 uppercase font-mono text-center leading-normal">
              Recomendación: una vez descargada, envíale la imagen a tu hermano por <strong className="text-slate-600">WhatsApp</strong> para iluminar su día fraternal 🎁
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Live Image Preview & Modal Closure */}
        <div className="w-full md:w-7/12 bg-slate-900 p-8 flex flex-col items-center justify-center relative min-h-[500px]">
          {/* Header standard close button on top right */}
          <button 
            id="tribute-close-btn-desktop"
            onClick={onClose} 
            className="hidden md:flex absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none z-10"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4 font-mono">
            Vista Previa de Exportación Masónica
          </span>

          {/* CAPTURE ELEMENT TARGET DESIGN FOR WHATSAPP */}
          {/* We lock the capture box to exactly 540px width which renders perfectly inside our preview container using a responsive max-width wrapper */}
          <div className="w-full max-w-[420px] aspect-[4/5] sm:max-w-[450px] relative shadow-2xl rounded-2xl overflow-hidden border border-white/10">
            <div
              id="masonic-whatsapp-tribute-card"
              ref={captureRef}
              className={`w-[540px] h-[675px] ${t.bg} p-8 relative flex flex-col justify-between overflow-hidden select-none`}
              style={{
                // Scale card down to fit preview container nicely
                transform: 'scale(var(--preview-scale, 0.77))',
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                '--preview-scale': '0.77'
              } as React.CSSProperties}
            >
              {/* Geometric Golden Frame Lines */}
              <div className={`absolute top-4 bottom-4 left-4 right-4 border border-dashed ${t.border}`}></div>
              <div className={`absolute top-5 bottom-5 left-5 right-5 border ${t.border} p-1`}></div>

              {/* Sacred Corner Symbols (∴ Golden Dots) */}
              <span className={`absolute top-7 left-7 text-[12px] font-black ${t.accent} font-mono`}>∴</span>
              <span className={`absolute top-7 right-7 text-[12px] font-black ${t.accent} font-mono`}>∴</span>
              <span className={`absolute bottom-7 left-7 text-[12px] font-black ${t.accent} font-mono`}>∴</span>
              <span className={`absolute bottom-7 right-7 text-[12px] font-black ${t.accent} font-mono`}>∴</span>

              {/* CARD TOP CARDINAL COMPONENT */}
              <div className="text-center space-y-4 pt-4 z-10">
                <MasonicBadge color={t.badgeColor} />
                <div className="space-y-1">
                  <span className={`text-[11px] font-bold tracking-[0.25em] ${t.accent} uppercase font-mono block`}>
                    ★ s:. f:. u:. ★
                  </span>
                  <p className={`text-[12px] font-bold tracking-widest uppercase font-mono leading-snug max-w-[420px] mx-auto ${t.textMuted}`}>
                    {customLodgeName}
                  </p>
                </div>
                <div className="w-16 h-[2.5px] bg-amber-500 mx-auto rounded-full"></div>
              </div>

              {/* CARD CENTER COMPONENT */}
              <div className="text-center space-y-5 px-6 z-10 my-auto">
                <div className="space-y-1">
                  <span className={`text-[9px] font-bold uppercase tracking-[0.3em] font-mono block ${t.accent}`}>
                    {customTitle}
                  </span>
                  <h2 className={`font-display text-2.5xl font-black uppercase tracking-tight leading-none drop-shadow-sm ${t.textTitle}`}>
                    Tributo Fraternal
                  </h2>
                </div>

                <div className={`p-4 rounded-xl border ${t.bannerBg} space-y-1.5`}>
                  <p className={`text-[9.5px] font-black tracking-widest font-mono uppercase ${t.accent}`}>
                    Hermano Celebrante de Natalicio
                  </p>
                  <h3 className="font-display text-xl font-bold tracking-tight text-white uppercase" style={{ color: theme === 'parchment-vintage' ? '#1c1917' : undefined }}>
                    {currentBirthday.name}
                  </h3>
                  <p className={`text-[10px] font-bold tracking-widest font-mono uppercase ${t.textMuted}`}>
                    {monthName} {formattedDay} • REGISTRO ANUAL
                  </p>
                </div>

                <p className={`font-sans text-[11px] font-medium leading-relaxed tracking-wide text-justify ${t.textBody}`}>
                  La augusta y benemérita fraternidad comparte con hondo regocijo e iluminado afecto el natalicio de nuestro estimado hermano celebrante, deseándole que el Gran Arquitecto del Universo bendiga siempre su sendero tradicional con salud inquebrantable, sabiduría y paz inalterable. ¡Salud, Fuerza y Unión!
                </p>

                {showAge && (
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest font-mono ${t.textMuted}`}>Cumple</span>
                    <span 
                      className={`text-base font-extrabold font-mono px-2.5 py-0.5 rounded-lg border ${t.border} ${
                        theme === 'parchment-vintage' 
                          ? 'text-stone-900 bg-stone-800/5' 
                          : `${t.accent} bg-white/5`
                      }`}
                    >
                      {age} AÑOS
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest font-mono ${t.textMuted}`}>Zodíaco {zodiac.symbol} {zodiac.name}</span>
                  </div>
                )}
              </div>

              {/* CARD BOTTOM STAMP FOOTER */}
              <div className="text-center pb-4 z-10 space-y-1.5">
                <div className={`w-20 h-[1px] mx-auto rounded-full ${t.border} opacity-50`}></div>
                <p className={`text-[8.5px] font-bold tracking-widest font-mono uppercase ${t.textMuted}`}>
                  Bajo la Bóveda Celeste – {customSignOff}
                </p>
                <p className={`text-[9.5px] font-serif italic ${t.accent}`}>
                  Aniversario Natalicio de Luz, E:. V:. {baseDate.getFullYear()}
                </p>
              </div>
            </div>

            {/* Simulated placeholder box so layout stays fully responsive while absolute scale exists */}
            <div id="masonic-whatsapp-tribute-card-placeholder" className="pointer-events-none"></div>
          </div>

          <div className="text-[10.5px] text-white/40 uppercase font-mono mt-4 text-center select-none leading-relaxed">
            Área de descarga optimizada &apos;WhatsApp Portrait Layout&apos; (540x675px en alta densidad)
          </div>
        </div>
      </div>
    </div>
  );
}

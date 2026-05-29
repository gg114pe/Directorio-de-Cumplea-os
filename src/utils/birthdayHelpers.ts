import { Birthday, Statistics } from '../types.ts';

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const ZODIAC_SIGNS = [
  { name: 'Capricornio', symbol: '♑', start: { m: 12, d: 22 }, end: { m: 1, d: 19 }, color: 'from-slate-500 to-slate-700' },
  { name: 'Acuario', symbol: '♒', start: { m: 1, d: 20 }, end: { m: 2, d: 18 }, color: 'from-blue-400 to-indigo-500' },
  { name: 'Piscis', symbol: '♓', start: { m: 2, d: 19 }, end: { m: 3, d: 20 }, color: 'from-cyan-400 to-teal-500' },
  { name: 'Aries', symbol: '♈', start: { m: 3, d: 21 }, end: { m: 4, d: 19 }, color: 'from-red-500 to-orange-500' },
  { name: 'Tauro', symbol: '♉', start: { m: 4, d: 20 }, end: { m: 5, d: 20 }, color: 'from-emerald-500 to-green-600' },
  { name: 'Géminis', symbol: '♊', start: { m: 5, d: 21 }, end: { m: 6, d: 20 }, color: 'from-amber-400 to-yellow-500' },
  { name: 'Cáncer', symbol: '♋', start: { m: 6, d: 21 }, end: { m: 7, d: 22 }, color: 'from-sky-400 to-blue-500' },
  { name: 'Leo', symbol: '♌', start: { m: 7, d: 23 }, end: { m: 8, d: 22 }, color: 'from-yellow-500 to-orange-600' },
  { name: 'Virgo', symbol: '♍', start: { m: 8, d: 23 }, end: { m: 9, d: 22 }, color: 'from-teal-600 to-emerald-700' },
  { name: 'Libra', symbol: '♎', start: { m: 9, d: 23 }, end: { m: 10, d: 22 }, color: 'from-pink-400 to-rose-400' },
  { name: 'Escorpio', symbol: '♏', start: { m: 10, d: 23 }, end: { m: 11, d: 21 }, color: 'from-purple-600 to-indigo-800' },
  { name: 'Sagitario', symbol: '♐', start: { m: 11, d: 22 }, end: { m: 12, d: 21 }, color: 'from-violet-500 to-purple-600' }
];

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES_ES[monthIndex] || '';
}

/**
 * Calculates current age from a birthday string formatted as 'YYYY-MM-DD'
 */
export function getAge(dateStr: string, baseDate: Date = new Date()): number {
  const birthDate = new Date(dateStr);
  if (isNaN(birthDate.getTime())) return 0;

  let age = baseDate.getFullYear() - birthDate.getFullYear();
  const m = baseDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && baseDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Normalizes input date format and parses components
 */
export function parseDateComponents(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10), // 1-12
    day: parseInt(parts[2], 10)
  };
}

/**
 * Gets the Zodiac sign from the date
 */
export function getZodiacSign(dateStr: string): { name: string; symbol: string; color: string } {
  const { month, day } = parseDateComponents(dateStr);
  
  const match = ZODIAC_SIGNS.find(z => {
    // Standard signs range matching
    const startM = z.start.m;
    const startD = z.start.d;
    const endM = z.end.m;
    const endD = z.end.d;

    if (startM < endM) {
      return (month === startM && day >= startD) || (month === endM && day <= endD);
    } else {
      // Handles December to January wrapping
      return (month === startM && day >= startD) || (month === endM && day <= endD);
    }
  });

  return match || { name: 'Desconocido', symbol: '✨', color: 'from-gray-400 to-gray-500' };
}

/**
 * Calculates the number of days until the user's next birthday.
 * Returns the countdown value, the target Date, and the next age they will turn.
 */
export function getDaysUntil(dateStr: string, baseDate: Date = new Date()): { days: number; targetDate: Date; nextAge: number } {
  const birthDate = new Date(dateStr);
  if (isNaN(birthDate.getTime())) {
    return { days: 999, targetDate: new Date(), nextAge: 0 };
  }

  const { month, day, year: birthYear } = parseDateComponents(dateStr);
  
  // Create current-year celebration date
  const targetYear = baseDate.getFullYear();
  let targetDate = new Date(targetYear, month - 1, day);
  
  // Set both to midnight to ignore time comparison discrepancies
  const todayMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  
  if (targetDate.getTime() < todayMidnight.getTime()) {
    // Already happened this year, next one is next year
    targetDate = new Date(targetYear + 1, month - 1, day);
  }
  
  const diffTime = targetDate.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const nextAge = targetDate.getFullYear() - birthYear;

  return {
    days: diffDays,
    targetDate,
    nextAge
  };
}

/**
 * Aggregates statistics about the birthdays
 */
export function calculateStatistics(birthdays: Birthday[], baseDate: Date = new Date()): Statistics {
  const totalCount = birthdays.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      averageAge: 0,
      zodiacDistribution: {},
      mostCommonZodiac: 'Ninguno',
      monthDistribution: {}
    };
  }

  let totalAge = 0;
  const zodiacDistribution: Record<string, number> = {};
  const monthDistribution: Record<number, number> = {};

  // Pre-populate months with 0
  for (let i = 0; i < 12; i++) {
    monthDistribution[i] = 0;
  }

  birthdays.forEach(b => {
    totalAge += getAge(b.date, baseDate);
    
    // Zodiac
    const zod = getZodiacSign(b.date).name;
    zodiacDistribution[zod] = (zodiacDistribution[zod] || 0) + 1;

    // Month (0-11)
    const { month } = parseDateComponents(b.date);
    const mIdx = month - 1;
    monthDistribution[mIdx] = (monthDistribution[mIdx] || 0) + 1;
  });

  const averageAge = Math.round((totalAge / totalCount) * 10) / 10;

  let mostCommonZodiac = 'Ninguno';
  let maxZodCount = 0;
  Object.entries(zodiacDistribution).forEach(([z, count]) => {
    if (count > maxZodCount) {
      maxZodCount = count;
      mostCommonZodiac = z;
    }
  });

  return {
    totalCount,
    averageAge,
    zodiacDistribution,
    mostCommonZodiac,
    monthDistribution
  };
}

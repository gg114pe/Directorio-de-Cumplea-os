export interface Birthday {
  id: string;
  name: string;
  date: string; // Format: YYYY-MM-DD
}

export type SortField = 'date' | 'name' | 'day';
export type SortOrder = 'asc' | 'desc';

export interface MonthGroup {
  monthIndex: number; // 0-11
  monthName: string;
  birthdays: Birthday[];
}

export interface Statistics {
  totalCount: number;
  averageAge: number;
  zodiacDistribution: Record<string, number>;
  mostCommonZodiac: string;
  monthDistribution: Record<number, number>;
}

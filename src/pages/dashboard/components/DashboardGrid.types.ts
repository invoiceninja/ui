import type { GridStackNode } from 'gridstack';

export type DashboardBreakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface DashboardGridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export type DashboardGridLayout = DashboardGridItem[];

export type DashboardGridLayouts = Record<DashboardBreakpoint, DashboardGridLayout> &
  Record<string, DashboardGridLayout>;

export interface DashboardGridMetrics {
  cols: number;
  rowHeight: number;
}

export interface DashboardGridHandle {
  serialize: () => DashboardGridItem[];
  getNodes: () => GridStackNode[];
}

export interface ChartData {
  invoices: {
    total: string;
    date: string;
    currency: string;
  }[];
  payments: {
    total: string;
    date: string;
    currency: string;
  }[];
  outstanding: {
    total: string;
    date: string;
    currency: string;
  }[];
  expenses: {
    total: string;
    date: string;
    currency: string;
  }[];
}

export enum TotalColors {
  Green = '#54B434',
  Blue = '#2596BE',
  Red = '#BE4D25',
  Gray = '#242930',
}


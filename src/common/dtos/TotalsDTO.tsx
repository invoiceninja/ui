export interface TotalDataDTO {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  outstanding: {};
}
export interface ChartDataDTO {
  invoices: { total: string; date: string; currency: string }[];
  payments: { total: string; date: string; currency: string }[];
  expenses: {
    total: string;
    date: string;
    currency: string;
  }[];
}
export interface ChartMapDTO {
  name:string,invoices:string,expenses:string,payments:string
}

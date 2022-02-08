export interface TotalDataDTO {
  revenue: {
    paid_to_date: string;
    currency_id: string;
    code: string;
  };
  outstanding: {
    paid_to_date: string;
    currency_id: string;
    code: string;
  };
  expenses: {
    paid_to_date: string;
    currency_id: string;
    code: string;
  };
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
export interface ChardMapDTO{
    
        name: string
        uv: number,
        

}

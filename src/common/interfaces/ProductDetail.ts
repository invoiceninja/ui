export interface Product {
  id: string;
  user_id: string;
  assigned_user_id: string;
  product_key: string;
  notes: string;
  cost: number;
  price: number;
  quantity: number;
  tax_name1: string;
  tax_rate1: number;
  tax_name2: string;
  tax_rate2: number;
  tax_name3: string;
  tax_rate3: number;
  created_at: number;
  updated_at: number;
  archived_at: number;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  is_deleted: boolean;
  documents: any[];
}

import {
  DashboardCardField,
  Field,
  Format,
  Period,
  Calculate,
} from '../interfaces/company-user';

export function encodeDashboardField(
  field: Field,
  period: Period,
  calculate: Calculate,
  format: Format,
  index: number
): string {
  return `${field}|${period}|${calculate}|${format}|${index}`;
}

export function decodeDashboardField(key: string): DashboardCardField {
  const [field, period, calculate, format] = key.split('|');
  return {
    key,
    field: field as Field,
    period: period as Period,
    calculate: calculate as Calculate,
    format: format as Format,
  };
}

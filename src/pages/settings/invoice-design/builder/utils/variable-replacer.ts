/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Sample invoice data structure for preview
 */
export interface InvoiceData {
  invoice: {
    number: string;
    date: string;
    due_date: string;
    po_number: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paid_to_date: number;
    balance: number;
    public_url: string;
  };
  client: {
    name: string;
    address: string;
    city_state_postal: string;
    phone: string;
    email: string;
  };
  company: {
    name: string;
    logo: string;
    address: string;
    city_state_postal: string;
    phone: string;
    email: string;
  };
  line_items: Array<{
    product_key: string;
    notes: string;
    quantity: number;
    cost: number;
    line_total: number;
  }>;
}

/**
 * Sample invoice data for preview purposes
 */
export const SAMPLE_INVOICE_DATA: InvoiceData = {
  invoice: {
    number: 'INV-0001',
    date: '2025-12-09',
    due_date: '2025-12-23',
    po_number: 'PO-2025-001',
    subtotal: 1500.00,
    tax: 150.00,
    discount: 0.00,
    total: 1650.00,
    paid_to_date: 0.00,
    balance: 1650.00,
    public_url: 'https://example.com/invoice/view/INV-0001',
  },
  client: {
    name: 'Acme Corporation',
    address: '123 Business Street',
    city_state_postal: 'New York, NY 10001',
    phone: '(555) 123-4567',
    email: 'billing@acme.com',
  },
  company: {
    name: 'Your Company LLC',
    logo: 'https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=Company+Logo',
    address: '456 Commerce Avenue',
    city_state_postal: 'San Francisco, CA 94102',
    phone: '(555) 987-6543',
    email: 'hello@yourcompany.com',
  },
  line_items: [
    {
      product_key: 'WEB-DESIGN',
      notes: 'Website Design & Development',
      quantity: 1,
      cost: 1000.00,
      line_total: 1000.00,
    },
    {
      product_key: 'CONSULTING',
      notes: 'Technical Consulting Services',
      quantity: 5,
      cost: 100.00,
      line_total: 500.00,
    },
  ],
};

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Replace variables in a string with actual data
 *
 * @param template - String containing variables like $client.name
 * @param data - Invoice data
 * @returns String with variables replaced
 */
export function replaceVariables(template: string, data: InvoiceData): string {
  let result = template;

  // Company variables
  result = result.replace(/\$company\.name/g, data.company.name);
  result = result.replace(/\$company\.logo/g, data.company.logo);
  result = result.replace(/\$company\.address/g, data.company.address);
  result = result.replace(/\$company\.city_state_postal/g, data.company.city_state_postal);
  result = result.replace(/\$company\.phone/g, data.company.phone);
  result = result.replace(/\$company\.email/g, data.company.email);

  // Client variables
  result = result.replace(/\$client\.name/g, data.client.name);
  result = result.replace(/\$client\.address/g, data.client.address);
  result = result.replace(/\$client\.city_state_postal/g, data.client.city_state_postal);
  result = result.replace(/\$client\.phone/g, data.client.phone);
  result = result.replace(/\$client\.email/g, data.client.email);

  // Invoice variables
  result = result.replace(/\$invoice\.number/g, data.invoice.number);
  result = result.replace(/\$invoice\.date/g, formatDate(data.invoice.date));
  result = result.replace(/\$invoice\.due_date/g, formatDate(data.invoice.due_date));
  result = result.replace(/\$invoice\.po_number/g, data.invoice.po_number);
  result = result.replace(/\$invoice\.subtotal/g, formatCurrency(data.invoice.subtotal));
  result = result.replace(/\$invoice\.tax/g, formatCurrency(data.invoice.tax));
  result = result.replace(/\$invoice\.discount/g, formatCurrency(data.invoice.discount));
  result = result.replace(/\$invoice\.total/g, formatCurrency(data.invoice.total));
  result = result.replace(/\$invoice\.paid_to_date/g, formatCurrency(data.invoice.paid_to_date));
  result = result.replace(/\$invoice\.balance/g, formatCurrency(data.invoice.balance));
  result = result.replace(/\$invoice\.public_url/g, data.invoice.public_url);

  return result;
}

/**
 * Resolve a single variable path to its value
 *
 * @param variable - Variable like "$item.product_key" or "$client.name"
 * @param itemData - Line item data (for $item variables)
 * @param invoiceData - Full invoice data
 * @returns Resolved value
 */
export function resolveVariable(
  variable: string,
  itemData: InvoiceData['line_items'][0] | null,
  invoiceData: InvoiceData
): string {
  // Handle line item variables
  if (variable.startsWith('$item.') && itemData) {
    const field = variable.replace('$item.', '') as keyof typeof itemData;
    const value = itemData[field];

    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return String(value);
  }

  // Handle other variables using replaceVariables
  return replaceVariables(variable, invoiceData);
}

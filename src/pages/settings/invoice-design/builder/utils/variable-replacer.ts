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
    discount: number;
    total: number;
    paid_to_date: number;
    balance: number;
    public_url: string;
    public_notes: string;
    footer: string;
    terms: string;
    total_taxes: number;
    label: string;
    custom_value1: string;
    custom_value2: string;
    custom_value3: string;
    custom_value4: string;
    tax: number;
    created_at: string;
    updated_at: string;
    partial_due_date: string;
  };
  subtotal: number;
  client: {
    name: string;
    address: string;
    city_state_postal: string;
    phone: string;
    email: string;
    custom_value1: string;
    custom_value2: string;
    custom_value3: string;
    custom_value4: string;
    vat_number: string;
    contact_name: string;
  };
  company: {
    name: string;
    logo: string;
    address: string;
    city_state_postal: string;
    phone: string;
    email: string;
    custom_value1: string;
    custom_value2: string;
    custom_value3: string;
    custom_value4: string;
    website: string;
    vat_number: string;
  };
  line_items: Array<{
    product_key: string;
    notes: string;
    quantity: number;
    cost: number;
    net_cost: number;
    line_total: number;
    discount: number;
    tax_rate1: string;
    custom_value1: string;
    custom_value2: string;
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
    subtotal: 1500.0,
    discount: 0.0,
    total: 1650.0,
    paid_to_date: 0.0,
    balance: 1650.0,
    total_taxes: 150.0,
    public_url: 'https://example.com/invoice/view/INV-0001',
    public_notes: 'Thank you for your business! Payment is due within 14 days.',
    footer:
      'If you have any questions, please contact us at hello@yourcompany.com',
    terms:
      'Payment is due within 14 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.',
    label: 'INVOICE',
    custom_value1: 'Custom Invoice Field 1',
    custom_value2: 'Custom Invoice Field 2',
    custom_value3: 'Custom Invoice Field 3',
    custom_value4: 'Custom Invoice Field 4',
    tax: 150.0,
    created_at: '2025-12-01',
    updated_at: '2025-12-09',
    partial_due_date: '2025-12-15',
  },
  subtotal: 1500.0,
  client: {
    name: 'Acme Corporation',
    address: '123 Business Street',
    city_state_postal: 'New York, NY 10001',
    phone: '(555) 123-4567',
    email: 'billing@acme.com',
    custom_value1: 'Custom Client Field 1',
    custom_value2: 'Custom Client Field 2',
    custom_value3: 'Custom Client Field 3',
    custom_value4: 'Custom Client Field 4',
    vat_number: 'VAT789012',
    contact_name: 'Jane Smith',
  },
  company: {
    name: 'Your Company LLC',
    logo: '/logo180.png',
    address: '456 Commerce Avenue',
    city_state_postal: 'San Francisco, CA 94102',
    phone: '(555) 987-6543',
    email: 'hello@yourcompany.com',
    custom_value1: 'Custom Company Field 1',
    custom_value2: 'Custom Company Field 2',
    custom_value3: 'Custom Company Field 3',
    custom_value4: 'Custom Company Field 4',
    website: 'www.yourcompany.com',
    vat_number: 'VAT123456',
  },
  line_items: [
    {
      product_key: 'WEB-DESIGN',
      notes: 'Website Design & Development',
      quantity: 1,
      cost: 1000.0,
      net_cost: 1000.0,
      line_total: 1000.0,
      discount: 0.0,
      tax_rate1: '10%',
      custom_value1: 'Custom Item Field 1',
      custom_value2: 'Custom Item Field 2',
    },
    {
      product_key: 'CONSULTING',
      notes: 'Technical Consulting Services',
      quantity: 5,
      cost: 100.0,
      net_cost: 100.0,
      line_total: 500.0,
      discount: 0.0,
      tax_rate1: '10%',
      custom_value1: 'Custom Item Field 1',
      custom_value2: 'Custom Item Field 2',
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
export function replaceVariables(
  template: string,
  data?: InvoiceData
): string {
  if (typeof template !== 'string') {
    return '';
  }

  // When no data is supplied we're in "save mode" — leave tokens literal
  // so the backend (HtmlEngine::parseLabelsAndValues) can substitute them.
  if (!data) {
    return template;
  }

  let result = template;

  // Company variables
  result = result.replace(/\$company\.name/g, data.company.name);
  result = result.replace(/\$company\.logo/g, data.company.logo);
  result = result.replace(/\$company\.address/g, data.company.address);
  result = result.replace(
    /\$company\.city_state_postal/g,
    data.company.city_state_postal
  );
  result = result.replace(/\$company\.phone/g, data.company.phone);
  result = result.replace(/\$company\.email/g, data.company.email);
  result = result.replace(/\$company\.website/g, data.company.website);
  result = result.replace(/\$company\.vat_number/g, data.company.vat_number);
  result = result.replace(/\$company\.custom_value1/g, data.company.custom_value1);
  result = result.replace(/\$company\.custom_value2/g, data.company.custom_value2);
  result = result.replace(/\$company\.custom_value3/g, data.company.custom_value3);
  result = result.replace(/\$company\.custom_value4/g, data.company.custom_value4);

  // Client variables
  result = result.replace(/\$client\.name/g, data.client.name);
  result = result.replace(/\$client\.address/g, data.client.address);
  result = result.replace(
    /\$client\.city_state_postal/g,
    data.client.city_state_postal
  );
  result = result.replace(/\$client\.phone/g, data.client.phone);
  result = result.replace(/\$client\.email/g, data.client.email);
  result = result.replace(/\$client\.vat_number/g, data.client.vat_number);
  result = result.replace(/\$client\.contact_name/g, data.client.contact_name);
  result = result.replace(/\$client\.custom_value1/g, data.client.custom_value1);
  result = result.replace(/\$client\.custom_value2/g, data.client.custom_value2);
  result = result.replace(/\$client\.custom_value3/g, data.client.custom_value3);
  result = result.replace(/\$client\.custom_value4/g, data.client.custom_value4);

  // Invoice variables (legacy $entity.* aliases)
  result = result.replace(/\$entity\.number/g, data.invoice.number);
  result = result.replace(/\$entity\.date/g, formatDate(data.invoice.date));
  result = result.replace(
    /\$entity\.due_date/g,
    formatDate(data.invoice.due_date)
  );
  result = result.replace(/\$entity\.po_number/g, data.invoice.po_number);
  result = result.replace(/\$entity\.public_url/g, data.invoice.public_url);
  result = result.replace(/\$entity\.public_notes/g, data.invoice.public_notes);
  result = result.replace(/\$entity\.footer/g, data.invoice.footer);
  result = result.replace(/\$entity\.terms/g, data.invoice.terms);
  result = result.replace(/\$entity\.custom_value1/g, data.invoice.custom_value1);
  result = result.replace(/\$entity\.custom_value2/g, data.invoice.custom_value2);
  result = result.replace(/\$entity\.custom_value3/g, data.invoice.custom_value3);
  result = result.replace(/\$entity\.custom_value4/g, data.invoice.custom_value4);

  // Invoice variables ($invoice.* aliases - same as $entity.*)
  result = result.replace(/\$invoice\.number/g, data.invoice.number);
  result = result.replace(/\$invoice\.date/g, formatDate(data.invoice.date));
  result = result.replace(
    /\$invoice\.due_date/g,
    formatDate(data.invoice.due_date)
  );
  result = result.replace(/\$invoice\.po_number/g, data.invoice.po_number);
  result = result.replace(/\$invoice\.public_url/g, data.invoice.public_url);
  result = result.replace(/\invoice\.public_notes/g, data.invoice.public_notes);
  result = result.replace(/\$invoice\.terms/g, data.invoice.terms);
  result = result.replace(/\$invoice\.custom_value1/g, data.invoice.custom_value1);
  result = result.replace(/\$invoice\.custom_value2/g, data.invoice.custom_value2);
  result = result.replace(/\$invoice\.custom_value3/g, data.invoice.custom_value3);
  result = result.replace(/\$invoice\.custom_value4/g, data.invoice.custom_value4);
  result = result.replace(/\$invoice\.subtotal/g, formatCurrency(data.invoice.subtotal));
  result = result.replace(/\$invoice\.discount/g, formatCurrency(data.invoice.discount));
  result = result.replace(/\$invoice\.tax/g, formatCurrency(data.invoice.tax));
  result = result.replace(/\$invoice\.total/g, formatCurrency(data.invoice.total));
  result = result.replace(/\$invoice\.paid_to_date/g, formatCurrency(data.invoice.paid_to_date));
  result = result.replace(/\$invoice\.balance/g, formatCurrency(data.invoice.balance));
  result = result.replace(/\$invoice\.created_at/g, formatDate(data.invoice.created_at));
  result = result.replace(/\$invoice\.updated_at/g, formatDate(data.invoice.updated_at));
  result = result.replace(/\$invoice\.partial_due_date/g, formatDate(data.invoice.partial_due_date));

  // Flat entity-details variables (match API: HtmlEngine.php)
  // Order: longer tokens first; \b prevents $date matching inside $date_company_now etc.
  result = result.replace(/\$entity_label\b/g, data.invoice.label);
  result = result.replace(/\$po_number\b/g, data.invoice.po_number);
  result = result.replace(/\$due_date\b/g, formatDate(data.invoice.due_date));
  result = result.replace(/\$public_url\b/g, data.invoice.public_url);
  result = result.replace(/\$public_notes\b/g, data.invoice.public_notes);
  result = result.replace(/\$footer\b/g, data.invoice.footer);
  result = result.replace(/\$terms\b/g, data.invoice.terms);
  result = result.replace(/\$number\b/g, data.invoice.number);
  result = result.replace(/\$date\b/g, formatDate(data.invoice.date));
  result = result.replace(/\$amount\b/g, formatCurrency(data.invoice.total));

  // Flat total variables (match API: HtmlEngine.php)
  // Order matters — longer tokens first so $balance doesn't eat $balance_due,
  // and \b stops $total from matching inside $total_anything.
  result = result.replace(
    /\$balance_due\b/g,
    formatCurrency(data.invoice.balance)
  );
  result = result.replace(
    /\$paid_to_date\b/g,
    formatCurrency(data.invoice.paid_to_date)
  );
  result = result.replace(
    /\$subtotal\b/g,
    formatCurrency(data.invoice.subtotal)
  );
  result = result.replace(
    /\$discount\b/g,
    formatCurrency(data.invoice.discount)
  );
  result = result.replace(
    /\$taxes\b/g,
    formatCurrency(data.invoice.total_taxes)
  );
  result = result.replace(/\$total\b/g, formatCurrency(data.invoice.total));
  result = result.replace(/\$balance\b/g, formatCurrency(data.invoice.balance));
  result = result.replace(/\$partial\b/g, formatCurrency(0));

  // QR Code variables (placeholders for preview)
  result = result.replace(/\$payment_qr_code/g, '[Payment QR Code]');
  result = result.replace(/\$sepa_qr_code/g, '[SEPA/EPC QR Code]');
  result = result.replace(/\$swiss_qr/g, '[Swiss QR Bill]');
  result = result.replace(/\$spc_qr_code/g, '[SPC QR Code]');
  result = result.replace(/\$verifactu_qr_code/g, '[Verifactu QR Code]');

  return result;
}

/**
 * Resolve a single variable path to its value
 *
 * @param variable - Variable like "item.product_key" or "item.quantity"
 * @param itemData - Line item data (for item variables)
 * @param invoiceData - Full invoice data
 * @returns Resolved value
 */
export function resolveVariable(
  variable: string,
  itemData: InvoiceData['line_items'][0] | null,
  invoiceData?: InvoiceData
): string {
  // Save mode — emit the variable literal so the backend substitutes it.
  if (!invoiceData) {
    return variable;
  }

  // Handle item.field format (e.g., "item.product_key")
  if (variable.startsWith('item.') && itemData) {
    const field = variable.replace('item.', '') as keyof typeof itemData;
    const value = itemData[field];

    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return String(value);
  }

  // Handle other variables using replaceVariables
  return replaceVariables(variable, invoiceData);
}

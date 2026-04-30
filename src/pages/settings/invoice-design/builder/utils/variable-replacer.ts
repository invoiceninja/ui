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
    custom_surcharge1: number;
    custom_surcharge2: number;
    custom_surcharge3: number;
    custom_surcharge4: number;
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
    number: string;
    address: string;
    address1: string;
    address2: string;
    city_state_postal: string;
    postal_city_state: string;
    country: string;
    id_number: string;
    phone: string;
    email: string;
    custom_value1: string;
    custom_value2: string;
    custom_value3: string;
    custom_value4: string;
    vat_number: string;
    contact_name: string;
    contact_full_name: string;
    contact_email: string;
    contact_phone: string;
    contact_custom_value1: string;
    contact_custom_value2: string;
    contact_custom_value3: string;
    contact_custom_value4: string;
    shipping_address1: string;
    shipping_address2: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    location_name: string;
    location_custom_value1: string;
    location_custom_value2: string;
    location_custom_value3: string;
    location_custom_value4: string;
  };
  company: {
    name: string;
    logo: string;
    address: string;
    address1: string;
    address2: string;
    city_state_postal: string;
    postal_city_state: string;
    country: string;
    id_number: string;
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
    gross_line_total: number;
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
    custom_surcharge1: 25.0,
    custom_surcharge2: 0.0,
    custom_surcharge3: 0.0,
    custom_surcharge4: 0.0,
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
    number: 'CLIENT-0001',
    address: '123 Business Street',
    address1: '123 Business Street',
    address2: 'Suite 200',
    city_state_postal: 'New York, NY 10001',
    postal_city_state: '10001 New York, NY',
    country: 'United States',
    id_number: 'ID-456789',
    phone: '(555) 123-4567',
    email: 'billing@acme.com',
    custom_value1: 'Custom Client Field 1',
    custom_value2: 'Custom Client Field 2',
    custom_value3: 'Custom Client Field 3',
    custom_value4: 'Custom Client Field 4',
    vat_number: 'VAT789012',
    contact_name: 'Jane Smith',
    contact_full_name: 'Jane Smith',
    shipping_address1: '400 Warehouse Way',
    shipping_address2: 'Loading Dock B',
    shipping_city: 'Jersey City',
    shipping_state: 'NJ',
    shipping_postal_code: '07305',
    shipping_country: 'United States',
    location_name: 'Main Location',
    location_custom_value1: 'Custom Location Field 1',
    location_custom_value2: 'Custom Location Field 2',
    location_custom_value3: 'Custom Location Field 3',
    location_custom_value4: 'Custom Location Field 4',
    contact_email: 'jane@acme.com',
    contact_phone: '(555) 123-4567',
    contact_custom_value1: 'Custom Contact Field 1',
    contact_custom_value2: 'Custom Contact Field 2',
    contact_custom_value3: 'Custom Contact Field 3',
    contact_custom_value4: 'Custom Contact Field 4',
  },
  company: {
    name: 'Your Company LLC',
    logo: '/logo180.png',
    address: '456 Commerce Avenue',
    address1: '456 Commerce Avenue',
    address2: 'Floor 12',
    city_state_postal: 'San Francisco, CA 94102',
    postal_city_state: '94102 San Francisco, CA',
    country: 'United States',
    id_number: 'CO-ID-987654',
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
      gross_line_total: 1100.0,
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
      gross_line_total: 550.0,
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
  // Order: longest tokens first (address1/2 before address) and \b on bare tokens
  // so $company.address doesn't swallow $company.address1, and $company.country
  // doesn't collide with any $company.country_* future tokens.
  result = result.replace(/\$company\.name\b/g, data.company.name);
  result = result.replace(/\$company\.logo\b/g, data.company.logo);
  result = result.replace(/\$company\.address1\b/g, data.company.address1);
  result = result.replace(/\$company\.address2\b/g, data.company.address2);
  result = result.replace(/\$company\.address\b/g, data.company.address);
  result = result.replace(
    /\$company\.city_state_postal\b/g,
    data.company.city_state_postal
  );
  result = result.replace(
    /\$company\.postal_city_state\b/g,
    data.company.postal_city_state
  );
  result = result.replace(/\$company\.country\b/g, data.company.country);
  result = result.replace(/\$company\.id_number\b/g, data.company.id_number);
  result = result.replace(/\$company\.phone\b/g, data.company.phone);
  result = result.replace(/\$company\.email\b/g, data.company.email);
  result = result.replace(/\$company\.website\b/g, data.company.website);
  result = result.replace(/\$company\.vat_number\b/g, data.company.vat_number);
  result = result.replace(/\$company\.custom1\b/g, data.company.custom_value1);
  result = result.replace(/\$company\.custom2\b/g, data.company.custom_value2);
  result = result.replace(/\$company\.custom3\b/g, data.company.custom_value3);
  result = result.replace(/\$company\.custom4\b/g, data.company.custom_value4);

  // Client variables
  // Order: longest tokens first (address1/2 before address, city_state_postal
  // before postal_city_state share no prefix but bare $client.number must come
  // after compound shipping_* tokens are out of the way).
  result = result.replace(/\$client\.name\b/g, data.client.name);
  result = result.replace(/\$client\.number\b/g, data.client.number);
  result = result.replace(/\$client\.address1\b/g, data.client.address1);
  result = result.replace(/\$client\.address2\b/g, data.client.address2);
  result = result.replace(/\$client\.address\b/g, data.client.address);
  result = result.replace(
    /\$client\.city_state_postal\b/g,
    data.client.city_state_postal
  );
  result = result.replace(
    /\$client\.postal_city_state\b/g,
    data.client.postal_city_state
  );
  result = result.replace(/\$client\.country\b/g, data.client.country);
  result = result.replace(/\$client\.id_number\b/g, data.client.id_number);
  result = result.replace(/\$client\.phone\b/g, data.client.phone);
  result = result.replace(/\$client\.email\b/g, data.client.email);
  result = result.replace(/\$client\.vat_number\b/g, data.client.vat_number);
  result = result.replace(/\$client\.location_name\b/g, data.client.location_name);
  result = result.replace(/\$client\.custom1\b/g, data.client.custom_value1);
  result = result.replace(/\$client\.custom2\b/g, data.client.custom_value2);
  result = result.replace(/\$client\.custom3\b/g, data.client.custom_value3);
  result = result.replace(/\$client\.custom4\b/g, data.client.custom_value4);
  result = result.replace(
    /\$client\.shipping_address1\b/g,
    data.client.shipping_address1
  );
  result = result.replace(
    /\$client\.shipping_address2\b/g,
    data.client.shipping_address2
  );
  result = result.replace(
    /\$client\.shipping_city\b/g,
    data.client.shipping_city
  );
  result = result.replace(
    /\$client\.shipping_state\b/g,
    data.client.shipping_state
  );
  result = result.replace(
    /\$client\.shipping_postal_code\b/g,
    data.client.shipping_postal_code
  );
  result = result.replace(
    /\$client\.shipping_country\b/g,
    data.client.shipping_country
  );

  // Contact variables ($contact.* maps to data.client.contact_*)
  result = result.replace(
    /\$contact\.full_name\b/g,
    data.client.contact_full_name
  );
  result = result.replace(/\$contact\.email\b/g, data.client.contact_email);
  result = result.replace(/\$contact\.phone\b/g, data.client.contact_phone);
  result = result.replace(
    /\$contact\.custom1\b/g,
    data.client.contact_custom_value1
  );
  result = result.replace(
    /\$contact\.custom2\b/g,
    data.client.contact_custom_value2
  );
  result = result.replace(
    /\$contact\.custom3\b/g,
    data.client.contact_custom_value3
  );
  result = result.replace(
    /\$contact\.custom4\b/g,
    data.client.contact_custom_value4
  );

  // Location variables ($location.* maps to data.client.location_*)
  result = result.replace(/\$location\.name\b/g, data.client.location_name);
  result = result.replace(
    /\$location\.custom1\b/g,
    data.client.location_custom_value1
  );
  result = result.replace(
    /\$location\.custom2\b/g,
    data.client.location_custom_value2
  );
  result = result.replace(
    /\$location\.custom3\b/g,
    data.client.location_custom_value3
  );
  result = result.replace(
    /\$location\.custom4\b/g,
    data.client.location_custom_value4
  );
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
  result = result.replace(/\$entity\.custom1\b/g, data.invoice.custom_value1);
  result = result.replace(/\$entity\.custom2\b/g, data.invoice.custom_value2);
  result = result.replace(/\$entity\.custom3\b/g, data.invoice.custom_value3);
  result = result.replace(/\$entity\.custom4\b/g, data.invoice.custom_value4);

  // Invoice variables ($invoice.* aliases - same as $entity.*)
  result = result.replace(/\$invoice\.number/g, data.invoice.number);
  result = result.replace(/\$invoice\.date/g, formatDate(data.invoice.date));
  result = result.replace(
    /\$invoice\.due_date/g,
    formatDate(data.invoice.due_date)
  );
  result = result.replace(/\$invoice\.po_number/g, data.invoice.po_number);
  result = result.replace(/\$invoice\.public_url/g, data.invoice.public_url);
  result = result.replace(/\$invoice\.public_notes/g, data.invoice.public_notes);
  result = result.replace(/\$invoice\.terms/g, data.invoice.terms);
  result = result.replace(/\$invoice\.custom1\b/g, data.invoice.custom_value1);
  result = result.replace(/\$invoice\.custom2\b/g, data.invoice.custom_value2);
  result = result.replace(/\$invoice\.custom3\b/g, data.invoice.custom_value3);
  result = result.replace(/\$invoice\.custom4\b/g, data.invoice.custom_value4);
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
    /\$custom_surcharge1\b/g,
    formatCurrency(data.invoice.custom_surcharge1)
  );
  result = result.replace(
    /\$custom_surcharge2\b/g,
    formatCurrency(data.invoice.custom_surcharge2)
  );
  result = result.replace(
    /\$custom_surcharge3\b/g,
    formatCurrency(data.invoice.custom_surcharge3)
  );
  result = result.replace(
    /\$custom_surcharge4\b/g,
    formatCurrency(data.invoice.custom_surcharge4)
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

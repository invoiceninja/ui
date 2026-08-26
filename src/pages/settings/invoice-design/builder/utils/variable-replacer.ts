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
    datetime: string;
    exchange_rate: string;
    days_overdue: string;
    term_days: string;
    tax_info: string;
    payment_schedule: string;
    payment_schedule_interval: string;
    payment_schedule_count: string;
    invoice_period: string;
    actual_delivery_date: string;
    view_url: string;
    payment_link: string;
    portal_url: string;
    project_name: string;
    quote_reference: string;
    partial: number;
    total_hours: string;
  };
  subtotal: number;
  client: {
    name: string;
    number: string;
    address: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postal_code: string;
    postal_city: string;
    city_state_postal: string;
    postal_city_state: string;
    country: string;
    country_2: string;
    classification: string;
    currency: string;
    public_notes: string;
    website: string;
    balance: number;
    credit_balance: number;
    payment_balance: number;
    id_number: string;
    phone: string;
    email: string;
    custom_value1: string;
    custom_value2: string;
    custom_value3: string;
    custom_value4: string;
    vat_number: string;
    contact_name: string;
    contact_first_name: string;
    contact_last_name: string;
    contact_full_name: string;
    contact_email: string;
    contact_phone: string;
    contact_signature: string;
    contact_signature_date: string;
    contact_custom_value1: string;
    contact_custom_value2: string;
    contact_custom_value3: string;
    contact_custom_value4: string;
    shipping_address: string;
    shipping_address1: string;
    shipping_address2: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    shipping_city_state_postal: string;
    shipping_postal_city_state: string;
    shipping_postal_city: string;
    shipping_location_name: string;
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
    city: string;
    state: string;
    postal_code: string;
    postal_city: string;
    city_state_postal: string;
    postal_city_state: string;
    country: string;
    country_2: string;
    classification: string;
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
  user: {
    name: string;
    first_name: string;
    last_name: string;
    signature: string;
  };
  assigned_user: {
    name: string;
    first_name: string;
    last_name: string;
    signature: string;
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
    datetime: '2025-12-01 09:00',
    exchange_rate: '1.00',
    days_overdue: '0',
    term_days: '14',
    tax_info: 'Prices include tax',
    payment_schedule: '50% deposit, 50% on completion',
    payment_schedule_interval: 'Monthly',
    payment_schedule_count: '2',
    invoice_period: 'Dec 2025',
    actual_delivery_date: '2025-12-08',
    view_url: 'https://example.com/invoice/view/INV-0001',
    payment_link: 'https://example.com/pay/INV-0001',
    portal_url: 'https://example.com/client/portal',
    project_name: 'Website Redesign',
    quote_reference: 'QT-0042',
    partial: 0,
    total_hours: '12.5',
  },
  subtotal: 1500.0,
  client: {
    name: 'Acme Corporation',
    number: 'CLIENT-0001',
    address: '123 Business Street',
    address1: '123 Business Street',
    address2: 'Suite 200',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    postal_city: '10001 New York',
    city_state_postal: 'New York, NY 10001',
    postal_city_state: '10001 New York, NY',
    country: 'United States',
    country_2: 'US',
    classification: 'Business',
    currency: 'USD',
    public_notes: 'Preferred billing contact: Jane',
    website: 'www.acme.com',
    balance: 1650.0,
    credit_balance: 0,
    payment_balance: 0,
    id_number: 'ID-456789',
    phone: '(555) 123-4567',
    email: 'billing@acme.com',
    custom_value1: 'Custom Client Field 1',
    custom_value2: 'Custom Client Field 2',
    custom_value3: 'Custom Client Field 3',
    custom_value4: 'Custom Client Field 4',
    vat_number: 'VAT789012',
    contact_name: 'Jane Smith',
    contact_first_name: 'Jane',
    contact_last_name: 'Smith',
    contact_full_name: 'Jane Smith',
    contact_email: 'jane@acme.com',
    contact_phone: '(555) 123-4567',
    contact_signature: 'Jane Smith',
    contact_signature_date: '2025-12-09',
    contact_custom_value1: 'Custom Contact Field 1',
    contact_custom_value2: 'Custom Contact Field 2',
    contact_custom_value3: 'Custom Contact Field 3',
    contact_custom_value4: 'Custom Contact Field 4',
    shipping_address: '400 Warehouse Way',
    shipping_address1: '400 Warehouse Way',
    shipping_address2: 'Loading Dock B',
    shipping_city: 'Jersey City',
    shipping_state: 'NJ',
    shipping_postal_code: '07305',
    shipping_country: 'United States',
    shipping_city_state_postal: 'Jersey City, NJ 07305',
    shipping_postal_city_state: '07305 Jersey City, NJ',
    shipping_postal_city: '07305 Jersey City',
    shipping_location_name: 'Warehouse',
    location_name: 'Main Location',
    location_custom_value1: 'Custom Location Field 1',
    location_custom_value2: 'Custom Location Field 2',
    location_custom_value3: 'Custom Location Field 3',
    location_custom_value4: 'Custom Location Field 4',
  },
  company: {
    name: 'Your Company LLC',
    logo: '/logo180.png',
    address: '456 Commerce Avenue',
    address1: '456 Commerce Avenue',
    address2: 'Floor 12',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    postal_city: '94102 San Francisco',
    city_state_postal: 'San Francisco, CA 94102',
    postal_city_state: '94102 San Francisco, CA',
    country: 'United States',
    country_2: 'US',
    classification: 'Business',
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
  user: {
    name: 'Alex Rivera',
    first_name: 'Alex',
    last_name: 'Rivera',
    signature: 'Alex Rivera',
  },
  assigned_user: {
    name: 'Sam Chen',
    first_name: 'Sam',
    last_name: 'Chen',
    signature: 'Sam Chen',
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
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildVariableValues(data: InvoiceData): Record<string, string> {
  const money = formatCurrency;
  const date = formatDate;

  return {
    '$company.name': data.company.name,
    '$company.logo': data.company.logo,
    '$company.address': data.company.address,
    '$company.address1': data.company.address1,
    '$company.address2': data.company.address2,
    '$company.city': data.company.city,
    '$company.state': data.company.state,
    '$company.postal_code': data.company.postal_code,
    '$company.city_state_postal': data.company.city_state_postal,
    '$company.postal_city_state': data.company.postal_city_state,
    '$company.postal_city': data.company.postal_city,
    '$company.country': data.company.country,
    '$company.country_2': data.company.country_2,
    '$company.phone': data.company.phone,
    '$company.email': data.company.email,
    '$company.website': data.company.website,
    '$company.vat_number': data.company.vat_number,
    '$company.id_number': data.company.id_number,
    '$company.classification': data.company.classification,
    '$company.custom1': data.company.custom_value1,
    '$company.custom2': data.company.custom_value2,
    '$company.custom3': data.company.custom_value3,
    '$company.custom4': data.company.custom_value4,

    '$client.name': data.client.name,
    '$client.number': data.client.number,
    '$client.address': data.client.address,
    '$client.address1': data.client.address1,
    '$client.address2': data.client.address2,
    '$client.city': data.client.city,
    '$client.state': data.client.state,
    '$client.postal_code': data.client.postal_code,
    '$client.city_state_postal': data.client.city_state_postal,
    '$client.postal_city_state': data.client.postal_city_state,
    '$client.postal_city': data.client.postal_city,
    '$client.country': data.client.country,
    '$client.country_2': data.client.country_2,
    '$client.phone': data.client.phone,
    '$client.email': data.client.email,
    '$client.website': data.client.website,
    '$client.vat_number': data.client.vat_number,
    '$client.id_number': data.client.id_number,
    '$client.classification': data.client.classification,
    '$client.currency': data.client.currency,
    '$client.public_notes': data.client.public_notes,
    '$client.balance': money(data.client.balance),
    '$client.credit_balance': money(data.client.credit_balance),
    '$client.payment_balance': money(data.client.payment_balance),
    '$client.location_name': data.client.location_name,
    '$client.custom1': data.client.custom_value1,
    '$client.custom2': data.client.custom_value2,
    '$client.custom3': data.client.custom_value3,
    '$client.custom4': data.client.custom_value4,
    '$client.shipping_address': data.client.shipping_address,
    '$client.shipping_address1': data.client.shipping_address1,
    '$client.shipping_address2': data.client.shipping_address2,
    '$client.shipping_city': data.client.shipping_city,
    '$client.shipping_state': data.client.shipping_state,
    '$client.shipping_postal_code': data.client.shipping_postal_code,
    '$client.shipping_country': data.client.shipping_country,
    '$client.shipping_city_state_postal':
      data.client.shipping_city_state_postal,
    '$client.shipping_postal_city_state':
      data.client.shipping_postal_city_state,
    '$client.shipping_postal_city': data.client.shipping_postal_city,
    '$client.shipping_location_name': data.client.shipping_location_name,

    '$contact.first_name': data.client.contact_first_name,
    '$contact.last_name': data.client.contact_last_name,
    '$contact.full_name': data.client.contact_full_name,
    '$contact.name': data.client.contact_full_name,
    '$contact.email': data.client.contact_email,
    '$contact.phone': data.client.contact_phone,
    '$contact.signature': data.client.contact_signature,
    '$contact.signature_date': date(data.client.contact_signature_date),
    '$contact.custom1': data.client.contact_custom_value1,
    '$contact.custom2': data.client.contact_custom_value2,
    '$contact.custom3': data.client.contact_custom_value3,
    '$contact.custom4': data.client.contact_custom_value4,
    '$client.contact_name': data.client.contact_name,

    '$location.name': data.client.location_name,
    '$location.custom1': data.client.location_custom_value1,
    '$location.custom2': data.client.location_custom_value2,
    '$location.custom3': data.client.location_custom_value3,
    '$location.custom4': data.client.location_custom_value4,

    $number: data.invoice.number,
    $date: date(data.invoice.date),
    $due_date: date(data.invoice.due_date),
    $partial_due_date: date(data.invoice.partial_due_date),
    '$entity.datetime': data.invoice.datetime,
    $po_number: data.invoice.po_number,
    '$entity.public_notes': data.invoice.public_notes,
    '$entity.terms': data.invoice.terms,
    $footer: data.invoice.footer,
    '$project.name': data.invoice.project_name,
    '$entity.custom1': data.invoice.custom_value1,
    '$entity.custom2': data.invoice.custom_value2,
    '$entity.custom3': data.invoice.custom_value3,
    '$entity.custom4': data.invoice.custom_value4,
    $view_url: data.invoice.view_url,
    $entity: data.invoice.label,
    $entity_label: data.invoice.label,
    '$entity.number': data.invoice.number,
    '$entity.date': date(data.invoice.date),
    '$entity.due_date': date(data.invoice.due_date),
    '$entity.po_number': data.invoice.po_number,
    '$entity.public_url': data.invoice.public_url,
    '$entity.footer': data.invoice.footer,

    '$invoice.number': data.invoice.number,
    '$invoice.date': date(data.invoice.date),
    '$invoice.due_date': date(data.invoice.due_date),
    '$invoice.po_number': data.invoice.po_number,
    '$invoice.public_url': data.invoice.public_url,
    '$invoice.public_notes': data.invoice.public_notes,
    '$invoice.footer': data.invoice.footer,
    '$invoice.terms': data.invoice.terms,
    '$invoice.custom1': data.invoice.custom_value1,
    '$invoice.custom2': data.invoice.custom_value2,
    '$invoice.custom3': data.invoice.custom_value3,
    '$invoice.custom4': data.invoice.custom_value4,
    '$invoice.subtotal': money(data.invoice.subtotal),
    '$invoice.discount': money(data.invoice.discount),
    '$invoice.tax': money(data.invoice.tax),
    '$invoice.total': money(data.invoice.total),
    '$invoice.paid_to_date': money(data.invoice.paid_to_date),
    '$invoice.balance': money(data.invoice.balance),
    '$invoice.created_at': date(data.invoice.created_at),
    '$invoice.updated_at': date(data.invoice.updated_at),
    '$invoice.partial_due_date': date(data.invoice.partial_due_date),
    '$invoice.datetime': data.invoice.datetime,

    $public_url: data.invoice.public_url,
    $public_notes: data.invoice.public_notes,
    $terms: data.invoice.terms,
    $subtotal: money(data.invoice.subtotal),
    $discount: money(data.invoice.discount),
    $taxes: money(data.invoice.total_taxes),
    $total: money(data.invoice.total),
    $amount: money(data.invoice.total),
    $paid_to_date: money(data.invoice.paid_to_date),
    $balance_due: money(data.invoice.balance),
    $balance: money(data.invoice.balance),
    $partial: money(data.invoice.partial),
    $custom_surcharge1: money(data.invoice.custom_surcharge1),
    $custom_surcharge2: money(data.invoice.custom_surcharge2),
    $custom_surcharge3: money(data.invoice.custom_surcharge3),
    $custom_surcharge4: money(data.invoice.custom_surcharge4),

    $date_client_now: date(data.invoice.date),
    $date_company_now: date(data.invoice.date),
    $payment_due: date(data.invoice.due_date),

    '$user.name': data.user.name,
    '$user.first_name': data.user.first_name,
    '$user.last_name': data.user.last_name,
    '$user.signature': data.user.signature,
    $created_by_user: data.user.name,
    $assigned_to_user: data.assigned_user.name,
    '$assigned_user.first_name': data.assigned_user.first_name,
    '$assigned_user.last_name': data.assigned_user.last_name,
    '$assigned_user.signature': data.assigned_user.signature,

    '$quote.reference': data.invoice.quote_reference,
    $exchange_rate: data.invoice.exchange_rate,
    $days_overdue: data.invoice.days_overdue,
    $term_days: data.invoice.term_days,
    $tax_info: data.invoice.tax_info,
    $payment_schedule_interval: data.invoice.payment_schedule_interval,
    $payment_schedule_count: data.invoice.payment_schedule_count,
    $payment_schedule: data.invoice.payment_schedule,
    $invoice_period: data.invoice.invoice_period,
    $actual_delivery_date: date(data.invoice.actual_delivery_date),
    $payment_link: data.invoice.payment_link,
    $portal_url: data.invoice.portal_url,
    '$task.total_hours': data.invoice.total_hours,

    $payment_qr_code: '[Payment QR Code]',
    $sepa_qr_code: '[SEPA/EPC QR Code]',
    $swiss_qr: '[Swiss QR Bill]',
    $spc_qr_code: '[SPC QR Code]',
    $verifactu_qr_code: '[Verifactu QR Code]',
  };
}

export function replaceVariables(template: string, data?: InvoiceData): string {
  if (typeof template !== 'string') {
    return '';
  }

  // When no data is supplied we're in "save mode" — leave tokens literal
  // so the backend (HtmlEngine::parseLabelsAndValues) can substitute them.
  if (!data) {
    return template;
  }

  const values = buildVariableValues(data);
  const keys = Object.keys(values).sort(
    (left, right) => right.length - left.length
  );

  let result = template;

  for (const key of keys) {
    result = result.replace(
      new RegExp(`${escapeRegExp(key)}\\b`, 'g'),
      values[key]
    );
  }

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
  variable: string | null | undefined,
  itemData: InvoiceData['line_items'][0] | null,
  invoiceData?: InvoiceData
): string {
  const normalizedVariable = typeof variable === 'string' ? variable : '';

  // Save mode — emit the variable literal so the backend substitutes it.
  if (!invoiceData) {
    return normalizedVariable;
  }

  // Handle item.field format (e.g., "item.product_key")
  if (normalizedVariable.startsWith('item.') && itemData) {
    const field = normalizedVariable.replace(
      'item.',
      ''
    ) as keyof typeof itemData;
    const value = itemData[field];

    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return String(value);
  }

  // Handle other variables using replaceVariables
  return replaceVariables(normalizedVariable, invoiceData);
}

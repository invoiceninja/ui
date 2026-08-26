/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Link2,
  MapPin,
  MoreHorizontal,
  Truck,
  User,
  Users,
} from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CustomFields } from '$app/components/CustomField';
import { useCustomField } from '$app/components/CustomField';
import type { VariableGroup } from './types';

export type DesignerVariableCategory =
  | 'company'
  | 'client'
  | 'shipping'
  | 'contact'
  | 'entity'
  | 'totals'
  | 'date'
  | 'people'
  | 'location'
  | 'cross_reference'
  | 'misc';

export interface DesignerVariableDef {
  key: string;
  labelKey: string;
  example: string;
  category: DesignerVariableCategory;
  customField?: CustomFields;
}

export const DESIGNER_GROUP_ORDER: DesignerVariableCategory[] = [
  'company',
  'client',
  'shipping',
  'contact',
  'entity',
  'totals',
  'date',
  'people',
  'location',
  'cross_reference',
  'misc',
];

const GROUP_LABEL_KEYS: Record<DesignerVariableCategory, string> = {
  company: 'company',
  client: 'client',
  shipping: 'shipping',
  contact: 'contact',
  entity: 'document',
  totals: 'totals',
  date: 'date',
  people: 'users',
  location: 'location',
  cross_reference: 'reference',
  misc: 'other',
};

export const DESIGNER_VARIABLE_DEFS: DesignerVariableDef[] = [
  // Company
  {
    key: '$company.name',
    labelKey: 'company_name',
    example: 'Your Company LLC',
    category: 'company',
  },
  {
    key: '$company.logo',
    labelKey: 'company_logo',
    example: '/logo180.png',
    category: 'company',
  },
  {
    key: '$company.address',
    labelKey: 'address',
    example: '456 Commerce Avenue',
    category: 'company',
  },
  {
    key: '$company.address1',
    labelKey: 'address1',
    example: '456 Commerce Avenue',
    category: 'company',
  },
  {
    key: '$company.address2',
    labelKey: 'address2',
    example: 'Floor 12',
    category: 'company',
  },
  {
    key: '$company.city',
    labelKey: 'city',
    example: 'San Francisco',
    category: 'company',
  },
  {
    key: '$company.state',
    labelKey: 'state',
    example: 'CA',
    category: 'company',
  },
  {
    key: '$company.postal_code',
    labelKey: 'postal_code',
    example: '94102',
    category: 'company',
  },
  {
    key: '$company.city_state_postal',
    labelKey: 'city_state_postal',
    example: 'San Francisco, CA 94102',
    category: 'company',
  },
  {
    key: '$company.postal_city_state',
    labelKey: 'postal_city_state',
    example: '94102 San Francisco, CA',
    category: 'company',
  },
  {
    key: '$company.postal_city',
    labelKey: 'postal_city',
    example: '94102 San Francisco',
    category: 'company',
  },
  {
    key: '$company.country',
    labelKey: 'country',
    example: 'United States',
    category: 'company',
  },
  {
    key: '$company.country_2',
    labelKey: 'country',
    example: 'US',
    category: 'company',
  },
  {
    key: '$company.phone',
    labelKey: 'phone',
    example: '(555) 987-6543',
    category: 'company',
  },
  {
    key: '$company.email',
    labelKey: 'email',
    example: 'hello@yourcompany.com',
    category: 'company',
  },
  {
    key: '$company.website',
    labelKey: 'website',
    example: 'www.yourcompany.com',
    category: 'company',
  },
  {
    key: '$company.vat_number',
    labelKey: 'vat_number',
    example: 'VAT123456',
    category: 'company',
  },
  {
    key: '$company.id_number',
    labelKey: 'id_number',
    example: 'CO-ID-987654',
    category: 'company',
  },
  {
    key: '$company.classification',
    labelKey: 'classification',
    example: 'Business',
    category: 'company',
  },
  {
    key: '$company.custom1',
    labelKey: 'custom_field',
    example: 'Custom Company Field 1',
    category: 'company',
    customField: 'company1',
  },
  {
    key: '$company.custom2',
    labelKey: 'custom_field',
    example: 'Custom Company Field 2',
    category: 'company',
    customField: 'company2',
  },
  {
    key: '$company.custom3',
    labelKey: 'custom_field',
    example: 'Custom Company Field 3',
    category: 'company',
    customField: 'company3',
  },
  {
    key: '$company.custom4',
    labelKey: 'custom_field',
    example: 'Custom Company Field 4',
    category: 'company',
    customField: 'company4',
  },

  // Client
  {
    key: '$client.name',
    labelKey: 'client_name',
    example: 'Acme Corporation',
    category: 'client',
  },
  {
    key: '$client.number',
    labelKey: 'client_number',
    example: 'CLIENT-0001',
    category: 'client',
  },
  {
    key: '$client.address',
    labelKey: 'billing_address',
    example: '123 Business Street, New York, NY 10001',
    category: 'client',
  },
  {
    key: '$client.address1',
    labelKey: 'address1',
    example: '123 Business Street',
    category: 'client',
  },
  {
    key: '$client.address2',
    labelKey: 'address2',
    example: 'Suite 200',
    category: 'client',
  },
  {
    key: '$client.city',
    labelKey: 'city',
    example: 'New York',
    category: 'client',
  },
  {
    key: '$client.state',
    labelKey: 'state',
    example: 'NY',
    category: 'client',
  },
  {
    key: '$client.postal_code',
    labelKey: 'postal_code',
    example: '10001',
    category: 'client',
  },
  {
    key: '$client.city_state_postal',
    labelKey: 'city_state_postal',
    example: 'New York, NY 10001',
    category: 'client',
  },
  {
    key: '$client.postal_city_state',
    labelKey: 'postal_city_state',
    example: '10001 New York, NY',
    category: 'client',
  },
  {
    key: '$client.postal_city',
    labelKey: 'postal_city',
    example: '10001 New York',
    category: 'client',
  },
  {
    key: '$client.country',
    labelKey: 'country',
    example: 'United States',
    category: 'client',
  },
  {
    key: '$client.country_2',
    labelKey: 'country',
    example: 'US',
    category: 'client',
  },
  {
    key: '$client.phone',
    labelKey: 'phone',
    example: '(555) 123-4567',
    category: 'client',
  },
  {
    key: '$client.email',
    labelKey: 'email',
    example: 'billing@acme.com',
    category: 'client',
  },
  {
    key: '$client.website',
    labelKey: 'website',
    example: 'www.acme.com',
    category: 'client',
  },
  {
    key: '$client.vat_number',
    labelKey: 'vat_number',
    example: 'VAT789012',
    category: 'client',
  },
  {
    key: '$client.id_number',
    labelKey: 'id_number',
    example: 'ID-456789',
    category: 'client',
  },
  {
    key: '$client.classification',
    labelKey: 'classification',
    example: 'Business',
    category: 'client',
  },
  {
    key: '$client.currency',
    labelKey: 'currency',
    example: 'USD',
    category: 'client',
  },
  {
    key: '$client.public_notes',
    labelKey: 'public_notes',
    example: 'Preferred billing contact: Jane',
    category: 'client',
  },
  {
    key: '$client.balance',
    labelKey: 'client_balance',
    example: '$1,650.00',
    category: 'client',
  },
  {
    key: '$client.credit_balance',
    labelKey: 'credit_balance',
    example: '$0.00',
    category: 'client',
  },
  {
    key: '$client.payment_balance',
    labelKey: 'payment_balance',
    example: '$0.00',
    category: 'client',
  },
  {
    key: '$client.location_name',
    labelKey: 'location_name',
    example: 'Main Location',
    category: 'client',
  },
  {
    key: '$client.custom1',
    labelKey: 'custom_field',
    example: 'Custom Client Field 1',
    category: 'client',
    customField: 'client1',
  },
  {
    key: '$client.custom2',
    labelKey: 'custom_field',
    example: 'Custom Client Field 2',
    category: 'client',
    customField: 'client2',
  },
  {
    key: '$client.custom3',
    labelKey: 'custom_field',
    example: 'Custom Client Field 3',
    category: 'client',
    customField: 'client3',
  },
  {
    key: '$client.custom4',
    labelKey: 'custom_field',
    example: 'Custom Client Field 4',
    category: 'client',
    customField: 'client4',
  },

  // Shipping
  {
    key: '$client.shipping_address',
    labelKey: 'shipping_address',
    example: '400 Warehouse Way, Fort Myers, FL 33901',
    category: 'shipping',
  },
  {
    key: '$client.shipping_address1',
    labelKey: 'address1',
    example: '400 Warehouse Way',
    category: 'shipping',
  },
  {
    key: '$client.shipping_address2',
    labelKey: 'address2',
    example: 'Loading Dock B',
    category: 'shipping',
  },
  {
    key: '$client.shipping_city',
    labelKey: 'city',
    example: 'Jersey City',
    category: 'shipping',
  },
  {
    key: '$client.shipping_state',
    labelKey: 'state',
    example: 'NJ',
    category: 'shipping',
  },
  {
    key: '$client.shipping_postal_code',
    labelKey: 'postal_code',
    example: '07305',
    category: 'shipping',
  },
  {
    key: '$client.shipping_country',
    labelKey: 'country',
    example: 'United States',
    category: 'shipping',
  },
  {
    key: '$client.shipping_city_state_postal',
    labelKey: 'city_state_postal',
    example: 'Jersey City, NJ 07305',
    category: 'shipping',
  },
  {
    key: '$client.shipping_postal_city_state',
    labelKey: 'postal_city_state',
    example: '07305 Jersey City, NJ',
    category: 'shipping',
  },
  {
    key: '$client.shipping_postal_city',
    labelKey: 'postal_city',
    example: '07305 Jersey City',
    category: 'shipping',
  },
  {
    key: '$client.shipping_location_name',
    labelKey: 'location_name',
    example: 'Warehouse',
    category: 'shipping',
  },

  // Contact
  {
    key: '$contact.first_name',
    labelKey: 'first_name',
    example: 'Jane',
    category: 'contact',
  },
  {
    key: '$contact.last_name',
    labelKey: 'last_name',
    example: 'Smith',
    category: 'contact',
  },
  {
    key: '$contact.full_name',
    labelKey: 'full_name',
    example: 'Jane Smith',
    category: 'contact',
  },
  {
    key: '$contact.email',
    labelKey: 'email',
    example: 'jane@acme.com',
    category: 'contact',
  },
  {
    key: '$contact.phone',
    labelKey: 'phone',
    example: '(555) 123-4567',
    category: 'contact',
  },
  {
    key: '$contact.signature',
    labelKey: 'signature',
    example: 'Jane Smith',
    category: 'contact',
  },
  {
    key: '$contact.signature_date',
    labelKey: 'date',
    example: 'Dec 9, 2025',
    category: 'contact',
  },
  {
    key: '$contact.custom1',
    labelKey: 'custom_field',
    example: 'Custom Contact Field 1',
    category: 'contact',
    customField: 'contact1',
  },
  {
    key: '$contact.custom2',
    labelKey: 'custom_field',
    example: 'Custom Contact Field 2',
    category: 'contact',
    customField: 'contact2',
  },
  {
    key: '$contact.custom3',
    labelKey: 'custom_field',
    example: 'Custom Contact Field 3',
    category: 'contact',
    customField: 'contact3',
  },
  {
    key: '$contact.custom4',
    labelKey: 'custom_field',
    example: 'Custom Contact Field 4',
    category: 'contact',
    customField: 'contact4',
  },

  // Entity (current document — generic / $entity.*, never $invoice.* / $quote.*)
  {
    key: '$number',
    labelKey: 'number',
    example: 'INV-0001',
    category: 'entity',
  },
  {
    key: '$date',
    labelKey: 'date',
    example: 'Dec 9, 2025',
    category: 'entity',
  },
  {
    key: '$due_date',
    labelKey: 'due_date',
    example: 'Dec 23, 2025',
    category: 'entity',
  },
  {
    key: '$partial_due_date',
    labelKey: 'partial_due_date',
    example: 'Dec 15, 2025',
    category: 'entity',
  },
  {
    key: '$entity.datetime',
    labelKey: 'created_at',
    example: 'Dec 1, 2025 9:00 AM',
    category: 'entity',
  },
  {
    key: '$po_number',
    labelKey: 'po_number',
    example: 'PO-2025-001',
    category: 'entity',
  },
  {
    key: '$entity.public_notes',
    labelKey: 'public_notes',
    example: 'Thank you for your business!',
    category: 'entity',
  },
  {
    key: '$entity.terms',
    labelKey: 'terms',
    example: 'Payment is due within 14 days.',
    category: 'entity',
  },
  {
    key: '$footer',
    labelKey: 'footer',
    example: 'Questions? hello@yourcompany.com',
    category: 'entity',
  },
  {
    key: '$project.name',
    labelKey: 'project',
    example: 'Website Redesign',
    category: 'entity',
  },
  {
    key: '$entity.custom1',
    labelKey: 'custom_field',
    example: 'Custom Invoice Field 1',
    category: 'entity',
    customField: 'invoice1',
  },
  {
    key: '$entity.custom2',
    labelKey: 'custom_field',
    example: 'Custom Invoice Field 2',
    category: 'entity',
    customField: 'invoice2',
  },
  {
    key: '$entity.custom3',
    labelKey: 'custom_field',
    example: 'Custom Invoice Field 3',
    category: 'entity',
    customField: 'invoice3',
  },
  {
    key: '$entity.custom4',
    labelKey: 'custom_field',
    example: 'Custom Invoice Field 4',
    category: 'entity',
    customField: 'invoice4',
  },
  {
    key: '$view_url',
    labelKey: 'link',
    example: 'https://example.com/invoice/view/INV-0001',
    category: 'entity',
  },

  // Totals
  {
    key: '$subtotal',
    labelKey: 'subtotal',
    example: '$1,500.00',
    category: 'totals',
  },
  {
    key: '$discount',
    labelKey: 'discount',
    example: '$0.00',
    category: 'totals',
  },
  { key: '$taxes', labelKey: 'taxes', example: '$150.00', category: 'totals' },
  {
    key: '$total',
    labelKey: 'total',
    example: '$1,650.00',
    category: 'totals',
  },
  {
    key: '$amount',
    labelKey: 'amount',
    example: '$1,650.00',
    category: 'totals',
  },
  {
    key: '$paid_to_date',
    labelKey: 'paid_to_date',
    example: '$0.00',
    category: 'totals',
  },
  {
    key: '$balance',
    labelKey: 'balance',
    example: '$1,650.00',
    category: 'totals',
  },
  {
    key: '$balance_due',
    labelKey: 'balance_due',
    example: '$1,650.00',
    category: 'totals',
  },
  {
    key: '$partial',
    labelKey: 'partial',
    example: '$0.00',
    category: 'totals',
  },
  {
    key: '$custom_surcharge1',
    labelKey: 'custom_surcharge1',
    example: '$25.00',
    category: 'totals',
    customField: 'surcharge1',
  },
  {
    key: '$custom_surcharge2',
    labelKey: 'custom_field',
    example: '$0.00',
    category: 'totals',
    customField: 'surcharge2',
  },
  {
    key: '$custom_surcharge3',
    labelKey: 'custom_field',
    example: '$0.00',
    category: 'totals',
    customField: 'surcharge3',
  },
  {
    key: '$custom_surcharge4',
    labelKey: 'custom_field',
    example: '$0.00',
    category: 'totals',
    customField: 'surcharge4',
  },

  // Dates (helpers, not the entity's own date fields)
  {
    key: '$date_client_now',
    labelKey: 'today',
    example: 'Dec 9, 2025',
    category: 'date',
  },
  {
    key: '$date_company_now',
    labelKey: 'today',
    example: 'Dec 9, 2025',
    category: 'date',
  },
  {
    key: '$payment_due',
    labelKey: 'due_date',
    example: 'Dec 23, 2025',
    category: 'date',
  },

  // People
  {
    key: '$user.name',
    labelKey: 'user',
    example: 'Alex Rivera',
    category: 'people',
  },
  {
    key: '$user.first_name',
    labelKey: 'first_name',
    example: 'Alex',
    category: 'people',
  },
  {
    key: '$user.last_name',
    labelKey: 'last_name',
    example: 'Rivera',
    category: 'people',
  },
  {
    key: '$user.signature',
    labelKey: 'signature',
    example: 'Alex Rivera',
    category: 'people',
  },
  {
    key: '$created_by_user',
    labelKey: 'created_by',
    example: 'Alex Rivera',
    category: 'people',
  },
  {
    key: '$assigned_to_user',
    labelKey: 'assigned_to',
    example: 'Sam Chen',
    category: 'people',
  },
  {
    key: '$assigned_user.first_name',
    labelKey: 'first_name',
    example: 'Sam',
    category: 'people',
  },
  {
    key: '$assigned_user.last_name',
    labelKey: 'last_name',
    example: 'Chen',
    category: 'people',
  },
  {
    key: '$assigned_user.signature',
    labelKey: 'signature',
    example: 'Sam Chen',
    category: 'people',
  },

  // Location
  {
    key: '$location.custom1',
    labelKey: 'custom_field',
    example: 'Custom Location Field 1',
    category: 'location',
    customField: 'location1',
  },
  {
    key: '$location.custom2',
    labelKey: 'custom_field',
    example: 'Custom Location Field 2',
    category: 'location',
    customField: 'location2',
  },
  {
    key: '$location.custom3',
    labelKey: 'custom_field',
    example: 'Custom Location Field 3',
    category: 'location',
    customField: 'location3',
  },
  {
    key: '$location.custom4',
    labelKey: 'custom_field',
    example: 'Custom Location Field 4',
    category: 'location',
    customField: 'location4',
  },

  // Cross-reference (invoice-on-quote / quote-on-invoice only)
  {
    key: '$quote.reference',
    labelKey: 'quote_number',
    example: 'QT-0042',
    category: 'cross_reference',
  },

  // Misc
  { key: '$entity', labelKey: 'type', example: 'Invoice', category: 'misc' },
  {
    key: '$exchange_rate',
    labelKey: 'exchange_rate',
    example: '1.00',
    category: 'misc',
  },
  { key: '$days_overdue', labelKey: 'overdue', example: '0', category: 'misc' },
  {
    key: '$term_days',
    labelKey: 'payment_terms',
    example: '14',
    category: 'misc',
  },
  {
    key: '$tax_info',
    labelKey: 'tax',
    example: 'Prices include tax',
    category: 'misc',
  },
  {
    key: '$payment_schedule',
    labelKey: 'payment_schedule',
    example: '50% deposit, 50% on completion',
    category: 'misc',
  },
  {
    key: '$payment_schedule_interval',
    labelKey: 'payment_schedule',
    example: 'Monthly',
    category: 'misc',
  },
  {
    key: '$payment_schedule_count',
    labelKey: 'payment_schedule',
    example: '2',
    category: 'misc',
  },
  {
    key: '$invoice_period',
    labelKey: 'invoice_period',
    example: 'Dec 2025',
    category: 'misc',
  },
  {
    key: '$actual_delivery_date',
    labelKey: 'actual_delivery_date',
    example: 'Dec 8, 2025',
    category: 'misc',
  },
  {
    key: '$payment_link',
    labelKey: 'payment_link',
    example: 'https://example.com/pay/INV-0001',
    category: 'misc',
  },
  {
    key: '$portal_url',
    labelKey: 'client_portal',
    example: 'https://example.com/client/portal',
    category: 'misc',
  },
  {
    key: '$task.total_hours',
    labelKey: 'total_hours',
    example: '12.5',
    category: 'misc',
  },
];

export function useDesignerVariableGroups(): VariableGroup[] {
  const [t] = useTranslation();
  const customField = useCustomField();

  return useMemo(() => {
    const icons: Record<DesignerVariableCategory, ReactNode> = {
      company: <Building2 className="w-4 h-4" />,
      client: <User className="w-4 h-4" />,
      shipping: <Truck className="w-4 h-4" />,
      contact: <User className="w-4 h-4" />,
      entity: <FileText className="w-4 h-4" />,
      totals: <DollarSign className="w-4 h-4" />,
      date: <Calendar className="w-4 h-4" />,
      people: <Users className="w-4 h-4" />,
      location: <MapPin className="w-4 h-4" />,
      cross_reference: <Link2 className="w-4 h-4" />,
      misc: <MoreHorizontal className="w-4 h-4" />,
    };

    return DESIGNER_GROUP_ORDER.map((category) => ({
      label: t(GROUP_LABEL_KEYS[category]),
      icon: icons[category],
      variables: DESIGNER_VARIABLE_DEFS.filter(
        (definition) => definition.category === category
      ).map((definition) => {
        const customLabel = definition.customField
          ? customField(definition.customField).label()
          : '';

        return {
          key: definition.key,
          label: customLabel || t(definition.labelKey),
          example: definition.example,
          category,
        };
      }),
    })).filter((group) => group.variables.length > 0);
  }, [customField, t]);
}

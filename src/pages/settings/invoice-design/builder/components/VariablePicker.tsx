/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useColorScheme } from '$app/common/colors';
import { VariableGroup } from '../types';

interface VariablePickerProps {
  onInsert: (variable: string) => void;
  onClose: () => void;
}

export function VariablePicker({ onInsert, onClose }: VariablePickerProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [searchTerm, setSearchTerm] = useState('');

  const variableGroups: VariableGroup[] = [
    {
      label: t('company'),
      icon: <Building2 className="w-4 h-4" />,
      variables: [
        {
          key: '$company.name',
          label: t('company_name'),
          example: 'Acme Corp',
          category: 'company',
        },
        {
          key: '$company.logo',
          label: t('company_logo'),
          example: 'logo.png',
          category: 'company',
        },
        {
          key: '$company.address1',
          label: t('address1'),
          example: '123 Main St',
          category: 'company',
        },
        {
          key: '$company.address2',
          label: t('address2'),
          example: 'Apt 4B',
          category: 'company',
        },
        {
          key: '$company.city_state_postal',
          label: t('city_state_postal'),
          example: 'New York, NY 10001',
          category: 'company',
        },
        {
          key: '$company.phone',
          label: t('phone'),
          example: '(555) 123-4567',
          category: 'company',
        },
        {
          key: '$company.email',
          label: t('email'),
          example: 'info@company.com',
          category: 'company',
        },
        {
          key: '$company.website',
          label: t('website'),
          example: 'www.company.com',
          category: 'company',
        },
        {
          key: '$company.vat_number',
          label: t('vat_number'),
          example: 'VAT123456',
          category: 'company',
        },
      ],
    },
    {
      label: t('client'),
      icon: <User className="w-4 h-4" />,
      variables: [
        {
          key: '$client.name',
          label: t('client_name'),
          example: 'John Doe',
          category: 'client',
        },
        {
          key: '$client.address',
          label: t('client_address'),
          example: '456 Oak Ave',
          category: 'client',
        },
        {
          key: '$client.city_state_postal',
          label: t('city_state_postal'),
          example: 'Los Angeles, CA 90001',
          category: 'client',
        },
        {
          key: '$client.phone',
          label: t('phone'),
          example: '(555) 987-6543',
          category: 'client',
        },
        {
          key: '$client.email',
          label: t('email'),
          example: 'john@client.com',
          category: 'client',
        },
        {
          key: '$client.vat_number',
          label: t('vat_number'),
          example: 'VAT789012',
          category: 'client',
        },
        {
          key: '$client.contact_name',
          label: t('contact_name'),
          example: 'Jane Smith',
          category: 'client',
        },
      ],
    },
    {
      label: t('invoice'),
      icon: <FileText className="w-4 h-4" />,
      variables: [
        {
          key: '$invoice.number',
          label: t('invoice_number'),
          example: 'INV-0001',
          category: 'invoice',
        },
        {
          key: '$invoice.date',
          label: t('invoice_date'),
          example: '12/05/2025',
          category: 'invoice',
        },
        {
          key: '$invoice.due_date',
          label: t('due_date'),
          example: '01/05/2026',
          category: 'invoice',
        },
        {
          key: '$invoice.po_number',
          label: t('po_number'),
          example: 'PO-12345',
          category: 'invoice',
        },
        {
          key: '$invoice.public_url',
          label: t('public_url'),
          example: 'https://...',
          category: 'invoice',
        },
        {
          key: '$invoice.public_notes',
          label: t('public_notes'),
          example: 'Thank you for your business',
          category: 'invoice',
        },
        {
          key: '$invoice.terms',
          label: t('terms'),
          example: 'Net 30',
          category: 'invoice',
        },
      ],
    },
    {
      label: t('amounts'),
      icon: <DollarSign className="w-4 h-4" />,
      variables: [
        {
          key: '$invoice.subtotal',
          label: t('subtotal'),
          example: '$1,000.00',
          category: 'amounts',
        },
        {
          key: '$invoice.discount',
          label: t('discount'),
          example: '$100.00',
          category: 'amounts',
        },
        {
          key: '$invoice.tax',
          label: t('tax'),
          example: '$90.00',
          category: 'amounts',
        },
        {
          key: '$invoice.total',
          label: t('total'),
          example: '$990.00',
          category: 'amounts',
        },
        {
          key: '$invoice.paid_to_date',
          label: t('paid_to_date'),
          example: '$500.00',
          category: 'amounts',
        },
        {
          key: '$invoice.balance',
          label: t('balance_due'),
          example: '$490.00',
          category: 'amounts',
        },
      ],
    },
    {
      label: t('dates'),
      icon: <Calendar className="w-4 h-4" />,
      variables: [
        {
          key: '$invoice.created_at',
          label: t('created_at'),
          example: '12/01/2025',
          category: 'dates',
        },
        {
          key: '$invoice.updated_at',
          label: t('updated_at'),
          example: '12/05/2025',
          category: 'dates',
        },
        {
          key: '$invoice.partial_due_date',
          label: t('partial_due_date'),
          example: '12/15/2025',
          category: 'dates',
        },
      ],
    },
  ];

  const filteredGroups = variableGroups
    .map((group) => ({
      ...group,
      variables: group.variables.filter(
        (v) =>
          v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.key.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.variables.length > 0);

  return (
    <Modal
      visible={true}
      onClose={onClose}
      title={t('insert_variable')}
      size="regular"
    >
      <div className="space-y-4">
        <InputField
          label={t('search_variables')}
          value={searchTerm}
          onValueChange={(val) => setSearchTerm(val)}
          placeholder={t('search_variables')}
        />

        <div
          className="max-h-[60vh] overflow-y-auto space-y-6 pr-3 pb-4"
          style={{ color: colors.$3 }}
        >
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('no_variables_found')}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.label}>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: colors.$17 }}
                >
                  {group.icon}
                  {group.label}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {group.variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => {
                        onInsert(variable.key);
                        onClose();
                      }}
                      className="text-left p-3 rounded-lg border transition-colors hover:shadow-sm"
                      style={{
                        backgroundColor: colors.$1,
                        borderColor: colors.$24,
                        color: colors.$3,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.$16;
                        e.currentTarget.style.backgroundColor = colors.$23;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.$24;
                        e.currentTarget.style.backgroundColor = colors.$1;
                      }}
                    >
                      <code
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: colors.$20,
                          color: colors.$16,
                        }}
                      >
                        {variable.key}
                      </code>
                      <div
                        className="text-sm font-medium mt-1.5 mb-0.5"
                        style={{ color: colors.$3 }}
                      >
                        {variable.label}
                      </div>
                      <div className="text-xs" style={{ color: colors.$17 }}>
                        {t('example')}: {variable.example}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { Card } from '@invoiceninja/cards';
import { InputField, InputLabel } from '@invoiceninja/forms';
import MDEditor from '@uiw/react-md-editor';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import Toggle from 'components/forms/Toggle';
import { TabGroup } from 'components/TabGroup';
import { Field } from 'pages/settings/custom-fields/components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetCurrentRecurringInvoiceProperty } from '../hooks/useSetCurrentRecurringInvoiceProperty';
import { InvoiceDocuments } from './InvoiceDocuments';

export function InvoiceFooter() {
  const [t] = useTranslation();
  const invoice = useCurrentRecurringInvoice();
  const handleChange = useSetCurrentRecurringInvoiceProperty();
  const company = useCurrentCompany();
  const handleCustomFieldChange = useHandleCustomFieldChange();

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup
        tabs={[
          t('public_notes'),
          t('private_notes'),
          t('terms'),
          t('footer'),
          t('documents'),
          t('settings'),
          t('custom_fields'),
        ]}
      >
        <Tab.Panel>
          <MDEditor
            value={invoice?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </Tab.Panel>

        <Tab.Panel>
          <MDEditor
            value={invoice?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </Tab.Panel>

        <Tab.Panel>
          <MDEditor
            value={invoice?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </Tab.Panel>

        <Tab.Panel>
          <MDEditor
            value={invoice?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </Tab.Panel>

        <Tab.Panel>
          <InvoiceDocuments />
        </Tab.Panel>

        <Tab.Panel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <InputLabel>{t('project')}</InputLabel>
                <DebouncedCombobox
                  endpoint="/api/v1/projects"
                  label="name"
                  onChange={(value) => handleChange('project_id', value.value)}
                  defaultValue={invoice?.project_id}
                />
              </div>

              <InputField
                label={t('exchange_rate')}
                value={invoice?.exchange_rate || '1.00'}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange('exchange_rate', parseFloat(event.target.value))
                }
              />

              <Toggle
                label={t('auto_bill_enabled')}
                checked={invoice?.auto_bill_enabled || false}
                onChange={(value) => handleChange('auto_bill_enabled', value)}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <InputLabel>{t('user')}</InputLabel>
                <DebouncedCombobox
                  endpoint="/api/v1/users"
                  label="first_name"
                  onChange={(value) =>
                    handleChange('assigned_user_id', value.value)
                  }
                  defaultValue={invoice?.assigned_user_id}
                />
              </div>

              <div className="space-y-2">
                <InputLabel>{t('vendor')}</InputLabel>
                <DebouncedCombobox
                  endpoint="/api/v1/vendors"
                  label="name"
                  onChange={(value) => handleChange('vendor_id', value.value)}
                  defaultValue={invoice?.vendor_id}
                />
              </div>

              <Toggle
                label={t('inclusive_taxes')}
                checked={invoice?.uses_inclusive_taxes || false}
                onChange={(value) =>
                  handleChange('uses_inclusive_taxes', value)
                }
              />
            </div>
          </div>
        </Tab.Panel>

        <Tab.Panel>
          {company &&
            ['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
              <Field
                key={field}
                initialValue={company.custom_fields[field]}
                field={field}
                placeholder={t('invoice_field')}
                onChange={(value) => handleCustomFieldChange(field, value)}
                noExternalPadding
              />
            ))}
        </Tab.Panel>
      </TabGroup>
    </Card>
  );
}

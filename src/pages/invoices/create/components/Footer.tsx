/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { Card } from '@invoiceninja/cards';
import { InputField, InputLabel } from '@invoiceninja/forms';
import MDEditor from '@uiw/react-md-editor';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { Invoice } from 'common/interfaces/invoice';
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices';
import { DebouncedSearch } from 'components/forms/DebouncedSearch';
import Toggle from 'components/forms/Toggle';
import { TabGroup } from 'components/TabGroup';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Documents } from './Documents';

export function Footer() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const invoice = useCurrentInvoice();

  const handleChange = (property: keyof Invoice, value: unknown) => {
    dispatch(setCurrentInvoiceProperty({ property, value }));
  };

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
          <Documents />
        </Tab.Panel>

        <Tab.Panel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <InputLabel>{t('project')}</InputLabel>
                <DebouncedSearch
                  endpoint="/api/v1/projects"
                  label="name"
                  onChange={(value) => handleChange('project_id', value.value)}
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
                <DebouncedSearch
                  endpoint="/api/v1/users"
                  label="first_name"
                  onChange={(value) =>
                    handleChange('assigned_user_id', value.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <InputLabel>{t('vendor')}</InputLabel>
                <DebouncedSearch
                  endpoint="/api/v1/vendors"
                  label="name"
                  onChange={(value) => handleChange('vendor_id', value.value)}
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
      </TabGroup>
    </Card>
  );
}

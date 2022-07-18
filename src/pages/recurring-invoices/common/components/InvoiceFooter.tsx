/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputField, InputLabel } from '@invoiceninja/forms';
import MDEditor from '@uiw/react-md-editor';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { TabGroup } from 'components/TabGroup';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetCurrentRecurringInvoiceProperty } from '../hooks/useSetCurrentRecurringInvoiceProperty';
import { InvoiceDocuments } from './InvoiceDocuments';

interface Props {
  page: 'create' | 'edit';
}

export function InvoiceFooter(props: Props) {
  const [t] = useTranslation();
  const invoice = useCurrentRecurringInvoice();
  const handleChange = useSetCurrentRecurringInvoiceProperty();

  const [tabs, setTabs] = useState([
    t('public_notes'),
    t('private_notes'),
    t('terms'),
    t('footer'),
    t('documents'),
    t('settings'),
  ]);

  useEffect(() => {
    if (props.page === 'create') {
      setTabs((current) => current.filter((tab) => tab !== t('documents')));
    }
  }, []);

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
        <div>
          <MDEditor
            value={invoice?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MDEditor
            value={invoice?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
          <MDEditor
            value={invoice?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MDEditor
            value={invoice?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        {props.page === 'edit' ? (
          <div>
            <InvoiceDocuments />
          </div>
        ) : (
          <></>
        )}

        <div>
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
            </div>
          </div>
        </div>
      </TabGroup>
    </Card>
  );
}

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
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import { TabGroup } from 'components/TabGroup';
import { useCurrentCredit } from 'pages/credits/common/hooks/useCurrentCredit';
import { useSetCurrentCreditProperty } from 'pages/credits/common/hooks/useSetCurrentCreditProperty';
import { Field } from 'pages/settings/custom-fields/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toggle from 'components/forms/Toggle';
import { CreditDocuments } from './CreditDocuments';

interface Props {
  page: 'create' | 'edit';
}

export function CreditFooter(props: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();
  const credit = useCurrentCredit();

  const handleChange = useSetCurrentCreditProperty();
  const handleCustomFieldChange = useHandleCustomFieldChange();

  const [tabs, setTabs] = useState([
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('documents'),
    t('settings'),
    t('custom_fields'),
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
          <MarkdownEditor
            value={credit?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={credit?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={credit?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={credit?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        {props.page === 'edit' ? (
          <div>
            <CreditDocuments />
          </div>
        ) : (
          <></>
        )}

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <InputLabel>{t('user')}</InputLabel>
                <DebouncedCombobox
                  endpoint="/api/v1/users"
                  label="first_name"
                  onChange={(value) =>
                    handleChange('assigned_user_id', value.value)
                  }
                  defaultValue={credit?.assigned_user_id}
                />
              </div>

              <div className="space-y-2">
                <InputLabel>{t('vendor')}</InputLabel>
                <DebouncedCombobox
                  endpoint="/api/v1/vendors"
                  label="name"
                  onChange={(value) => handleChange('vendor_id', value.value)}
                  defaultValue={credit?.vendor_id}
                />
              </div>

              <div className="space-y-2">
                <InputLabel>{t('design')}</InputLabel>

                <DebouncedCombobox
                  endpoint="/api/v1/designs"
                  label="name"
                  placeholder={t('search_designs')}
                  onChange={(payload) =>
                    handleChange('design_id', payload.value)
                  }
                  defaultValue={
                    credit?.design_id ?? company?.settings?.invoice_design_id
                  }
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <InputLabel>{t('project')}</InputLabel>
                <DebouncedCombobox
                  endpoint="/api/v1/projects"
                  label="name"
                  onChange={(value) => handleChange('project_id', value.value)}
                  defaultValue={credit?.project_id}
                />
              </div>

              <div className="space-y-2">
                <InputField
                  label={t('exchange_rate')}
                  value={credit?.exchange_rate || '1.00'}
                  onValueChange={(value) =>
                    handleChange('exchange_rate', parseFloat(value))
                  }
                />
              </div>

              <div className="pt-9">
                <Toggle
                  label={t('auto_bill_enabled')}
                  checked={credit?.auto_bill_enabled || false}
                  onChange={(value) => handleChange('auto_bill_enabled', value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          {company &&
            ['credit1', 'credit2', 'credit3', 'credit4'].map((field) => (
              <Field
                key={field}
                initialValue={company.custom_fields[field]}
                field={field}
                placeholder={t('custom_field')}
                onChange={(value: string) =>
                  handleCustomFieldChange(field, value)
                }
                noExternalPadding
              />
            ))}
        </div>
      </TabGroup>
    </Card>
  );
}

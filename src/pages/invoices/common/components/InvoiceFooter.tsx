/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import { Card } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { TabGroup } from 'components/TabGroup';
import { Field } from 'pages/settings/custom-fields/components';
import { Element } from '@invoiceninja/cards';
import { useHandleCustomSurchargeFieldChange } from 'common/hooks/useHandleCustomSurchargeFieldChange';
import { Divider } from 'components/cards/Divider';
import { useSetSurchageTaxValue } from '../hooks/useSetSurchargeTaxValue';
import { Invoice } from 'common/interfaces/invoice';
import { ChangeHandler } from 'pages/invoices/create/Create';
import { generatePath, useLocation, useParams } from 'react-router-dom';
import { Upload } from 'pages/settings/company/documents/components';
import { endpoint } from 'common/helpers';
import { useQueryClient } from 'react-query';
import { DocumentsTable } from 'components/DocumentsTable';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { DesignSelector } from 'common/generic/DesignSelector';
import { UserSelector } from 'components/users/UserSelector';
import { VendorSelector } from 'components/vendors/VendorSelector';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
}

export function InvoiceFooter(props: Props) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const company = useCurrentCompany();
  const location = useLocation();

  const { invoice, handleChange } = props;
  const { id } = useParams();

  const handleCustomFieldChange = useHandleCustomFieldChange();
  const handleCustomSurchargeFieldChange =
    useHandleCustomSurchargeFieldChange();

  const surchargeValue = (index: number) => {
    switch (index) {
      case 0:
        return company?.custom_surcharge_taxes1;
      case 1:
        return company?.custom_surcharge_taxes2;
      case 2:
        return company?.custom_surcharge_taxes3;
      case 3:
        return company?.custom_surcharge_taxes4;
    }
  };

  const setSurchargeTaxValue = useSetSurchageTaxValue();

  const tabs = [
    t('public_notes'),
    t('private_notes'),
    t('terms'),
    t('footer'),
    t('documents'),
    t('settings'),
    t('custom_fields'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(generatePath('/api/v1/invoices/:id', { id }));
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
        <div>
          <MarkdownEditor
            value={invoice?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        ) : (
          <div>
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/invoices/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
            />

            <DocumentsTable
              documents={invoice?.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        )}

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <ProjectSelector
                  inputLabel={t('project')}
                  value={invoice?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
                />
              </div>

              <InputField
                label={t('exchange_rate')}
                value={invoice?.exchange_rate || '1.00'}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value) || 1)
                }
              />

              <Toggle
                label={t('auto_bill_enabled')}
                checked={invoice?.auto_bill_enabled || false}
                onChange={(value) => handleChange('auto_bill_enabled', value)}
              />

              <div className="space-y-2">
                <DesignSelector
                  inputLabel={t('design')}
                  value={company?.settings?.invoice_design_id}
                  onChange={(design) => handleChange('design_id', design.id)}
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <UserSelector
                  inputLabel={t('user')}
                  value={invoice?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={invoice?.vendor_id}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
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
        </div>

        <div>
          {company &&
            ['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
              <Field
                key={field}
                initialValue={company.custom_fields[field]}
                field={field}
                placeholder={t('invoice_field')}
                onChange={(value: any) => handleCustomFieldChange(field, value)}
                noExternalPadding
              />
            ))}

          <Divider />

          {company &&
            ['surcharge1', 'surcharge2', 'surcharge3', 'surcharge4'].map(
              (field, index) => (
                <Element
                  noExternalPadding
                  key={index}
                  leftSide={
                    <InputField
                      id={field}
                      value={company.custom_fields[field]}
                      placeholder={t('surcharge_field')}
                      onValueChange={(value) =>
                        handleCustomSurchargeFieldChange(field, value)
                      }
                    />
                  }
                >
                  <Toggle
                    label={t('charge_taxes')}
                    checked={surchargeValue(index)}
                    onChange={() => setSurchargeTaxValue(index)}
                  />
                </Element>
              )
            )}
        </div>
      </TabGroup>
    </Card>
  );
}

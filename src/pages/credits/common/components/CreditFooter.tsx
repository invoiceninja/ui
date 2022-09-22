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
import { InputField } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from 'common/hooks/useHandleCustomFieldChange';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import { TabGroup } from 'components/TabGroup';
import { Field } from 'pages/settings/custom-fields/components';
import { useTranslation } from 'react-i18next';
import Toggle from 'components/forms/Toggle';
import { ChangeHandler } from '../hooks';
import { useAtom } from 'jotai';
import { creditAtom } from '../atoms';
import { useLocation, useParams } from 'react-router-dom';
import { Upload } from 'pages/settings/company/documents/components';
import { endpoint } from 'common/helpers';
import { useQueryClient } from 'react-query';
import { DocumentsTable } from 'components/DocumentsTable';
import { UserSelector } from 'components/users/UserSelector';
import { VendorSelector } from 'components/vendors/VendorSelector';
import { DesignSelector } from 'common/generic/DesignSelector';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { route } from 'common/helpers/route';

interface Props {
  handleChange: ChangeHandler;
}

export function CreditFooter(props: Props) {
  const { t } = useTranslation();
  const { id } = useParams();
  const { handleChange } = props;

  const company = useCurrentCompany();
  const location = useLocation();
  const queryClient = useQueryClient();
  const handleCustomFieldChange = useHandleCustomFieldChange();

  const [credit] = useAtom(creditAtom);

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/credits/:id', { id }));
  };

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('documents'),
    t('settings'),
    t('custom_fields'),
  ];

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

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        ) : (
          <div>
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/credits/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
            />

            <DocumentsTable
              documents={credit?.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        )}

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <UserSelector
                  inputLabel={t('user')}
                  value={credit?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={credit?.vendor_id}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                />
              </div>

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
                <ProjectSelector
                  inputLabel={t('project')}
                  value={credit?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
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

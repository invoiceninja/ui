/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { TabGroup } from '$app/components/TabGroup';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { recurringInvoiceAtom } from '../atoms';
import { ChangeHandler } from '../hooks';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useLocation, useParams } from 'react-router-dom';
import { Upload } from '$app/pages/settings/company/documents/components';
import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import Toggle from '$app/components/forms/Toggle';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';

interface Props {
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
}

export function InvoiceFooter(props: Props) {
  const [recurringInvoice] = useAtom(recurringInvoiceAtom);

  const { id } = useParams();
  const { t } = useTranslation();
  const { handleChange, errors } = props;

  const location = useLocation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const tabs = [
    t('public_notes'),
    t('private_notes'),
    t('terms'),
    t('footer'),
    t('documents'),
    t('settings'),
  ];

  const onSuccess = () => {
    $refetch(['recurring_invoices']);
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup
        tabs={tabs}
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 4) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={recurringInvoice?.documents.length}
              />
            );
          }
        }}
      >
        <div>
          <MarkdownEditor
            value={recurringInvoice?.public_notes}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={recurringInvoice?.private_notes}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={recurringInvoice?.terms}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={recurringInvoice?.footer}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        ) : (
          <div>
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/recurring_invoices/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
              disableUpload={
                !hasPermission('edit_recurring_invoice') &&
                !entityAssigned(recurringInvoice)
              }
            />

            <DocumentsTable
              documents={recurringInvoice?.documents || []}
              onDocumentDelete={onSuccess}
              disableEditableOptions={!entityAssigned(recurringInvoice, true)}
            />
          </div>
        )}

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <ProjectSelector
                  inputLabel={t('project')}
                  value={recurringInvoice?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
                  errorMessage={errors?.errors.project_id}
                />
              </div>

              <InputField
                label={t('exchange_rate')}
                type="number"
                value={recurringInvoice?.exchange_rate || 1.0}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value))
                }
                errorMessage={errors?.errors.exchange_rate}
              />

              <div className="space-y-2">
                <DesignSelector
                  inputLabel={t('design')}
                  value={recurringInvoice?.design_id}
                  onChange={(design) => handleChange('design_id', design.id)}
                  onClearButtonClick={() => handleChange('design_id', '')}
                  disableWithQueryParameter
                  errorMessage={errors?.errors.design_id}
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <UserSelector
                  inputLabel={t('user')}
                  value={recurringInvoice?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                  errorMessage={errors?.errors.assigned_user_id}
                  readonly={!hasPermission('edit_recurring_invoice')}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={recurringInvoice?.vendor_id}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                  onClearButtonClick={() => handleChange('vendor_id', '')}
                  errorMessage={errors?.errors.vendor_id}
                />
              </div>

              <div className="pt-9">
                <Toggle
                  label={t('inclusive_taxes')}
                  checked={recurringInvoice?.uses_inclusive_taxes || false}
                  onChange={(value) =>
                    handleChange('uses_inclusive_taxes', value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </TabGroup>
    </Card>
  );
}

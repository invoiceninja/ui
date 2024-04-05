/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Card, Element } from '$app/components/cards';
import { InputField, Link } from '$app/components/forms';
import { TabGroup } from '$app/components/TabGroup';
import { Invoice } from '$app/common/interfaces/invoice';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { useLocation, useParams } from 'react-router-dom';
import { Upload } from '$app/pages/settings/company/documents/components';
import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
}

export function InvoiceFooter(props: Props) {
  const { t } = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { isAdmin, isOwner } = useAdmin();

  const location = useLocation();

  const {
    invoice,
    handleChange,
    errors,
    isDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    setIsDefaultTerms,
  } = props;
  const { id } = useParams();

  const tabs = [
    t('public_notes'),
    t('private_notes'),
    t('terms'),
    t('footer'),
    t('documents'),
    t('settings'),
    ...(isAdmin || isOwner ? [t('custom_fields')] : []),
  ];

  const onSuccess = () => {
    $refetch(['invoices']);
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup
        tabs={tabs}
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 4) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={invoice?.documents.length}
              />
            );
          }
        }}
        withoutVerticalMargin
      >
        <div className="mb-4">
          <MarkdownEditor
            value={invoice?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div className="mb-4">
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

          <Element
            className="mt-4"
            leftSide={
              <Toggle
                checked={isDefaultTerms}
                onValueChange={(value) => setIsDefaultTerms(value)}
              />
            }
            noExternalPadding
            noVerticalPadding
          >
            <span className="font-medium">{t('save_as_default_terms')}</span>
          </Element>
        </div>

        <div>
          <MarkdownEditor
            value={invoice?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />

          <Element
            className="mt-4"
            leftSide={
              <Toggle
                checked={isDefaultFooter}
                onValueChange={(value) => setIsDefaultFooter(value)}
              />
            }
            noExternalPadding
            noVerticalPadding
          >
            <span className="font-medium">{t('save_as_default_footer')}</span>
          </Element>
        </div>

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm mt-4">{t('save_to_upload_documents')}.</div>
        ) : (
          <div className="my-4">
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/invoices/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
              disableUpload={
                !hasPermission('edit_invoice') && !entityAssigned(invoice)
              }
            />

            <DocumentsTable
              documents={invoice?.documents || []}
              onDocumentDelete={onSuccess}
              disableEditableOptions={!entityAssigned(invoice, true)}
            />
          </div>
        )}

        <div className="my-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <ProjectSelector
                  inputLabel={t('project')}
                  value={invoice?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
                  errorMessage={errors?.errors.project_id}
                  onClearButtonClick={() => handleChange('project_id', '')}
                />
              </div>

              <InputField
                label={t('exchange_rate')}
                type="number"
                value={invoice?.exchange_rate || 1.0}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value) || 1.0)
                }
                errorMessage={errors?.errors.exchange_rate}
              />

              <Toggle
                label={t('auto_bill_enabled')}
                checked={invoice?.auto_bill_enabled || false}
                onChange={(value) => handleChange('auto_bill_enabled', value)}
              />

              <div className="space-y-2">
                <DesignSelector
                  inputLabel={t('design')}
                  value={invoice?.design_id}
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
                  value={invoice?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                  errorMessage={errors?.errors.assigned_user_id}
                  readonly={!hasPermission('edit_invoice')}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={invoice?.vendor_id}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                  onClearButtonClick={() => handleChange('vendor_id', '')}
                  errorMessage={errors?.errors.vendor_id}
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

        <div className="my-4">
          <span className="text-sm">{t('custom_fields')} &nbsp;</span>
          <Link to="/settings/custom_fields/invoices" className="capitalize">
            {t('click_here')}
          </Link>
        </div>
      </TabGroup>
    </Card>
  );
}

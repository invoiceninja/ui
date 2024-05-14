/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { endpoint } from '$app/common/helpers';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TabGroup } from '$app/components/TabGroup';
import { UserSelector } from '$app/components/users/UserSelector';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { PurchaseOrderCardProps } from './Details';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Dispatch, SetStateAction } from 'react';
import Toggle from '$app/components/forms/Toggle';

interface Props extends PurchaseOrderCardProps {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
}
export function Footer(props: Props) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const location = useLocation();

  const {
    purchaseOrder,
    handleChange,
    errors,
    isDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    setIsDefaultTerms,
  } = props;

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('settings'),
    t('documents'),
  ];

  const onSuccess = () => {
    $refetch(['purchase_orders']);
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup
        tabs={tabs}
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 5) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={purchaseOrder?.documents.length}
              />
            );
          }
        }}
        withoutVerticalMargin
      >
        <div>
          <MarkdownEditor
            value={purchaseOrder.terms || ''}
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
            value={purchaseOrder.footer || ''}
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

        <div className="mb-4">
          <MarkdownEditor
            value={purchaseOrder.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div className="mb-4">
          <MarkdownEditor
            value={purchaseOrder.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div className="my-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <UserSelector
                inputLabel={t('User')}
                value={purchaseOrder.assigned_user_id}
                onChange={(user) => handleChange('assigned_user_id', user.id)}
                errorMessage={errors?.errors.assigned_user_id}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <ProjectSelector
                inputLabel={t('project')}
                value={purchaseOrder.project_id}
                onChange={(project) => handleChange('project_id', project.id)}
                errorMessage={errors?.errors.project_id}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <ClientSelector
                inputLabel={t('client')}
                value={purchaseOrder.client_id}
                onChange={(client) => handleChange('client_id', client.id)}
                errorMessage={errors?.errors.client_id}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <InputField
                label={t('exchange_rate')}
                type="number"
                value={purchaseOrder.exchange_rate || 1.0}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value) || 1.0)
                }
                errorMessage={errors?.errors.exchange_rate}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <DesignSelector
                inputLabel={t('design')}
                value={purchaseOrder?.design_id}
                onChange={(design) => handleChange('design_id', design.id)}
                onClearButtonClick={() => handleChange('design_id', '')}
                disableWithQueryParameter
                errorMessage={errors?.errors.design_id}
              />
            </div>
          </div>
        </div>

        {location.pathname.endsWith('/create') ? (
          <div className="text-sm mt-4">{t('save_to_upload_documents')}.</div>
        ) : (
          <div className="my-4">
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/purchase_orders/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
              disableUpload={
                !hasPermission('edit_purchase_order') &&
                !entityAssigned(purchaseOrder)
              }
            />

            <DocumentsTable
              documents={purchaseOrder.documents || []}
              onDocumentDelete={onSuccess}
              disableEditableOptions={!entityAssigned(purchaseOrder, true)}
            />
          </div>
        )}
      </TabGroup>
    </Card>
  );
}

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
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TabGroup } from '$app/components/TabGroup';
import { UserSelector } from '$app/components/users/UserSelector';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import { PurchaseOrderCardProps } from './Details';

export function Footer(props: PurchaseOrderCardProps) {
  const [t] = useTranslation();

  const { id } = useParams();

  const location = useLocation();

  const queryClient = useQueryClient();

  const { purchaseOrder, handleChange, errors } = props;

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('settings'),
    t('documents'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(route('/api/v1/purchase_orders/:id', { id }));
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
        <div>
          <MarkdownEditor
            value={purchaseOrder.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
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
          <div className="text-sm">{t('save_to_upload_documents')}.</div>
        ) : (
          <div>
            <Upload
              widgetOnly
              endpoint={endpoint('/api/v1/purchase_orders/:id/upload', {
                id,
              })}
              onSuccess={onSuccess}
            />

            <DocumentsTable
              documents={purchaseOrder.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        )}
      </TabGroup>
    </Card>
  );
}

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
import { DesignSelector } from 'common/generic/DesignSelector';
import { endpoint } from 'common/helpers';
import { route } from 'common/helpers/route';
import { ClientSelector } from 'components/clients/ClientSelector';
import { DocumentsTable } from 'components/DocumentsTable';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import { ProjectSelector } from 'components/projects/ProjectSelector';
import { TabGroup } from 'components/TabGroup';
import { UserSelector } from 'components/users/UserSelector';
import { Upload } from 'pages/settings/company/documents/components';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useLocation, useParams } from 'react-router-dom';
import { PurchaseOrderCardProps } from './Details';

export function Footer(props: PurchaseOrderCardProps) {
  const { t } = useTranslation();
  const { id } = useParams();
  const { purchaseOrder, handleChange } = props;

  const queryClient = useQueryClient();
  const location = useLocation();

  const tabs = [
    t('terms'),
    t('footer'),
    t('public_notes'),
    t('private_notes'),
    t('settings'),
    t('documents'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(
      route('/api/v1/purchase_orders/:id', { id })
    );
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
        <div>
          <MarkdownEditor
            value={purchaseOrder?.terms || ''}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder?.footer || ''}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={purchaseOrder?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <UserSelector
                inputLabel={t('User')}
                value={purchaseOrder?.assigned_user_id}
                onChange={(user) => handleChange('assigned_user_id', user.id)}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <ProjectSelector
                inputLabel={t('project')}
                value={purchaseOrder?.project_id}
                onChange={(project) => handleChange('project_id', project.id)}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <ClientSelector
                inputLabel={t('client')}
                value={purchaseOrder?.client_id}
                onChange={(client) => handleChange('client_id', client.id)}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <InputField
                label={t('exchange_rate')}
                value={purchaseOrder?.exchange_rate || 1.0}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value) || 1.0)
                }
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <DesignSelector
                inputLabel={t('design')}
                value={purchaseOrder?.design_id}
                onChange={(design) => handleChange('design_id', design.id)}
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
              documents={purchaseOrder?.documents || []}
              onDocumentDelete={onSuccess}
            />
          </div>
        )}
      </TabGroup>
    </Card>
  );
}

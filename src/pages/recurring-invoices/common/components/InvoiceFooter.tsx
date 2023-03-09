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
import { useQueryClient } from 'react-query';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { route } from '$app/common/helpers/route';

interface Props {
  handleChange: ChangeHandler;
}

export function InvoiceFooter(props: Props) {
  const [recurringInvoice] = useAtom(recurringInvoiceAtom);

  const { id } = useParams();
  const { t } = useTranslation();
  const { handleChange } = props;

  const location = useLocation();
  const queryClient = useQueryClient();

  const tabs = [
    t('public_notes'),
    t('private_notes'),
    t('terms'),
    t('footer'),
    t('documents'),
    t('settings'),
  ];

  const onSuccess = () => {
    queryClient.invalidateQueries(
      route('/api/v1/recurring_invoices/:id', { id })
    );
  };

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
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
            />

            <DocumentsTable
              documents={recurringInvoice?.documents || []}
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
                  value={recurringInvoice?.project_id}
                  onChange={(project) => handleChange('project_id', project.id)}
                />
              </div>

              <InputField
                label={t('exchange_rate')}
                value={recurringInvoice?.exchange_rate || '1.00'}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value))
                }
              />
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <UserSelector
                  inputLabel={t('user')}
                  value={recurringInvoice?.assigned_user_id}
                  onChange={(user) => handleChange('assigned_user_id', user.id)}
                />
              </div>

              <div className="space-y-2">
                <VendorSelector
                  inputLabel={t('vendor')}
                  value={recurringInvoice?.vendor_id}
                  onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                />
              </div>
            </div>
          </div>
        </div>
      </TabGroup>
    </Card>
  );
}

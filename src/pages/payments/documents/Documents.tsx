/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { $refetch } from '$app/common/hooks/useRefetch';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Card } from '$app/components/cards';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function Documents() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const { data: payment } = usePaymentQuery({ id });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const invalidateQuery = () => {
    $refetch(['payments']);
  };

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div
        className={classNames('flex w-full px-4 sm:px-6 py-2', {
          'flex-col items-center': id,
        })}
      >
        <div className="w-full">
          <Upload
            endpoint={endpoint('/api/v1/payments/:id/upload', { id })}
            onSuccess={invalidateQuery}
            disableUpload={
              !hasPermission('edit_payment') && !entityAssigned(payment)
            }
            widgetOnly
          />
        </div>

        <div className="w-full">
          <DocumentsTable
            documents={payment?.documents ?? []}
            onDocumentDelete={invalidateQuery}
            disableEditableOptions={
              !entityAssigned(payment, true) && !hasPermission('edit_payment')
            }
          />
        </div>
      </div>
    </Card>
  );
}

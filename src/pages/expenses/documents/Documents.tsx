/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useOutletContext } from 'react-router-dom';
import { Context } from '../edit/Edit';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';

export default function Documents() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();
  const { expense, isPreviewMode } = context;

  const colors = useColorScheme();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const invalidateCache = () => {
    $refetch(['expenses']);
  };

  return (
    <Card
      title={t('documents')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="flex flex-col items-center w-full px-6 py-2">
        <div
          className={classNames('w-full', {
            'lg:w-2/3': !isPreviewMode,
          })}
        >
          <Upload
            widgetOnly
            endpoint={endpoint('/api/v1/expenses/:id/upload', {
              id: expense.id,
            })}
            onSuccess={invalidateCache}
            disableUpload={
              !hasPermission('edit_expense') && !entityAssigned(expense)
            }
          />
        </div>

        <div
          className={classNames('w-full', {
            'lg:w-2/3': !isPreviewMode,
          })}
        >
          <DocumentsTable
            documents={expense?.documents || []}
            onDocumentDelete={invalidateCache}
            disableEditableOptions={
              !entityAssigned(expense, true) && !hasPermission('edit_expense')
            }
          />
        </div>
      </div>
    </Card>
  );
}

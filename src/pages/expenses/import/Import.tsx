/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { UploadImport } from '$app/components/import/UploadImport';
import { XMLImport } from '$app/components/import/XMLImport';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';

export default function Import() {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('import');

  const pages: Page[] = [
    { name: t('expenses'), href: '/expenses' },
    { name: t('import'), href: '/expenses/import' },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12">
        <div className="col-span-12 xl:col-span-10 space-y-4">
          <UploadImport entity="expense" onSuccess={false} type="csv" />

          <Card>
            <XMLImport entity="expense" type="xml" />
          </Card>
        </div>
      </div>
    </Default>
  );
}

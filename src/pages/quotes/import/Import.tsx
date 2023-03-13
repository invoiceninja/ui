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
import { UploadImport } from '$app/components/import/UploadImport';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Import() {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('import');

  const pages: Page[] = [
    { name: t('quotes'), href: '/quote' },
    { name: t('import'), href: '/quotes/import' },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages} onBackClick="/quotes">
      <div className="grid grid-cols-12">
        <div className="col-span-12 xl:col-span-10">
          <UploadImport entity="quote" onSuccess={false} type="csv" />
        </div>
      </div>
    </Default>
  );
}

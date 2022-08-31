/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { UploadImport } from 'components/import/UploadImport';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Import() {
  const { t } = useTranslation();
  const { documentTitle } = useTitle('import');

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    { name: t('import'), href: '/clients/import' },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages} onBackClick="/clients">
      <UploadImport entity="client" onSuccess={false} type="csv" />
    </Default>
  );
}

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
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Edit() {
  const { documentTitle } = useTitle('edit_vendor');

  const [t] = useTranslation();

  const { id } = useParams();

  const pages: BreadcrumRecord[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: t('edit_vendor'), href: generatePath('/vendors/:id/edit', { id }) },
  ];

  return <Default title={documentTitle} breadcrumbs={pages}></Default>;
}

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
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { CreateVendorForm } from '../components/CreateVendorForm';

export function Create() {
  const { documentTitle } = useTitle('create_vendor');

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    {
      name: t('create_vendor'),
      href: '/vendors/:id/create',
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages} onBackClick="/vendors">
      <CreateVendorForm />
    </Default>
  );
}

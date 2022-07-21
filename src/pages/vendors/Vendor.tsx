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
import { useVendorQuery } from 'common/queries/vendor';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';

export function Vendor() {
  const { documentTitle, setDocumentTitle } = useTitle('view_vendor');
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });

  const [t] = useTranslation();

  useEffect(() => {
    if (vendor && vendor.name.length >= 1) {
      setDocumentTitle(vendor.name);
    }
  }, [vendor]);

  const pages: BreadcrumRecord[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: documentTitle, href: generatePath('/vendors/:id', { id }) },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <Outlet />
    </Default>
  );
}

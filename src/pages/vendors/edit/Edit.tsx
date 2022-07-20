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
import { Vendor } from 'common/interfaces/vendor';
import { useVendorQuery } from 'common/queries/vendor';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { Form } from './components/Form';

export function Edit() {
  const { documentTitle } = useTitle('edit_vendor');

  const [t] = useTranslation();

  const { id } = useParams();
  const { data } = useVendorQuery({ id });

  const [vendor, setVendor] = useState<Vendor>();

  const pages: BreadcrumRecord[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: t('edit_vendor'), href: generatePath('/vendors/:id/edit', { id }) },
  ];

  useEffect(() => {
    if (data) {
      setVendor({ ...data });
    }
  }, [data]);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {vendor && <Form vendor={vendor} setVendor={setVendor} />}
    </Default>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useCountries } from 'common/hooks/useCountries';
import { useTitle } from 'common/hooks/useTitle';
import { useVendorQuery } from 'common/queries/vendor';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { InfoCard } from 'components/InfoCard';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';

export function Vendor() {
  const { documentTitle, setDocumentTitle } = useTitle('view_vendor');
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });

  const countries = useCountries();

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
      <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
        <InfoCard title={t('details')} className="col-span-12 lg:col-span-3">
          <p>
            {t('id_number')}: {vendor?.id_number}
          </p>

          <p>
            {t('vat_number')}: {vendor?.vat_number}
          </p>

          {vendor?.website && (
            <Link to={vendor.website} external>
              {vendor.website}
            </Link>
          )}
        </InfoCard>

        <InfoCard title={t('address')} className="col-span-12 lg:col-span-3">
          <p>{vendor?.address1}</p>
          <p>{vendor?.address2}</p>
          <p>
            {vendor?.city}, {vendor?.state} {vendor?.postal_code}
          </p>
          <p>
            {
              countries.find((country) => country.id === vendor?.country_id)
                ?.name
            }
          </p>
        </InfoCard>
      </div>

      <Outlet />
    </Default>
  );
}

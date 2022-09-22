/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { useCountries } from 'common/hooks/useCountries';
import { useTitle } from 'common/hooks/useTitle';
import { useVendorQuery } from 'common/queries/vendor';
import { Page } from 'components/Breadcrumbs';
import { InfoCard } from 'components/InfoCard';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { Actions } from './components/Actions';

export function Vendor() {
  const { documentTitle, setDocumentTitle } = useTitle('view_vendor');
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });

  const countries = useCountries();
  const accentColor = useAccentColor();

  const [t] = useTranslation();

  useEffect(() => {
    if (vendor && vendor.name.length >= 1) {
      setDocumentTitle(vendor.name);
    }
  }, [vendor]);

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: documentTitle, href: route('/vendors/:id', { id }) },
  ];

  const tabs: Tab[] = [
    {
      name: t('purchase_orders'),
      href: route('/vendors/:id/purchase_orders', { id }),
    },
    {
      name: t('expenses'),
      href: route('/vendors/:id/expenses', { id }),
    },
    {
      name: t('recurring_expenses'),
      href: route('/vendors/:id/recurring_expenses', { id }),
    },
    {
      name: t('documents'),
      href: route('/vendors/:id/documents', { id }),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <div className="inline-flex items-center space-x-2">
          <Button to={route('/vendors/:id/edit', { id })}>
            {t('edit_vendor')}
          </Button>

          {vendor && <Actions vendor={vendor} />}
        </div>
      }
    >
      <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
        <InfoCard title={t('details')} className="col-span-12 lg:col-span-4">
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

        <InfoCard title={t('address')} className="col-span-12 lg:col-span-4">
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

        <InfoCard
          title={t('contacts')}
          className="col-span-12 lg:col-span-4"
          value={
            <div className="space-y-2">
              {vendor?.contacts.map((contact, index: number) => (
                <div key={index}>
                  <p className="font-semibold" style={{ color: accentColor }}>
                    {contact.first_name} {contact.last_name}
                  </p>

                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              ))}
            </div>
          }
        />
      </div>

      <Tabs tabs={tabs} className="my-6" />

      <Outlet />
    </Default>
  );
}

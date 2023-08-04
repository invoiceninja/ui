/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCountries } from '$app/common/hooks/useCountries';
import { useTitle } from '$app/common/hooks/useTitle';
import { useVendorQuery } from '$app/common/queries/vendor';
import { Page } from '$app/components/Breadcrumbs';
import { InfoCard } from '$app/components/InfoCard';
import { Default } from '$app/components/layouts/Default';
import { Tabs } from '$app/components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from './common/hooks/useActions';
import { Inline } from '$app/components/Inline';
import { useTabs } from './show/hooks/useTabs';
import { EntityStatus } from '$app/components/EntityStatus';

export default function Vendor() {
  const { documentTitle, setDocumentTitle } = useTitle('view_vendor');
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });

  const countries = useCountries();
  const accentColor = useAccentColor();

  const actions = useActions();

  const [t] = useTranslation();

  useEffect(() => {
    if (vendor && vendor.name.length >= 1) {
      setDocumentTitle(vendor.name);
    }
  }, [vendor]);

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: documentTitle || '', href: route('/vendors/:id', { id }) },
  ];

  const tabs = useTabs();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <Inline>
          <Button to={route('/vendors/:id/edit', { id })}>
            {t('edit_vendor')}
          </Button>

          {vendor && (
            <ResourceActions
              label={t('more_actions')}
              resource={vendor}
              actions={actions}
            />
          )}
        </Inline>
      }
    >
      <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
        <InfoCard title={t('details')} className="col-span-12 lg:col-span-4">
          {vendor && (
            <div className="flex space-x-20 my-3">
              <span className="text-sm text-gray-900">{t('status')}</span>
              <EntityStatus entity={vendor} />
            </div>
          )}

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

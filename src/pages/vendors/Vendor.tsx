/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
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
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from './common/hooks/useActions';
import { useTabs } from './show/hooks/useTabs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date } from '$app/common/helpers';
import { EntityStatus } from '$app/components/EntityStatus';
import { useColorScheme } from '$app/common/colors';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';
import { Tooltip } from '$app/components/Tooltip';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';

export default function Vendor() {
  const { documentTitle, setDocumentTitle } = useTitle('view_vendor');
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });

  const countries = useCountries();
  const accentColor = useAccentColor();

  const actions = useActions();

  const [t] = useTranslation();
  const navigate = useNavigate();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  useEffect(() => {
    if (vendor && vendor.name.length >= 1) {
      setDocumentTitle(vendor.name);
    }
  }, [vendor]);

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: documentTitle || '', href: route('/vendors/:id', { id }) },
  ];

  const tabs = useTabs({ vendor });
  const { dateFormat } = useCurrentCompanyDateFormats();

  const lastLogin = (last_login: number | undefined) => {
    return last_login ? date(last_login, dateFormat) : t('never');
  };
  const colors = useColorScheme();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_vendor') || entityAssigned(vendor)) &&
        vendor && {
          navigationTopRight: (
            <ResourceActions
              saveButtonLabel={t('edit_vendor')}
              onSaveClick={() => navigate(route('/vendors/:id/edit', { id }))}
              resource={vendor}
              actions={actions}
            />
          ),
        })}
      afterBreadcrumbs={<PreviousNextNavigation entity="vendor" />}
    >
      <div className="grid grid-cols-12 gap-4">
        <InfoCard
          title={t('details')}
          className="h-full 2xl:h-max col-span-12 lg:col-span-4 shadow-sm p-4"
          style={{ borderColor: colors.$24 }}
          withoutPadding
        >
          <div className="flex flex-col pt-1 space-y-3 h-44 overflow-y-auto">
            {vendor && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('status')}
                </span>

                <div>
                  <EntityStatus entity={vendor} />
                </div>
              </div>
            )}

            {vendor?.id_number && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('id_number')}
                </span>

                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {vendor.id_number}
                </span>
              </div>
            )}

            {vendor?.vat_number && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('vat_number')}
                </span>

                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {vendor.vat_number}
                </span>
              </div>
            )}

            {Boolean(vendor?.last_login) && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('last_login')}
                </span>

                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {lastLogin(vendor?.last_login)}
                </span>
              </div>
            )}

            {vendor?.website && (
              <div className="flex flex-col space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('website')}
                </span>

                <Link
                  className="font-medium whitespace-normal"
                  to={vendor.website}
                  external
                  style={{ textAlign: 'left' }}
                >
                  {vendor.website}
                </Link>
              </div>
            )}
          </div>
        </InfoCard>

        <InfoCard
          title={t('address')}
          withoutTruncate
          className="shadow-sm h-full 2xl:h-max col-span-12 lg:col-span-4 p-4"
          style={{ borderColor: colors.$24 }}
          withoutPadding
        >
          <div className="flex flex-col pt-1 h-44 overflow-y-auto">
            {vendor?.address1 && (
              <span
                className="break-all text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {vendor.address1}
              </span>
            )}

            {vendor?.address2 && (
              <span
                className="break-all text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {vendor.address2}
              </span>
            )}

            {(vendor?.city || vendor?.state || vendor?.postal_code) && (
              <span
                className="break-all text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {vendor.city && vendor.city}
                {vendor.city && vendor.state && ', '}
                {vendor.state}
                {(vendor.city || vendor.state) && vendor.postal_code && ' '}
                {vendor.postal_code}
              </span>
            )}

            {vendor?.country_id &&
              countries.find((country) => country.id === vendor.country_id)
                ?.name && (
                <span
                  className="break-all text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {
                    countries.find(
                      (country) => country.id === vendor.country_id
                    )?.name
                  }
                </span>
              )}
          </div>
        </InfoCard>

        <InfoCard
          title={t('contacts')}
          className="col-span-12 lg:col-span-4 shadow-sm h-full 2xl:h-max p-4"
          style={{ borderColor: colors.$24 }}
          withoutPadding
        >
          <div className="flex flex-col h-44 w-full overflow-y-auto">
            {vendor?.contacts.map((contact, index) => (
              <div
                key={index}
                className="flex justify-between items-center first:pt-1 py-4 border-b border-dashed"
                style={{ borderColor: colors.$21 }}
              >
                <div className="flex flex-col space-y-1 text-sm">
                  {Boolean(contact.first_name || contact.last_name) && (
                    <span className="font-medium" style={{ color: colors.$3 }}>
                      {contact.first_name} {contact.last_name}
                    </span>
                  )}

                  {Boolean(contact.phone) && (
                    <span className="font-medium" style={{ color: colors.$22 }}>
                      {contact.phone}
                    </span>
                  )}

                  {Boolean(contact.email) && (
                    <div className="flex space-x-2">
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-medium"
                        style={{ color: colors.$22 }}
                      >
                        {contact.email}
                      </a>

                      <Tooltip
                        message={t('copy') as string}
                        placement="top"
                        width="auto"
                        centerVertically
                      >
                        <CopyToClipboardIconOnly text={contact.email} />
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      <Tabs tabs={tabs} className="my-6" />

      <Outlet context={{ displayName: vendor?.name || '' }} />
    </Default>
  );
}

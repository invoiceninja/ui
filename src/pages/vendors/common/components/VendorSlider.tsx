/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Vendor } from '$app/common/interfaces/vendor';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { EntityStatus } from '$app/components/EntityStatus';
import { Button, Link } from '$app/components/forms';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useActions } from '../hooks/useActions';

export const vendorSliderAtom = atom<Vendor | null>(null);
export const vendorSliderVisibilityAtom = atom(false);

export function VendorSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const navigate = useNavigate();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const resolveCountry = useResolveCountry();
  const resolveCurrency = useResolveCurrency();

  const actions = useActions({
    showEditAction: true,
    showCommonBulkAction: true,
  });

  const [vendor, setVendor] = useAtom(vendorSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(vendorSliderVisibilityAtom);

  return (
    <Slider
      size="large"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setVendor(null);
      }}
      title={vendor?.name || `${t('vendor')}`}
      topRight={
        vendor ? (
          <ResourceActions
            label={t('actions')}
            resource={vendor}
            actions={actions}
          />
        ) : null
      }
      actionChildren={
        vendor ? (
          <Button
            className="w-full"
            behavior="button"
            onClick={() => {
              setIsSliderVisible(false);
              setVendor(null);
              navigate(route('/vendors/:id', { id: vendor.id }));
            }}
          >
            {t('view_vendor')}
          </Button>
        ) : null
      }
    >
      {vendor ? (
        <div className="space-y-4 pb-4">
          <p
            className="px-6 pt-4 text-sm font-medium uppercase tracking-wide"
            style={{ color: colors.$17 }}
          >
            {t('details')}
          </p>

          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('status')}
              withoutWrappingLeftSide
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              <EntityStatus entity={vendor} />
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('tax_exempt')}
              withoutWrappingLeftSide
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {vendor.is_tax_exempt ? t('yes') : t('no')}
            </Element>

            {Boolean(vendor && resolveCurrency(vendor.currency_id)?.name) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('currency')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {resolveCurrency(vendor.currency_id)?.name || ''}
              </Element>
            )}

            {Boolean(vendor.id_number) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('id_number')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {vendor.id_number}
              </Element>
            )}

            {Boolean(vendor.vat_number) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('vat_number')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {vendor.vat_number}
              </Element>
            )}

            {Boolean(vendor.last_login) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('last_login')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {date(vendor.last_login, dateFormat)}
              </Element>
            )}

            {Boolean(vendor.website) && (
              <Element
                leftSide={t('website')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
              >
                <Link to={vendor.website} external>
                  {vendor.website}
                </Link>
              </Element>
            )}
          </div>

          {Boolean(
            vendor.address1 ||
              vendor.address2 ||
              [vendor.city, vendor.state, vendor.postal_code]
                .filter(Boolean)
                .join(', ') ||
              resolveCountry(vendor.country_id)?.name
          ) && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              <p
                className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
                style={{ color: colors.$17 }}
              >
                {t('address')}
              </p>

              <div className="px-6">
                {Boolean(vendor.address1) && (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('address1')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {vendor.address1}
                  </Element>
                )}

                {Boolean(vendor.address2) && (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('address2')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {vendor.address2}
                  </Element>
                )}

                {Boolean(
                  [vendor.city, vendor.state, vendor.postal_code]
                    .filter(Boolean)
                    .join(', ')
                ) && (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('city')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {[vendor.city, vendor.state, vendor.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </Element>
                )}

                {Boolean(vendor && resolveCountry(vendor.country_id)?.name) && (
                  <Element
                    leftSide={t('country')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                  >
                    {resolveCountry(vendor.country_id)?.name || ''}
                  </Element>
                )}
              </div>
            </>
          )}

          {vendor.contacts.length > 0 && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              <p
                className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
                style={{ color: colors.$17 }}
              >
                {t('contacts')}
              </p>

              <div className="flex flex-col px-6 pt-1">
                {vendor.contacts.map(
                  (contact, index) =>
                    Boolean(
                      contact.first_name ||
                        contact.last_name ||
                        contact.email ||
                        contact.phone
                    ) && (
                      <div
                        key={index}
                        className="flex flex-col space-y-1 py-3 text-sm border-b border-dashed"
                        style={{ borderColor: colors.$20 }}
                      >
                        {Boolean(contact.first_name || contact.last_name) && (
                          <span
                            className="font-medium"
                            style={{ color: colors.$3 }}
                          >
                            {contact.first_name} {contact.last_name}
                          </span>
                        )}

                        {Boolean(contact.email) && (
                          <div className="flex items-center space-x-2">
                            <span style={{ color: colors.$17 }}>
                              {contact.email}
                            </span>

                            <CopyToClipboardIconOnly text={contact.email} />
                          </div>
                        )}

                        {Boolean(contact.phone) && (
                          <span style={{ color: colors.$17 }}>
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    )
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner />
        </div>
      )}
    </Slider>
  );
}

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
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { useResolveLanguage } from '$app/common/hooks/useResolveLanguage';
import { Client } from '$app/common/interfaces/client';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { EntityStatus } from '$app/components/EntityStatus';
import { Button, Link } from '$app/components/forms';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { Tooltip } from '$app/components/Tooltip';
import { atom, useAtom } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useActions } from '../hooks/useActions';

export const clientSliderAtom = atom<Client | null>(null);
export const clientSliderVisibilityAtom = atom(false);

interface StandingCardProps {
  label: string;
  value: ReactNode;
}

function StandingCard({ label, value }: StandingCardProps) {
  const colors = useColorScheme();

  return (
    <div
      className="flex flex-col space-y-1 rounded-md border p-4"
      style={{ borderColor: colors.$20 }}
    >
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: colors.$17 }}
      >
        {label}
      </span>

      <span className="text-lg font-medium" style={{ color: colors.$3 }}>
        {value}
      </span>
    </div>
  );
}

export function ClientSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const navigate = useNavigate();

  const formatMoney = useFormatMoney();
  const resolveCountry = useResolveCountry();
  const resolveCurrency = useResolveCurrency();
  const resolveLanguage = useResolveLanguage();

  const actions = useActions({ showEditAction: true });

  const [client, setClient] = useAtom(clientSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(clientSliderVisibilityAtom);

  return (
    <Slider
      size="large"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setClient(null);
      }}
      title={client?.display_name || `${t('client')}`}
      topRight={
        client ? (
          <ResourceActions
            label={t('actions')}
            resource={client}
            actions={actions}
          />
        ) : null
      }
      actionChildren={
        client ? (
          <Button
            className="w-full"
            behavior="button"
            onClick={() => {
              setIsSliderVisible(false);
              setClient(null);
              navigate(route('/clients/:id', { id: client.id }));
            }}
          >
            {t('view_client')}
          </Button>
        ) : null
      }
    >
      {client ? (
        <div className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3 px-6 pt-4">
            <StandingCard
              label={t('paid_to_date')}
              value={formatMoney(
                client.paid_to_date,
                client.country_id,
                client.settings.currency_id
              )}
            />

            <StandingCard
              label={t('balance')}
              value={formatMoney(
                client.balance,
                client.country_id,
                client.settings.currency_id
              )}
            />

            <StandingCard
              label={t('credit_balance')}
              value={formatMoney(
                client.credit_balance,
                client.country_id,
                client.settings.currency_id
              )}
            />

            <StandingCard
              label={t('payment_balance')}
              value={formatMoney(
                client.payment_balance,
                client.country_id,
                client.settings.currency_id
              )}
            />
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          <p
            className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
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
              <EntityStatus entity={client} />
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('number')}
              withoutWrappingLeftSide
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {client.number}
            </Element>

            {Boolean(client.website) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('website')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                <Link to={client.website} external>
                  {client.website}
                </Link>
              </Element>
            )}

            {Boolean(
              client && resolveCurrency(client.settings.currency_id)?.name
            ) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('currency')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {resolveCurrency(client.settings.currency_id)?.name || ''}
              </Element>
            )}

            {Boolean(
              client &&
                client.settings.language_id &&
                resolveLanguage(client.settings.language_id)?.name
            ) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('language')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {resolveLanguage(client.settings.language_id)?.name || ''}
              </Element>
            )}

            {Boolean(client.vat_number) && (
              <Element
                className="border-b border-dashed"
                leftSide={t('vat_number')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {client.vat_number}
              </Element>
            )}

            {Boolean(client.phone) && (
              <Element
                leftSide={t('phone')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
              >
                {client.phone}
              </Element>
            )}
          </div>

          {Boolean(
            client.address1 ||
              client.address2 ||
              [client.city, client.state, client.postal_code]
                .filter(Boolean)
                .join(', ') ||
              resolveCountry(client.country_id)?.name
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
                {Boolean(client.address1) && (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('address1')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {client.address1}
                  </Element>
                )}

                {Boolean(client.address2) && (
                  <Element
                    className="border-b border-dashed"
                    leftSide={t('address2')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {client.address2}
                  </Element>
                )}

                {Boolean(
                  [client.city, client.state, client.postal_code]
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
                    {[client.city, client.state, client.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </Element>
                )}

                {Boolean(client && resolveCountry(client.country_id)?.name) && (
                  <Element
                    leftSide={t('country')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                  >
                    {resolveCountry(client.country_id)?.name || ''}
                  </Element>
                )}
              </div>
            </>
          )}

          {client.contacts.length > 0 && (
            <>
              <Divider withoutPadding borderColor={colors.$20} />

              <p
                className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
                style={{ color: colors.$17 }}
              >
                {t('contacts')}
              </p>

              <div className="flex flex-col px-6 pt-1">
                {client.contacts.map(
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

                        <div className="flex items-center space-x-3 pt-1">
                          <Link
                            to={route(
                              `${contact.link}?silent=true&client_hash=:clientHash`,
                              { clientHash: client.client_hash }
                            )}
                            external
                            withoutExternalIcon
                          >
                            {t('client_portal')}
                          </Link>

                          <Tooltip
                            message={t('copy_link') as string}
                            placement="top"
                            width="auto"
                            centerVertically
                          >
                            <CopyToClipboardIconOnly
                              text={route(`${contact.link}?silent=true`)}
                            />
                          </Tooltip>
                        </div>
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

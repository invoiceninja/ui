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
import { Client } from '$app/common/interfaces/client';
import { Slider } from '$app/components/cards/Slider';
import { Button } from '$app/components/forms';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useActions } from '../hooks/useActions';

export const clientSliderAtom = atom<Client | null>(null);
export const clientSliderVisibilityAtom = atom(false);

export function ClientSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const actions = useActions();

  const [client, setClient] = useAtom(clientSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(clientSliderVisibilityAtom);

  const cards = client
    ? [
        {
          label: t('paid_to_date'),
          value: formatMoney(
            client.paid_to_date,
            client.country_id,
            client.settings.currency_id
          ),
        },
        {
          label: t('balance'),
          value: formatMoney(
            client.balance,
            client.country_id,
            client.settings.currency_id
          ),
        },
        {
          label: t('credit_balance'),
          value: formatMoney(
            client.credit_balance,
            client.country_id,
            client.settings.currency_id
          ),
        },
        {
          label: t('payment_balance'),
          value: formatMoney(
            client.payment_balance,
            client.country_id,
            client.settings.currency_id
          ),
        },
      ]
    : [];

  return (
    <Slider
      size="regular"
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
            <span className="inline-flex items-center gap-2">
              {t('view_client')}

              <MdArrowForward size={18} />
            </span>
          </Button>
        ) : null
      }
    >
      {client ? (
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col space-y-1 rounded-md border p-4"
                style={{ borderColor: colors.$20 }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: colors.$17 }}
                >
                  {card.label}
                </span>

                <span
                  className="text-lg font-medium"
                  style={{ color: colors.$3 }}
                >
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner />
        </div>
      )}
    </Slider>
  );
}

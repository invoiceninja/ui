/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useTranslation } from 'react-i18next';
import { Payment } from '$app/common/interfaces/payment';
import { PaymentOverviewInvoice } from './PaymentOverviewInvoice';
import { PaymentStatus } from '../common/components/PaymentStatus';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';
import { Divider } from '$app/components/cards/Divider';

interface Props {
  payment: Payment;
}

export function PaymentOverview(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const formatMoney = useFormatMoney();

  return (
    <div>
      <div
        className={classNames('border-t mt-6 pt-6 px-4 md:px-6', {
          'pb-4': props.payment.paymentables.length,
        })}
        style={{ borderColor: colors.$20 }}
      >
        <div className="flex justify-center mb-5">
          <PaymentStatus entity={props.payment} />
        </div>

        <div
          className={classNames('grid grid-cols-2 gap-3 text-sm md:text-base', {
            'sm:grid-cols-4': props?.payment?.applied < props?.payment?.amount,
            'sm:grid-cols-3': props?.payment?.applied >= props?.payment?.amount,
          })}
        >
          <div
            className="rounded-md p-3 flex items-center flex-col shadow-sm border"
            style={{ borderColor: colors.$20 }}
          >
            <span className="text-xs mb-1" style={{ color: colors.$22 }}>
              {t('amount')}
            </span>

            <span
              className="font-medium text-base md:text-lg"
              style={{ color: colors.$3 }}
            >
              {formatMoney(
                props?.payment?.amount || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>
          </div>

          <div
            className="rounded-md p-3 flex items-center flex-col shadow-sm border"
            style={{ borderColor: colors.$20 }}
          >
            <span className="text-xs mb-1" style={{ color: colors.$22 }}>
              {t('applied')}
            </span>

            <span
              className="font-medium text-base md:text-lg"
              style={{ color: colors.$3 }}
            >
              {formatMoney(
                props?.payment?.applied || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>
          </div>

          <div
            className="rounded-md p-3 flex items-center flex-col shadow-sm border"
            style={{ borderColor: colors.$20 }}
          >
            <span className="text-xs mb-1" style={{ color: colors.$22 }}>
              {t('refunded')}
            </span>

            <span
              className="font-medium text-base md:text-lg"
              style={{ color: colors.$3 }}
            >
              {formatMoney(
                props?.payment?.refunded || 0,
                props.payment.client?.country_id,
                props.payment?.currency_id
              )}
            </span>
          </div>

          {props?.payment?.applied < props?.payment?.amount && (
            <div
              className="rounded-md p-3 flex items-center flex-col shadow-sm border"
              style={{ borderColor: colors.$20 }}
            >
              <span className="text-xs mb-1" style={{ color: colors.$22 }}>
                {t('unapplied')}
              </span>

              <span
                className="font-medium text-base md:text-lg"
                style={{ color: colors.$3 }}
              >
                {formatMoney(
                  props?.payment?.amount - props?.payment?.applied || 0,
                  props.payment.client?.country_id,
                  props.payment?.currency_id
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {props.payment.paymentables.length ? (
        <div className="pb-2">
          {props.payment.paymentables.map((value) => (
            <PaymentOverviewInvoice
              key={value.id}
              payment={props.payment}
              paymentable={value}
            />
          ))}
        </div>
      ) : (
        <Divider borderColor={colors.$20} />
      )}
    </div>
  );
}

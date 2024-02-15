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
import { Invoice } from '$app/common/interfaces/invoice';
import { TabGroup } from '$app/components/TabGroup';
import { ClickableElement, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date, endpoint, trans } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Link } from '$app/components/forms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { route } from '$app/common/helpers/route';
import reactStringReplace from 'react-string-replace';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { Payment } from '$app/common/interfaces/payment';
import { useActions } from '../hooks/useActions';
import { PaymentStatus } from './PaymentStatus';
import { InvoiceStatus } from '$app/pages/invoices/common/components/InvoiceStatus';
import { PaymentActivity } from '$app/common/interfaces/payment-activity';

export const paymentSliderAtom = atom<Payment | null>(null);
export const paymentSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

function useGenerateActivityElement() {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();

  return (activity: PaymentActivity, payment: Payment | null) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.label}
        </Link>
      ),
      user: activity.user?.label ?? t('system'),
      payment_amount: formatMoney(
        activity.payment_amount,
        payment?.client?.country_id,
        payment?.client?.settings.currency_id
      ),
      invoice:
        (
          <Link
            to={route('/invoices/:id/edit', {
              id: activity.invoice?.hashed_id,
            })}
          >
            {activity?.invoice?.label}
          </Link>
        ) ?? '',
      contact:
        (
          <Link
            to={route('/clients/:id/edit', {
              id: activity?.contact?.hashed_id,
            })}
          >
            {activity?.contact?.label}
          </Link>
        ) ?? '',
    };
    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text = reactStringReplace(text, `:${variable}`, () => value);
    }

    return text;
  };
}

export function PaymentSlider() {
  const [t] = useTranslation();

  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();
  const activityElement = useGenerateActivityElement();

  const [payment, setPayment] = useAtom(paymentSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(paymentSliderVisibilityAtom);

  const { data: resource } = useQuery({
    queryKey: ['/api/v1/payments', payment?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          `/api/v1/payments/${payment?.id}?include=activities.history,invoices&reminder_schedule=true`
        )
      ).then(
        (response: GenericSingleResourceResponse<Invoice>) => response.data.data
      ),
    enabled: payment !== null && isVisible,
    staleTime: Infinity,
  });

  const { data: activities } = useQuery({
    queryKey: ['/api/v1/activities', payment?.id, 'payment'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/activities/entity'), {
        entity: 'payment',
        entity_id: payment?.id,
      }).then(
        (response: AxiosResponse<GenericManyResponse<PaymentActivity>>) =>
          response.data.data
      ),
    enabled: payment !== null && isVisible,
    staleTime: Infinity,
  });

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setPayment(null);
      }}
      title={`${t('payment')} ${payment?.number}`}
      topRight={
        payment &&
        (hasPermission('edit_payment') || entityAssigned(payment)) && (
          <ResourceActions
            label={t('more_actions')}
            resource={payment}
            actions={actions}
          />
        )
      }
      withoutActionContainer
    >
      <TabGroup
        tabs={[t('overview'), t('history'), t('activity')]}
        width="full"
      >
        <div className="space-y-2">
          <div>
            <Element leftSide={t('payment_amount')} withoutWrappingLeftSide>
              {payment
                ? formatMoney(
                    payment?.amount,
                    payment.client?.country_id,
                    payment.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('applied')}>
              {payment
                ? formatMoney(
                    payment.applied,
                    payment.client?.country_id,
                    payment.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element leftSide={t('date')}>
              {payment ? date(payment.date, dateFormat) : null}
            </Element>

            <Element leftSide={t('payment_type')}>
              {payment ? t(payment.type_id) : null}
            </Element>

            <Element leftSide={t('status')}>
              {payment ? <PaymentStatus entity={payment} /> : null}
            </Element>
          </div>

          <Divider withoutPadding />

          <div className="flex flex-col space-y-2">
            {payment?.invoices?.map((invoice, index) => (
              <ClickableElement
                key={index}
                to={route('/invoices/:id/edit', {
                  id: invoice.id,
                })}
                disableNavigation={disableNavigation('invoice', invoice)}
              >
                <div className="flex flex-col space-y-2">
                  <p className="font-semibold">
                    {t('invoice')} {invoice.number}
                  </p>

                  <div className="flex items-center space-x-1">
                    <p>
                      {formatMoney(
                        invoice.amount,
                        invoice.client?.country_id,
                        invoice.client?.settings.currency_id
                      )}
                    </p>
                    <p>&middot;</p>
                    <p>{date(invoice.date, dateFormat)}</p>
                  </div>

                  <div>
                    <InvoiceStatus entity={invoice} />
                  </div>
                </div>
              </ClickableElement>
            ))}
          </div>
        </div>

        <div>
          {resource?.activities &&
            resource.activities.map((activity) => (
              <ClickableElement
                key={activity.id}
                to={`/activities/${activity.id}`}
              >
                <div className="flex flex-col">
                  <div className="flex space-x-1">
                    <span>
                      {payment?.client
                        ? formatMoney(
                            activity.history.amount,
                            payment?.client?.country_id,
                            payment?.client?.settings.currency_id
                          )
                        : null}
                    </span>
                    <span>&middot;</span>
                    <DynamicLink
                      to={`/clients/${activity.client_id}`}
                      renderSpan={disableNavigation('client', payment?.client)}
                    >
                      {payment?.client?.display_name}
                    </DynamicLink>
                  </div>

                  <div className="inline-flex items-center space-x-1">
                    <p>
                      {date(activity.created_at, `${dateFormat} h:mm:ss A`)}
                    </p>
                    <p>{dayjs.unix(activity.created_at).fromNow()}</p>
                  </div>
                </div>
              </ClickableElement>
            ))}
        </div>

        <div>
          {activities?.map((activity) => (
            <NonClickableElement key={activity.id} className="flex flex-col">
              <p>{activityElement(activity, payment)}</p>
              <div className="inline-flex items-center space-x-1">
                <p>{date(activity.created_at, `${dateFormat} h:mm:ss A`)}</p>
                <p>&middot;</p>
                <p>{activity.ip}</p>
              </div>
            </NonClickableElement>
          ))}
        </div>
      </TabGroup>
    </Slider>
  );
}

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
import { TabGroup } from '$app/components/TabGroup';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date, endpoint } from '$app/common/helpers';
import { ResourceActions } from '$app/components/ResourceActions';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Payment } from '$app/common/interfaces/payment';
import { useActions } from '../hooks/useActions';
import { PaymentStatus } from './PaymentStatus';
import { InvoiceStatus } from '$app/pages/invoices/common/components/InvoiceStatus';
import { PaymentActivity } from '$app/common/interfaces/payment-activity';
import { CreditStatus } from '$app/pages/credits/common/components/CreditStatus';
import paymentType from '$app/common/constants/payment-type';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useNavigate } from 'react-router-dom';
import { SquareActivityChart } from '$app/components/icons/SquareActivityChart';
import { useGenerateActivityElement } from '../hooks/useGenerateActivityElement';

export const paymentSliderAtom = atom<Payment | null>(null);
export const paymentSliderVisibilityAtom = atom(false);

dayjs.extend(relativeTime);

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function PaymentSlider() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();

  const actions = useActions({
    showCommonBulkAction: true,
    showEditAction: true,
  });

  const { timeFormat } = useCompanyTimeFormat();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const disableNavigation = useDisableNavigation();
  const activityElement = useGenerateActivityElement();

  const [payment, setPayment] = useAtom(paymentSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(paymentSliderVisibilityAtom);

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
        (hasPermission('edit_payment') || entityAssigned(payment)) ? (
          <ResourceActions
            label={t('actions')}
            resource={payment}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('activity')]}
        width="full"
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('payment_amount')}
              withoutWrappingLeftSide
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {payment
                ? formatMoney(
                    payment?.amount,
                    payment.client?.country_id,
                    payment.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('applied')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {payment
                ? formatMoney(
                    payment.applied,
                    payment.client?.country_id,
                    payment.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('date')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {payment ? date(payment.date, dateFormat) : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('payment_type')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {payment
                ? t(paymentType[payment.type_id as keyof typeof paymentType])
                : null}
            </Element>

            <Element
              leftSide={t('status')}
              pushContentToRight
              noExternalPadding
            >
              {payment ? <PaymentStatus entity={payment} /> : null}
            </Element>
          </div>

          <Divider withoutPadding borderColor={colors.$20} />

          <div className="flex flex-col space-y-4 px-6 py-5">
            {payment?.invoices?.map((invoice, index) => (
              <Box
                key={index}
                className="flex flex-col items-start justify-center space-y-2 shadow-sm text-sm border p-5 w-full cursor-pointer rounded-md"
                onClick={() => {
                  !disableNavigation('invoice', invoice) &&
                    navigate(
                      route('/invoices/:id/edit', {
                        id: invoice.id,
                      })
                    );
                }}
                style={{
                  borderColor: colors.$20,
                }}
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$4,
                }}
              >
                <span className="font-medium" style={{ color: colors.$3 }}>
                  {t('invoice')} {invoice.number}
                </span>

                <div
                  className="inline-flex items-center space-x-1"
                  style={{ color: colors.$17 }}
                >
                  <span>
                    {formatMoney(
                      invoice.amount,
                      payment.client?.country_id,
                      payment.currency_id
                    )}
                  </span>

                  <span>-</span>

                  <span>{date(invoice.date, dateFormat)}</span>
                </div>

                <div>
                  <InvoiceStatus entity={invoice} />
                </div>
              </Box>
            ))}
          </div>

          {Boolean(payment?.credits?.length) && (
            <Divider withoutPadding borderColor={colors.$20} />
          )}

          <div className="flex flex-col space-y-4 px-6 py-5">
            {payment?.credits?.map((credit, index) => (
              <Box
                key={index}
                className="flex flex-col items-start justify-center space-y-2 shadow-sm text-sm border p-5 w-full cursor-pointer rounded-md"
                onClick={() => {
                  !disableNavigation('credit', credit) &&
                    navigate(
                      route('/credits/:id/edit', {
                        id: credit.id,
                      })
                    );
                }}
                style={{
                  borderColor: colors.$20,
                }}
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$4,
                }}
              >
                <span className="font-medium" style={{ color: colors.$3 }}>
                  {t('credit')} {credit.number}
                </span>

                <div
                  className="inline-flex items-center space-x-1"
                  style={{ color: colors.$17 }}
                >
                  <span>
                    {formatMoney(
                      credit.amount,
                      payment.client?.country_id,
                      payment.currency_id
                    )}
                  </span>

                  <span>-</span>

                  <span>{date(credit.date, dateFormat)}</span>
                </div>

                <div>
                  <CreditStatus entity={credit} />
                </div>
              </Box>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col pt-3 px-3">
            {activities?.map((activity) => (
              <Box
                key={activity.id}
                className="flex space-x-3 p-4 rounded-md flex-1 min-w-0"
                theme={{
                  backgroundColor: colors.$1,
                  hoverBackgroundColor: colors.$25,
                }}
              >
                <div className="flex items-center justify-center">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: colors.$20 }}
                  >
                    <SquareActivityChart
                      size="1.3rem"
                      color={colors.$16}
                      filledColor={colors.$16}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                  <div className="text-sm" style={{ color: colors.$3 }}>
                    {activityElement(activity)}
                  </div>

                  <div
                    className="flex w-full items-center space-x-1 text-xs truncate"
                    style={{ color: colors.$17 }}
                  >
                    <span className="whitespace-nowrap">
                      {date(activity.created_at, `${dateFormat} ${timeFormat}`)}
                    </span>

                    <span>-</span>

                    <span>{activity.ip}</span>
                  </div>
                </div>
              </Box>
            ))}
          </div>
        </div>
      </TabGroup>
    </Slider>
  );
}

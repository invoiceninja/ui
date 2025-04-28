/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Paymentable } from '$app/common/interfaces/payment';

import { useNavigate, useOutletContext } from 'react-router-dom';
import { Context } from '../Edit';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Payment } from '$app/common/interfaces/payment';
import { useTranslation } from 'react-i18next';
import { date } from '$app/common/helpers';
import { PaymentStatus } from '$app/pages/payments/common/components/PaymentStatus';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Card } from '$app/components/cards';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import classNames from 'classnames';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

function Payments() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();
  const { invoice } = context;

  const colors = useColorScheme();

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <Card
      title={t('payments')}
      className="shadow-sm"
      style={{ maxHeight: '42.5rem', borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
      withScrollableBody
    >
      <div
        className={classNames('flex justify-center w-full px-2 pt-2', {
          'pb-10': invoice?.payments?.length,
          'pb-6': !invoice?.payments?.length,
        })}
      >
        <div className="flex flex-col space-y-2 w-full lg:w-2/4">
          {invoice?.payments &&
            invoice.payments.map((payment: Payment) =>
              payment.paymentables
                .filter(
                  (item) =>
                    item.invoice_id == invoice?.id && item.archived_at == 0
                )
                .map((paymentable: Paymentable) => (
                  <Box
                    key={payment.id}
                    className="flex flex-col items-start justify-center space-y-2 shadow-sm text-sm border p-5 w-full cursor-pointer rounded-md"
                    onClick={() => {
                      !disableNavigation('payment', payment) &&
                        navigate(
                          route('/payments/:id/edit', {
                            id: payment.id,
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
                      {t('payment')} {payment.number}
                    </span>

                    <div
                      className="inline-flex items-center space-x-1"
                      style={{ color: colors.$17 }}
                    >
                      <span>
                        {formatMoney(
                          paymentable.amount,
                          payment.client?.country_id,
                          payment.client?.settings.currency_id
                        )}
                      </span>

                      <span>-</span>

                      <span>{date(paymentable.created_at, dateFormat)}</span>
                    </div>

                    <div>
                      <PaymentStatus entity={payment} />
                    </div>
                  </Box>
                ))
            )}
        </div>
      </div>
    </Card>
  );
}

export default Payments;

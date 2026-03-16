/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Context } from '../Edit';
import { Card } from '$app/components/cards';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Spinner } from '$app/components/Spinner';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import styled from 'styled-components';
import classNames from 'classnames';
import { Payment } from '$app/common/interfaces/payment';
import { useUnappliedPayments } from '../hooks/useUnappliedPayments';
import { Button } from '$app/components/forms';
import { CreditCard } from '$app/components/icons/CreditCard';
import { Badge } from '$app/components/Badge';

const Box = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.backgroundColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
  }
`;

export default function UnappliedPayments() {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const colors = useColorScheme();
  const context: Context = useOutletContext();
  const { invoice } = context;

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { payments, isLoading } = useUnappliedPayments({
    clientId: invoice?.client_id,
  });

  const getUnappliedAmount = (payment: Payment) => {
    return payment.amount - (payment.applied || 0);
  };

  return (
    <Card
      title={t('unapplied_payments')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div
        className={classNames('w-full px-2 pt-2', {
          'pb-10': payments?.length,
          'pb-6': !payments?.length,
        })}
      >
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        <div className="flex flex-col w-full gap-2">
          {payments.map((payment) => {
            const unappliedAmount = getUnappliedAmount(payment);

            return (
              <Box
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                onClick={() =>
                  navigate(route('/payments/:id/edit', { id: payment.id }))
                }
                theme={{
                  backgroundColor: colors.$4,
                  hoverBackgroundColor: colors.$15,
                }}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="flex-shrink-0 p-2 rounded-full"
                    style={{ backgroundColor: colors.$20 }}
                  >
                    <CreditCard size="1.2rem" color={colors.$16} />
                  </div>

                  <div className="flex flex-col items-start space-y-1 min-w-0">
                    <div
                      className="flex items-center space-x-2 text-sm"
                      style={{ color: colors.$3 }}
                    >
                      {payment.number && <span>#{payment.number}</span>}

                      {payment.number && (
                        <span style={{ color: colors.$17 }}>·</span>
                      )}

                      <span>{date(payment.date, `${dateFormat}`)}</span>
                    </div>

                    {invoice?.client && (
                      <Badge variant="green">
                        {formatMoney(
                          unappliedAmount,
                          invoice.client.country_id,
                          invoice.client.settings.currency_id
                        )}
                      </Badge>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center flex-shrink-0 ml-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="primary"
                    behavior="button"
                    disabled={!invoice || unappliedAmount <= 0}
                    onClick={() =>
                      navigate(
                        route('/payments/:id/apply', { id: payment.id }) +
                          `?invoice_id=${invoice?.id}`
                      )
                    }
                  >
                    {t('apply')}
                  </Button>
                </div>
              </Box>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

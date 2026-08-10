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
import { dateUTC } from '$app/common/helpers/payment';
import { route } from '$app/common/helpers/route';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Invoice } from '$app/common/interfaces/invoice';
import { PaymentStatus } from '$app/pages/payments/common/components/PaymentStatus';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { InvoicePaymentAllocationRow } from '../helpers/invoicePaymentAllocations';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

interface Props {
  row: InvoicePaymentAllocationRow;
  invoice: Invoice;
  dateFormat: string;
}

export function InvoicePaymentAllocationBox(props: Props) {
  const { row, invoice, dateFormat } = props;

  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { payment, paymentable } = row;

  return (
    <Box
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
            invoice.client?.country_id,
            invoice.client?.settings?.currency_id
          )}
        </span>

        <span>-</span>

        <span>{dateUTC(paymentable.created_at, dateFormat)}</span>
      </div>

      <div>
        <PaymentStatus entity={payment} />
      </div>
    </Box>
  );
}

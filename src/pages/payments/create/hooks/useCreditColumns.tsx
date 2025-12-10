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
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { DataTableColumns } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { DynamicLink } from '$app/components/DynamicLink';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { Credit } from '$app/common/interfaces/credit';
import { useAllCreditColumns } from '$app/pages/credits/common/hooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { PaymentOnCreation } from '../Create';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { cloneDeep, set } from 'lodash';
import { TableNumberInputField } from '../../common/components/TableNumberInputField';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { Client } from '$app/common/interfaces/client';

interface UseCreditColumnsProps {
  payment: PaymentOnCreation | undefined;
  setPayment: Dispatch<SetStateAction<PaymentOnCreation | undefined>>;
  errors: ValidationBag | undefined;
}

export function useCreditColumns({
  payment,
  setPayment,
  errors,
}: UseCreditColumnsProps): DataTableColumns<Credit> {
  const creditColumns = useAllCreditColumns();
  type CreditColumns = (typeof creditColumns)[number];

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const clientResolver = useClientResolver();
  const disableNavigation = useDisableNavigation();

  const [resolvedClient, setResolvedClient] = useState<Client>();

  useEffect(() => {
    if (payment?.client_id) {
      clientResolver
        .find(payment.client_id)
        .then((client) => setResolvedClient(client));
    }
  }, [payment?.client_id]);

  const columns: DataTableColumnsExtended<Credit, CreditColumns> = [
    {
      column: 'number',
      id: 'number',
      label: t('number'),
      format: (value, credit) => (
        <DynamicLink
          to={route('/credits/:id/edit', { id: credit.id })}
          renderSpan={disableNavigation('credit', credit)}
        >
          {value}
        </DynamicLink>
      ),
    },
    {
      column: 'date',
      id: 'date',
      label: t('date'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (value) =>
        formatMoney(
          value,
          resolvedClient?.country_id,
          resolvedClient?.settings.currency_id
        ),
    },
    {
      column: 'received',
      id: 'id',
      label: t('received'),
      format: (_, credit) => {
        const creditIndex = payment?.credits.findIndex(
          (p) => p.credit_id === credit.id
        );

        return (
          <TableNumberInputField
            value={
              payment?.credits.find((p) => p.credit_id === credit.id)?.amount ||
              0
            }
            onValueChange={(value) => {
              if (creditIndex === -1) return;

              setPayment((current) => {
                if (current) {
                  const updatedPayment = cloneDeep(current);

                  set(
                    updatedPayment,
                    `credits.${creditIndex}.amount`,
                    isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                  );

                  return updatedPayment;
                }

                return current;
              });
            }}
            disabled={creditIndex === -1}
            errorMessage={[
              ...(errors?.errors[`credits.${creditIndex}.amount`] || []),
              ...(errors?.errors[`credits.${creditIndex}.credit_id`] || []),
            ]}
          />
        );
      },
    },
  ];

  return columns;
}

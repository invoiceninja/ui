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

export function useCreditColumns(): DataTableColumns<Credit> {
  const creditColumns = useAllCreditColumns();
  type CreditColumns = (typeof creditColumns)[number];

  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const formatMoney = useFormatMoney();

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
      format: (value, credit) =>
        formatMoney(
          value,
          credit.client?.country_id,
          credit.client?.settings.currency_id
        ),
    },
  ];

  return columns;
}

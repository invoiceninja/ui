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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

interface Props {
  lineItem: InvoiceItem;
  client: Client | undefined;
  fallbackHref?: string;
}

export function ViewLineItem(props: Props) {
  const { lineItem, client, fallbackHref } = props;

  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();

  const canViewTask =
    Boolean(lineItem.task_id) &&
    (hasPermission('view_task') || hasPermission('edit_task'));

  const canViewExpense =
    Boolean(lineItem.expense_id) &&
    (hasPermission('view_expense') || hasPermission('edit_expense'));

  const isClickable = canViewTask || canViewExpense || Boolean(fallbackHref);

  const handleClick = () => {
    if (canViewTask && lineItem.task_id) {
      navigate(route('/tasks/:id/edit', { id: lineItem.task_id }));

      return;
    }

    if (canViewExpense && lineItem.expense_id) {
      navigate(route('/expenses/:id/edit', { id: lineItem.expense_id }));

      return;
    }

    if (fallbackHref) {
      navigate(fallbackHref);
    }
  };

  const productLabel = lineItem.product_key?.trim() || t('item');

  const formattedCost = formatMoney(
    lineItem.cost ?? 0,
    client?.country_id,
    client?.settings.currency_id
  );

  const formattedLineTotal = formatMoney(
    lineItem.line_total ?? 0,
    client?.country_id,
    client?.settings.currency_id
  );

  return (
    <Box
      className={`flex items-center justify-between gap-3 p-4 rounded-md border ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={isClickable ? handleClick : undefined}
      style={{ borderColor: colors.$20 }}
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: isClickable ? colors.$4 : colors.$1,
      }}
    >
      <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
        <span
          className="text-sm font-medium truncate"
          style={{ color: colors.$3 }}
          title={lineItem.product_key}
        >
          {productLabel}
        </span>

        <span className="text-xs" style={{ color: colors.$17 }}>
          {lineItem.quantity} x {formattedCost}
        </span>

        {lineItem.notes ? (
          <span
            className="text-xs truncate"
            style={{ color: colors.$17 }}
            title={lineItem.notes}
          >
            {lineItem.notes}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-sm font-medium whitespace-nowrap"
          style={{ color: colors.$3 }}
        >
          {formattedLineTotal}
        </span>

        {isClickable ? (
          <Icon element={ChevronRight} size={16} color={colors.$17} />
        ) : null}
      </div>
    </Box>
  );
}

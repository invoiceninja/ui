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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Client } from '$app/common/interfaces/client';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Icon } from '$app/components/icons/Icon';
import { useCallback, useMemo } from 'react';
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
  editHref: string;
}

export function ViewLineItem(props: Props) {
  const { lineItem, client, editHref } = props;

  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const handleClick = useCallback(() => {
    const params = new URLSearchParams();

    if (lineItem._id) {
      params.set('line_item_id', lineItem._id);
    }

    if (lineItem.type_id === InvoiceItemType.Task) {
      params.set('table', 'tasks');
    }

    const query = params.toString();

    navigate(query ? `${editHref}?${query}` : editHref);
  }, [editHref, lineItem._id, lineItem.type_id, navigate]);

  const productLabel = useMemo(
    () => lineItem.product_key?.trim() || t('item'),
    [lineItem.product_key, t]
  );

  const formattedCost = useMemo(
    () =>
      formatMoney(
        lineItem.cost ?? 0,
        client?.country_id,
        client?.settings.currency_id
      ),
    [
      formatMoney,
      lineItem.cost,
      client?.country_id,
      client?.settings.currency_id,
    ]
  );

  const formattedLineTotal = useMemo(
    () =>
      formatMoney(
        lineItem.line_total ?? 0,
        client?.country_id,
        client?.settings.currency_id
      ),
    [
      formatMoney,
      lineItem.line_total,
      client?.country_id,
      client?.settings.currency_id,
    ]
  );

  return (
    <Box
      className="flex items-center justify-between gap-3 p-4 rounded-md border cursor-pointer"
      onClick={handleClick}
      style={{ borderColor: colors.$20 }}
      theme={{
        backgroundColor: colors.$1,
        hoverBackgroundColor: colors.$4,
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

        <Icon element={ChevronRight} size={16} color={colors.$17} />
      </div>
    </Box>
  );
}

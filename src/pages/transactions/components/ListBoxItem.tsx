/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox } from '$app/components/forms';
import { StatusBadge } from '$app/components/StatusBadge';
import invoiceStatus from '$app/common/constants/invoice-status';
import { ResourceItem } from './ListBox';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import paymentStatus from '$app/common/constants/payment-status';
import { ExpenseStatus } from '$app/pages/expenses/common/components/ExpenseStatus';
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useColorScheme } from '$app/common/colors';

interface Props {
  resourceItem: ResourceItem;
  isItemChecked: boolean;
  selectItem: (id: string, clientId?: string) => void;
  dataKey: string;
}

export function ListBoxItem(props: Props) {
  const formatMoney = useFormatMoney();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const colors = useColorScheme();

  return (
    <li
      style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
      key={props.resourceItem.id}
      className="flex justify-between w-full cursor-pointer p-4 border-b last:border-b-0"
      onClick={() =>
        props.selectItem(props.resourceItem.id, props.resourceItem.clientId)
      }
    >
      <div className="flex items-center">
        <Checkbox
          style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
          checked={props.isItemChecked}
          onClick={() => props.selectItem(props.resourceItem.id)}
        />
        <div className="flex flex-col items-start" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
          <span className="text-sm">{props.resourceItem.name}</span>
          <span className="text-sm">{props.resourceItem.number}</span>
        </div>
      </div>
      <div className="flex items-center flex-grow pr-3" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
        <div className="flex flex-col flex-grow pl-8 pr-3" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
          <span className="text-sm" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>{props.resourceItem.clientName}</span>
          <span className="text-sm" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
            {formatDate(props.resourceItem.date || '', dateFormat)}
          </span>
        </div>
        {typeof props.resourceItem.amount === 'number' && (
          <span className="text-sm" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
            {formatMoney(
              props.resourceItem.amount || 0,
              props.resourceItem.country_id,
              props.resourceItem.currency_id
            )}
          </span>
        )}
      </div>
      <div className="flex items-center" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
        {props.resourceItem.statusId ? (
          <>
            {props.dataKey === 'invoices' && (
              <StatusBadge
                for={invoiceStatus}
                code={props.resourceItem.statusId}
              />
            )}
            {props.dataKey === 'payments' && (
              <StatusBadge
                for={paymentStatus}
                code={props.resourceItem.statusId}
              />
            )}
          </>
        ) : (
          <>
            {props.dataKey === 'expenses' && (
              <ExpenseStatus entity={props.resourceItem} />
            )}
          </>
        )}
      </div>
    </li>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox } from '@invoiceninja/forms';
import { StatusBadge } from 'components/StatusBadge';
import invoiceStatus from 'common/constants/invoice-status';
import { ResourceItem } from './ListBox';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';

interface Props {
  resourceItem: ResourceItem;
  isItemChecked: boolean;
  selectItem: (id: string, clientId?: string) => void;
}

export function ListBoxItem(props: Props) {
  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  return (
    <li
      key={props.resourceItem.id}
      className="flex justify-between hover:bg-gray-50 w-full cursor-pointer p-4 border-b border-gray-200"
      onClick={() =>
        props.selectItem(props.resourceItem.id, props.resourceItem.clientId)
      }
    >
      <div className="flex items-center">
        <Checkbox
          checked={props.isItemChecked}
          onClick={() => props.selectItem(props.resourceItem.id)}
        />
        <div className="flex flex-col items-center">
          <span className="text-sm">{props.resourceItem.name}</span>
          <span className="text-sm">{props.resourceItem.number}</span>
        </div>
      </div>
      <div className="flex items-center flex-grow pr-3">
        <div className="flex flex-col flex-grow pl-8 pr-3">
          <span className="text-sm">{props.resourceItem.clientName}</span>
          <span className="text-sm text-gray-600">
            {props.resourceItem.date}
          </span>
        </div>
        {props.resourceItem.amount && (
          <span className="text-sm">
            {formatMoney(
              props.resourceItem.amount,
              company.settings.country_id,
              company.settings.currency_id
            )}
          </span>
        )}
      </div>
      <div className="flex items-center">
        {props.resourceItem.statusId && (
          <StatusBadge for={invoiceStatus} code={props.resourceItem.statusId} />
        )}
      </div>
    </li>
  );
}

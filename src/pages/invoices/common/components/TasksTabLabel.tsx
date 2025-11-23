/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  lineItems: InvoiceItem[];
}

export function TasksTabLabel({ lineItems }: Props) {
  const [t] = useTranslation();

  const totalQuantity = useMemo(
    () =>
      lineItems
        .filter((item) => item.type_id === InvoiceItemType.Task)
        .reduce((acc, item) => {
          return acc + item.quantity;
        }, 0),
    [lineItems]
  );

  if (totalQuantity) {
    return (
      <div className="flex space-x-2">
        <span>{t('tasks')}</span>

        <span className="font-medium">({totalQuantity} h)</span>
      </div>
    );
  }

  return <span>{t('tasks')}</span>;
}

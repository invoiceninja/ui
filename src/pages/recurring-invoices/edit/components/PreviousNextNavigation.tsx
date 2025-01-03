/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Icon } from '$app/components/icons/Icon';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface Props {
  id: string | undefined;
}

interface QueryState {
  data: {
    data: RecurringInvoice[];
  };
}

export function PreviousNextNavigation({ id }: Props) {
  if (!id) {
    return null;
  }

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [currentData, setCurrentData] = useState<RecurringInvoice[]>([]);

  const getPreviousIndex = () => {
    const currentIndex = currentData.findIndex((invoice) => invoice.id === id);

    if (currentIndex === 0) {
      return null;
    }

    return currentIndex - 1;
  };

  const getNextIndex = () => {
    const currentIndex = currentData.findIndex((invoice) => invoice.id === id);

    if (currentIndex === currentData.length - 1) {
      return null;
    }

    return currentIndex + 1;
  };

  useEffect(() => {
    const data = queryClient
      .getQueryCache()
      .findAll({ queryKey: ['/api/v1/recurring_invoices'] })
      .filter(
        (query) =>
          (query.state.data as QueryState)?.data?.data &&
          Array.isArray((query.state.data as QueryState)?.data?.data)
      )
      .flatMap((query) => (query.state.data as QueryState)?.data?.data)
      .reduce((acc: RecurringInvoice[], invoice: RecurringInvoice) => {
        if (!acc.some((item) => item.id === invoice.id)) {
          acc.push(invoice);
        }
        return acc;
      }, [] as RecurringInvoice[])
      .sort((a, b) => a.created_at - b.created_at);

    setCurrentData(data);

    return () => setCurrentData([]);
  }, [queryClient]);

  if (
    !currentData.length ||
    (currentData.length && !currentData.find((invoice) => invoice.id === id))
  ) {
    return null;
  }

  return (
    <div className="flex items-center ml-9">
      <div
        className={classNames({
          'cursor-not-allowed opacity-50': getPreviousIndex() === null,
          'cursor-pointer': getPreviousIndex() !== null,
        })}
        onClick={() => {
          const previousIndex = getPreviousIndex();

          if (previousIndex !== null) {
            navigate(
              route('/recurring_invoices/:id/edit', {
                id: currentData[previousIndex].id,
              })
            );
          }
        }}
      >
        <Icon element={MdKeyboardArrowLeft} size={29} />
      </div>

      <div
        className={classNames({
          'cursor-not-allowed opacity-50': getNextIndex() === null,
          'cursor-pointer': getNextIndex() !== null,
        })}
        onClick={() => {
          const nextIndex = getNextIndex();

          if (nextIndex !== null) {
            navigate(
              route('/recurring_invoices/:id/edit', {
                id: currentData[nextIndex].id,
              })
            );
          }
        }}
      >
        <Icon element={MdKeyboardArrowRight} size={29} />
      </div>
    </div>
  );
}

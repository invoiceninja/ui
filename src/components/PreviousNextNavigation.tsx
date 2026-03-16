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
import { Client } from '$app/common/interfaces/client';
import { Invoice } from '$app/common/interfaces/invoice';
import { Project } from '$app/common/interfaces/project';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import classNames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { Product } from '$app/common/interfaces/product';
import { Payment } from '$app/common/interfaces/payment';
import { Quote } from '$app/common/interfaces/quote';
import { Credit } from '$app/common/interfaces/credit';
import { Task } from '$app/common/interfaces/task';
import { Vendor } from '$app/common/interfaces/vendor';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Expense } from '$app/common/interfaces/expense';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { Transaction } from '$app/common/interfaces/transactions';
import { Tooltip } from './Tooltip';
import { useTranslation } from 'react-i18next';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import styled from 'styled-components';
import { ChevronLeft } from './icons/ChevronLeft';
import { useColorScheme } from '$app/common/colors';
import { ChevronRight } from './icons/ChevronRight';
import { useAtomValue } from 'jotai';
import { fullTableLatestDataAtom } from '$app/common/atoms/data-table';
import { useMemo } from 'react';

const Button = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  border-color: ${(props) => props.theme.borderColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

type Entity =
  | 'recurring_invoice'
  | 'invoice'
  | 'project'
  | 'client'
  | 'product'
  | 'payment'
  | 'quote'
  | 'credit'
  | 'task'
  | 'vendor'
  | 'purchase_order'
  | 'expense'
  | 'recurring_expense'
  | 'transaction';

export type Resource =
  | RecurringInvoice
  | Invoice
  | Project
  | Client
  | Product
  | Payment
  | Quote
  | Credit
  | Task
  | Vendor
  | PurchaseOrder
  | Expense
  | RecurringExpense
  | Transaction;

interface Props {
  entity: Entity;
  entityEndpointName?: 'bank_transaction';
}

export function PreviousNextNavigation({ entity }: Props) {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  const [t] = useTranslation();
  const navigate = useNavigate();
  const preventNavigation = usePreventNavigation();

  const colors = useColorScheme();
  const { isEditPage } = useEntityPageIdentifier({ entity });

  const navigationData = useAtomValue(fullTableLatestDataAtom);

  const currentList = useMemo(() => {
    return navigationData?.resources as Resource[] | undefined;
  }, [navigationData]);

  const getPreviousIndex = () => {
    const currentIndex =
      currentList?.findIndex((resource) => resource.id === id) ?? -1;

    if (currentIndex <= 0) return null;

    return currentIndex - 1;
  };

  const getNextIndex = () => {
    const currentIndex =
      currentList?.findIndex((resource) => resource.id === id) ?? -1;

    if (currentIndex === -1 || currentIndex === (currentList?.length ?? 0) - 1)
      return null;

    return currentIndex + 1;
  };

  const navigateToPrevious = () => {
    const previousIndex = getPreviousIndex();

    if (previousIndex !== null && currentList) {
      navigate(
        route(`/${entity}s/:id/${isEditPage ? 'edit' : ''}`, {
          id: currentList[previousIndex].id,
        })
      );
    }
  };

  const navigateToNext = () => {
    const nextIndex = getNextIndex();

    if (nextIndex !== null && currentList) {
      navigate(
        route(`/${entity}s/:id/${isEditPage ? 'edit' : ''}`, {
          id: currentList[nextIndex].id,
        })
      );
    }
  };

  if (
    !currentList?.length ||
    currentList.length === 1 ||
    !currentList.find((resource) => resource.id === id)
  ) {
    return null;
  }

  return (
    <div className="relative flex flex-1 space-x-2 items-center justify-end">
      <Tooltip
        message={t('previous') as string}
        width="auto"
        placement="bottom"
        withoutArrow
        withoutWrapping
      >
        <Button
          className={classNames(
            'p-2 sm:p-[0.725rem] border rounded-md shadow-sm',
            {
              'cursor-not-allowed opacity-50': getPreviousIndex() === null,
              'cursor-pointer': getPreviousIndex() !== null,
            }
          )}
          onClick={() => {
            preventNavigation({
              fn: () => navigateToPrevious(),
            });
          }}
          theme={{
            hoverColor: colors.$4,
            backgroundColor: colors.$1,
            borderColor: colors.$24,
          }}
        >
          <ChevronLeft size="0.9rem" color={colors.$3} />
        </Button>
      </Tooltip>

      <Tooltip
        message={t('next') as string}
        width="auto"
        placement="bottom"
        withoutArrow
        withoutWrapping
      >
        <Button
          className={classNames(
            'p-2 sm:p-[0.725rem] border rounded-md shadow-sm',
            {
              'cursor-not-allowed opacity-50': getNextIndex() === null,
              'cursor-pointer': getNextIndex() !== null,
            }
          )}
          onClick={() => {
            preventNavigation({
              fn: () => navigateToNext(),
            });
          }}
          theme={{
            hoverColor: colors.$4,
            backgroundColor: colors.$1,
            borderColor: colors.$24,
          }}
        >
          <ChevronRight size="0.9rem" color={colors.$3} />
        </Button>
      </Tooltip>
    </div>
  );
}

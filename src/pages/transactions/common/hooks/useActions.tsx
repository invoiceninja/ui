/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankLineItem } from '$app/common/constants/blank-line-item';
import { EntityState } from '$app/common/enums/entity-state';
import { ApiTransactionType } from '$app/common/enums/transactions';
import { getEntityState } from '$app/common/helpers';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { Transaction } from '$app/common/interfaces/transactions';
import { useBlankInvoiceQuery } from '$app/common/queries/invoices';
import { useBulk } from '$app/common/queries/transactions';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { useSetAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdControlPointDuplicate,
  MdDelete,
  MdLinkOff,
  MdRestore,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulk();
  const navigate = useNavigate();

  const { isEditPage } = useEntityPageIdentifier({ entity: 'transaction' });

  const { data: blankInvoice } = useBlankInvoiceQuery();

  const setInvoice = useSetAtom(invoiceAtom);

  const handleCreateInvoice = (transaction: Transaction) => {
    if (!blankInvoice) return;

    setInvoice(
      cloneDeep({
        ...blankInvoice,
        line_items: [
          {
            ...blankLineItem(),
            notes: transaction.description,
            cost: transaction.amount,
            product_key: transaction.date,
            quantity: 1,
          },
        ],
      })
    );

    navigate('/invoices/create?action=invoice_transaction');
  };

  const actions: Action<Transaction>[] = [
    (transaction) =>
      transaction.base_type === ApiTransactionType.Credit && (
        <DropdownElement
          onClick={() => handleCreateInvoice(transaction)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('create_invoice')}
        </DropdownElement>
      ),
    (transaction) =>
      transaction.payment_id && (
        <DropdownElement
          onClick={() => bulk([transaction.id], 'unlink')}
          icon={<Icon element={MdLinkOff} />}
        >
          {t('unlink')}
        </DropdownElement>
      ),

    (transaction) =>
      Boolean(
        (transaction.payment_id ||
          transaction.base_type === ApiTransactionType.Credit) &&
          isEditPage
      ) && <Divider withoutPadding />,
    (transaction) =>
      getEntityState(transaction) === EntityState.Active &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([transaction.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (transaction) =>
      (getEntityState(transaction) === EntityState.Archived ||
        getEntityState(transaction) === EntityState.Deleted) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([transaction.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (transaction) =>
      (getEntityState(transaction) === EntityState.Active ||
        getEntityState(transaction) === EntityState.Archived) &&
      isEditPage && (
        <DropdownElement
          onClick={() => bulk([transaction.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

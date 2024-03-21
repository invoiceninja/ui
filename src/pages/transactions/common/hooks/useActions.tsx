/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { getEntityState } from '$app/common/helpers';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';
import { Transaction } from '$app/common/interfaces/transactions';
import { useBulk } from '$app/common/queries/transactions';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdLinkOff, MdRestore } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();
  const bulk = useBulk();

  const { isEditPage } = useEntityPageIdentifier({ entity: 'transaction' });

  const actions: Action<Transaction>[] = [
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
      Boolean(transaction.payment_id && isEditPage) && (
        <Divider withoutPadding />
      ),
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

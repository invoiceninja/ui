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
import { Subscription } from '$app/common/interfaces/subscription';
import { useBulkAction } from '$app/common/queries/subscriptions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions: Action<Subscription>[] = [
    (subscription) =>
      getEntityState(subscription) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([subscription.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (subscription) =>
      (getEntityState(subscription) === EntityState.Archived ||
        getEntityState(subscription) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([subscription.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (subscription) =>
      (getEntityState(subscription) === EntityState.Active ||
        getEntityState(subscription) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([subscription.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

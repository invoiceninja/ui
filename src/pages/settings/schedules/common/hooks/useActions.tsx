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
import { Schedule } from '$app/common/interfaces/schedule';
import { useBulkAction } from '$app/common/queries/schedules';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions: Action<Schedule>[] = [
    (taskSchedule) =>
      getEntityState(taskSchedule) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([taskSchedule.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (taskSchedule) =>
      (getEntityState(taskSchedule) === EntityState.Archived ||
        getEntityState(taskSchedule) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([taskSchedule.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (taskSchedule) =>
      (getEntityState(taskSchedule) === EntityState.Active ||
        getEntityState(taskSchedule) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([taskSchedule.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

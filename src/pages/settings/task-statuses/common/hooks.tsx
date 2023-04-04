/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { useBulkAction } from '$app/common/queries/task-statuses';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setTaskStatus: Dispatch<SetStateAction<TaskStatus | undefined>>;
}

export function useHandleChange(params: Params) {
  return (property: keyof TaskStatus, value: TaskStatus[keyof TaskStatus]) => {
    params.setErrors(undefined);

    params.setTaskStatus(
      (taskStatus) => taskStatus && { ...taskStatus, [property]: value }
    );
  };
}

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions: Action<TaskStatus>[] = [
    (taskStatus) =>
      taskStatus.archived_at === 0 && (
        <DropdownElement
          onClick={() => bulk(taskStatus.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (taskStatus) =>
      taskStatus.archived_at > 0 && (
        <DropdownElement
          onClick={() => bulk(taskStatus.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (taskStatus) =>
      !taskStatus.is_deleted && (
        <DropdownElement
          onClick={() => bulk(taskStatus.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

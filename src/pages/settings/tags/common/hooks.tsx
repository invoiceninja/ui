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
import { Tag } from '$app/common/interfaces/tag';
import { useBulkAction } from '$app/common/queries/tags';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setTag: Dispatch<SetStateAction<Tag | undefined>>;
}

export function useHandleChange(params: Params) {
  return (property: keyof Tag, value: Tag[keyof Tag]) => {
    params.setErrors(undefined);

    params.setTag((tag) => tag && { ...tag, [property]: value });
  };
}

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions: Action<Tag>[] = [
    (tag) =>
      tag.archived_at === 0 && (
        <DropdownElement
          onClick={() => bulk(tag.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (tag) =>
      tag.archived_at > 0 && (
        <DropdownElement
          onClick={() => bulk(tag.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (tag) =>
      !tag.is_deleted && (
        <DropdownElement
          onClick={() => bulk(tag.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

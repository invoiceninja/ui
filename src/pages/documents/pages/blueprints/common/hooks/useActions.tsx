/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useBulk } from '$app/common/queries/docuninja/blueprints';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulk();

  const actions: Action<Blueprint>[] = [
    (blueprint) =>
      !blueprint?.archived_at && (
        <DropdownElement
          onClick={() => bulk([blueprint.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (blueprint) =>
      Boolean(blueprint?.archived_at || blueprint?.is_deleted) && (
        <DropdownElement
          onClick={() => bulk([blueprint.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (blueprint) =>
      !blueprint?.is_deleted && (
        <DropdownElement
          onClick={() => bulk([blueprint.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

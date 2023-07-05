/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { getEntityState } from '$app/common/helpers';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { EntityState } from '$app/common/enums/entity-state';
import { useBulkAction } from '$app/common/queries/vendor';
import { Vendor } from '$app/common/interfaces/vendor';
import { useEntityPageIdentifier } from '$app/common/hooks/useEntityPageIdentifier';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const { isEditOrShowPage } = useEntityPageIdentifier({
    entity: 'vendor',
  });

  const actions: Action<Vendor>[] = [
    (vendor) =>
      isEditOrShowPage &&
      getEntityState(vendor) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk(vendor.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (vendor) =>
      isEditOrShowPage &&
      (getEntityState(vendor) === EntityState.Archived ||
        getEntityState(vendor) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk(vendor.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (vendor) =>
      isEditOrShowPage &&
      (getEntityState(vendor) === EntityState.Active ||
        getEntityState(vendor) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk(vendor.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

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
import { Design } from '$app/common/interfaces/design';
import { useBulkAction } from '$app/common/queries/invoice-design';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions: Action<Design>[] = [
    (invoiceDesign) =>
      getEntityState(invoiceDesign) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([invoiceDesign.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (invoiceDesign) =>
      (getEntityState(invoiceDesign) === EntityState.Archived ||
        getEntityState(invoiceDesign) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([invoiceDesign.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (invoiceDesign) =>
      (getEntityState(invoiceDesign) === EntityState.Active ||
        getEntityState(invoiceDesign) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([invoiceDesign.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

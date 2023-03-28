/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useBulkAction } from '$app/common/queries/tax-rates';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions: Action<TaxRate>[] = [
    (taxRate) =>
      taxRate.archived_at === 0 && (
        <DropdownElement
          onClick={() => bulk(taxRate.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (taxRate) =>
      taxRate.archived_at > 0 && (
        <DropdownElement
          onClick={() => bulk(taxRate.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (taxRate) =>
      !taxRate.is_deleted && (
        <DropdownElement
          onClick={() => bulk(taxRate.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}

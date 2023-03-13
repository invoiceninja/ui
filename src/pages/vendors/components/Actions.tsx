/**
 * vendor Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Vendor } from '$app/common/interfaces/vendor';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useBulk } from '../common/hooks/useBulk';

interface Props {
  vendor: Vendor;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  const { vendor } = props;

  const bulk = useBulk();

  return (
    <Dropdown label={t('more_actions')}>
      {vendor.archived_at === 0 && (
        <DropdownElement
          onClick={() => bulk([vendor.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      )}

      {vendor.archived_at > 0 && (
        <DropdownElement
          onClick={() => bulk([vendor.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      )}

      {!vendor.is_deleted && (
        <DropdownElement
          onClick={() => bulk([vendor.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      )}
    </Dropdown>
  );
}

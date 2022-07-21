/**
 * vendor Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { Vendor } from 'common/interfaces/vendor';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useTranslation } from 'react-i18next';
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
        <DropdownElement onClick={() => bulk([vendor.id], 'archive')}>
          {t('archive')}
        </DropdownElement>
      )}

      {vendor.archived_at > 0 && (
        <DropdownElement onClick={() => bulk([vendor.id], 'restore')}>
          {t('restore')}
        </DropdownElement>
      )}

      {!vendor.is_deleted && (
        <DropdownElement onClick={() => bulk([vendor.id], 'delete')}>
          {t('delete')}
        </DropdownElement>
      )}
    </Dropdown>
  );
}

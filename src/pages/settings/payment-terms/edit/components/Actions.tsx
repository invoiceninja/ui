/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useHandleArchive } from '../hooks/useHandleArchive';
import { useHandleDelete } from '../hooks/useHandleDelete';
import { useHandleRestore } from '../hooks/useHandleRestore';

interface Props {
  paymentTerm: PaymentTerm;
}

export function Actions(props: Props) {
  const [t] = useTranslation();

  const archive = useHandleArchive();
  const restore = useHandleRestore();
  const destroy = useHandleDelete();

  return (
    <Dropdown label={t('more_actions')}>
      {!props.paymentTerm.archived_at && !props.paymentTerm.is_deleted && (
        <DropdownElement
          onClick={() => archive(props.paymentTerm.id)}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      )}

      {(props.paymentTerm.archived_at || props.paymentTerm.is_deleted) && (
        <DropdownElement
          onClick={() => restore(props.paymentTerm.id)}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      )}

      {!props.paymentTerm.is_deleted && (
        <DropdownElement
          onClick={() => destroy(props.paymentTerm.id)}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      )}
    </Dropdown>
  );
}

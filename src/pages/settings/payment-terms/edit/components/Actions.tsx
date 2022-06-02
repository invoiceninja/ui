/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentTerm } from 'common/interfaces/payment-term';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useTranslation } from 'react-i18next';
import { useHandleArchive } from '../hooks/useHandleArchive';
import { useHandleRestore } from '../hooks/useHandleRestore';

interface Props {
  paymentTerm: PaymentTerm;
}

export function Actions(props: Props) {
  const [t] = useTranslation();

  const archive = useHandleArchive();
  const restore = useHandleRestore();

  return (
    <Dropdown label={t('more_actions')}>
      {!props.paymentTerm.archived_at && !props.paymentTerm.is_deleted && (
        <DropdownElement onClick={() => archive(props.paymentTerm.id)}>
          {t('archive')}
        </DropdownElement>
      )}

      {(props.paymentTerm.archived_at || props.paymentTerm.is_deleted) && (
        <DropdownElement onClick={() => restore(props.paymentTerm.id)}>
          {t('restore')}
        </DropdownElement>
      )}

      {!props.paymentTerm.is_deleted && (
        <DropdownElement>{t('delete')}</DropdownElement>
      )}
    </Dropdown>
  );
}

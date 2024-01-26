/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Transaction } from '$app/common/interfaces/transactions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAddCircle } from 'react-icons/md';

interface Props {
  transactions: Transaction[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}

export function CreateExpenseBulkAction(props: Props) {
  const [t] = useTranslation();

  const { setSelected } = props;

  return (
    <DropdownElement
      onClick={() => {
        setSelected([]);
      }}
      icon={<Icon element={MdAddCircle} />}
    >
      {t('create_expense')}
    </DropdownElement>
  );
}

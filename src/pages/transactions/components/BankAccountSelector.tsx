/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { BankAccount } from 'common/interfaces/bank-accounts';
import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateBankAccountModal } from './CreateBankAccountModal';

export function BankAccountSelector(props: GenericSelectorProps<BankAccount>) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreateBankAccountModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <DebouncedCombobox
        {...props}
        endpoint="/api/v1/bank_integrations"
        label="bank_account_name"
        onChange={(value: Record<BankAccount>) =>
          value.resource && props.onChange(value.resource)
        }
        actionLabel={t('new_bank_account')}
        onActionClick={() => setIsModalOpen(true)}
        clearButton
      />
    </>
  );
}

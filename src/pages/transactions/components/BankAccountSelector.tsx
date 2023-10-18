/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateBankAccountModal } from './CreateBankAccountModal';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import { endpoint } from '$app/common/helpers';

export interface BankAccountSelectorProps
  extends GenericSelectorProps<BankAccount> {
  staleTime?: number;
}

export function BankAccountSelector(props: BankAccountSelectorProps) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreateBankAccountModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onCreatedBankAccount={(bankAccount) => props.onChange(bankAccount)}
      />

      <ComboboxAsync<BankAccount>
        endpoint={endpoint('/api/v1/bank_integrations?status=active')}
        onChange={(bankAccount: Entry<BankAccount>) =>
          bankAccount.resource && props.onChange(bankAccount.resource)
        }
        inputOptions={{
          label: props.inputLabel?.toString(),
          value: props.value || null,
        }}
        entryOptions={{
          id: 'id',
          label: 'bank_account_name',
          value: 'id',
        }}
        action={{
          label: t('new_bank_account'),
          onClick: () => setIsModalOpen(true),
          visible: true,
        }}
        readonly={props.readonly}
        onDismiss={props.onClearButtonClick}
        sortBy="bank_account_name|desc"
        staleTime={props.staleTime}
        errorMessage={props.errorMessage}
      />
    </>
  );
}

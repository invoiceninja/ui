/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';

import { ClientCreate } from '$app/pages/invoices/common/components/ClientCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { ErrorMessage } from '../ErrorMessage';
import { ClientContact } from '$app/common/interfaces/client-contact';

export interface ClientSelectorProps extends GenericSelectorProps<Client> {
  initiallyVisible?: boolean;
  withoutAction?: boolean;
  exclude?: (string | number)[];
  staleTime?: number;
  disableWithSpinner?: boolean;
  clearInputAfterSelection?: boolean;
  dropdownLabelFn?: (client: Client) => string | JSX.Element;
}

export function ClientSelector(props: ClientSelectorProps) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasPermission = useHasPermission();

  const { dropdownLabelFn } = props;

  return (
    <>
      <ClientCreate
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onClientCreated={(client) => props.onChange(client)}
      />

      <ComboboxAsync<Client>
        inputOptions={{
          label: props.inputLabel?.toString(),
          value: props.value || null,
        }}
        endpoint={endpoint('/api/v1/clients')}
        readonly={props.readonly}
        onDismiss={props.onClearButtonClick}
        querySpecificEntry="/api/v1/clients/:id"
        initiallyVisible={props.initiallyVisible}
        entryOptions={{
          id: 'id',
          label: 'display_name',
          value: 'id',
          customSearchableValue: (client) => {
            const contactFields = ['first_name', 'last_name', 'email', 'phone']
              .map((field) =>
                client.contacts
                  .map((c) => c[field as keyof ClientContact])
                  .join(',')
              )
              .filter(Boolean);

            const clientFields = [
              client.id_number,
              client.number,
              client.custom_value1,
              client.custom_value2,
              client.custom_value3,
              client.custom_value4,
            ].filter(Boolean);

            return [...contactFields, ...clientFields].join(',');
          },
          dropdownLabelFn,
        }}
        onChange={(value) => value.resource && props.onChange(value.resource)}
        staleTime={props.staleTime || Infinity}
        sortBy="display_name|asc"
        exclude={props.exclude}
        action={{
          label: t('new_client'),
          visible:
            props.withoutAction || !hasPermission('create_client')
              ? false
              : true,
          onClick: () => setIsModalOpen(true),
        }}
        key="client_selector"
        clearInputAfterSelection={props.clearInputAfterSelection}
      />

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </>
  );
}

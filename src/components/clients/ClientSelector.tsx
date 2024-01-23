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
import { Alert } from '../Alert';
import { endpoint } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

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
          customSearchableValue: (client) =>
            client.contacts.map(({ email }) => email).join(','),
          dropdownLabelFn,
        }}
        onChange={(value) => value.resource && props.onChange(value.resource)}
        staleTime={props.staleTime || Infinity}
        sortBy={null}
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

      {props.errorMessage && (
        <Alert className="mt-2" type="danger">
          {props.errorMessage}
        </Alert>
      )}
    </>
  );
}

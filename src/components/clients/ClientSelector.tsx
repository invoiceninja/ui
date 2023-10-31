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
import {
  Permissions,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useLocation } from 'react-router-dom';

export interface ClientSelectorProps extends GenericSelectorProps<Client> {
  initiallyVisible?: boolean;
  withoutAction?: boolean;
  exclude?: (string | number)[];
  staleTime?: number;
  disableWithSpinner?: boolean;
  clearInputAfterSelection?: boolean;
}

export const REQUIRED_PERMISSIONS = [
  {
    page: 'invoices',
    permission: 'create_invoice',
  },
  {
    page: 'payments',
    permission: 'create_payment',
  },
  {
    page: 'recurring_invoices',
    permission: 'create_recurring_invoice',
  },
  {
    page: 'quotes',
    permission: 'create_quote',
  },
  {
    page: 'credits',
    permission: 'create_credit',
  },
  {
    page: 'projects',
    permission: 'create_project',
  },
  {
    page: 'tasks',
    permission: 'create_task',
  },
  {
    page: 'expenses',
    permission: 'create_expense',
  },
  {
    page: 'recurring_expenses',
    permission: 'create_recurring_expense',
  },
];

export function ClientSelector(props: ClientSelectorProps) {
  const [t] = useTranslation();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasPermission = useHasPermission();

  const disableByPermission = () => {
    const permission = REQUIRED_PERMISSIONS.find(({ page }) =>
      location.pathname.startsWith(`/${page}`)
    )?.permission;

    return Boolean(permission) && !hasPermission(permission as Permissions);
  };

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
        readonly={props.readonly || disableByPermission()}
        onDismiss={props.onClearButtonClick}
        querySpecificEntry="/api/v1/clients/:id"
        initiallyVisible={props.initiallyVisible}
        entryOptions={{ id: 'id', label: 'display_name', value: 'id' }}
        onChange={(value) => value.resource && props.onChange(value.resource)}
        staleTime={props.staleTime || 500}
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

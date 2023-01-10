/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from 'common/interfaces/client';
import { GenericSelectorProps } from 'common/interfaces/generic-selector-props';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { ClientCreate } from 'pages/invoices/common/components/ClientCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ClientSelectorProps extends GenericSelectorProps<Client> {
  initiallyVisible?: boolean;
  withoutAction?: boolean;
}

export function ClientSelector(props: ClientSelectorProps) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ClientCreate
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onClientCreated={(client) => props.onChange(client)}
      />

      <DebouncedCombobox
        inputLabel={props.inputLabel}
        endpoint="/api/v1/clients"
        label="display_name"
        onChange={(value: Record<Client>) =>
          value.resource && props.onChange(value.resource)
        }
        defaultValue={props.value}
        disabled={props.readonly}
        clearButton={props.clearButton}
        onClearButtonClick={props.onClearButtonClick}
        queryAdditional
        initiallyVisible={props.initiallyVisible}
        actionLabel={props.withoutAction ? '' : t('new_client')}
        onActionClick={() => setIsModalOpen(true)}
        sortBy="display_name|asc"
        staleTime={500}
      />
    </>
  );
}

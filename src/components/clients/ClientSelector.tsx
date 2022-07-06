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
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { ClientCreate } from 'pages/invoices/common/components/ClientCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: string | undefined;
  readonly?: boolean;
  clearButton?: boolean;
  onChange: (client: Client) => unknown;
  onClearButtonClick?: () => unknown;
}

export function ClientSelector(props: Props) {
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
        inputLabel={t('client')}
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
        initiallyVisible={Boolean(!props.value)}
        actionLabel={t('create_new_client')}
        onActionClick={() => setIsModalOpen(true)}
      />
    </>
  );
}

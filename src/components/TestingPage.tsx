/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { ComboboxAsync } from './forms/Combobox';
import { useState } from 'react';
import { endpoint } from '$app/common/helpers';
import { Client } from '$app/common/interfaces/client';
import { ClientCreate } from '$app/pages/invoices/common/components/ClientCreate';

export function TestingPage() {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [value, setValue] = useState<string>('');

  return (
    <div className="flex items-center w-full h-full justify-center">
      <div className="mt-96">
        <ClientCreate
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onClientCreated={(client) => setValue(client.id)}
        />

        <ComboboxAsync<Client>
          inputOptions={{
            value: value ?? null,
          }}
          endpoint={endpoint('/api/v1/clients?status=active')}
          entryOptions={{ id: 'id', label: 'name', value: 'id' }}
          onChange={(entry) => entry.resource && setValue(entry.resource.id)}
          onDismiss={() => setValue('')}
          action={{
            label: t('new_client'),
            onClick: () => setIsModalOpen(true),
            visible: true,
          }}
        />
      </div>
    </div>
  );
}

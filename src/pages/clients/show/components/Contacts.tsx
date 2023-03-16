/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Client } from '$app/common/interfaces/client';
import { ClientContact } from '$app/common/interfaces/client-contact';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from '$app/components/CopyToClipboard';

interface Props {
  client: Client;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();

  const accentColor = useAccentColor();

  const { client } = props;

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('contacts')}
            value={
              <div className="space-y-2">
                {client.contacts.map(
                  (contact: ClientContact, index: number) => (
                    <div key={index}>
                      <p
                        className="font-semibold"
                        style={{ color: accentColor }}
                      >
                        {contact.first_name} {contact.last_name}
                      </p>

                      <CopyToClipboard text={contact.email} />
                    </div>
                  )
                )}
              </div>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}

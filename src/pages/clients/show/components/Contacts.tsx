/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';
import { ClientContact } from 'common/interfaces/client-contact';
import { useClientQuery } from 'common/queries/clients';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Contacts() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });
  const accentColor = useAccentColor();

  return (
    <>
      {client && (
        <div className="col-span-12 lg:col-span-3">
          <InfoCard
            title={t('contacts')}
            value={
              <div className="space-y-2">
                {client.data.data.contacts.map(
                  (contact: ClientContact, index: number) => (
                    <div key={index}>
                      <p
                        className="font-semibold"
                        style={{ color: accentColor }}
                      >
                        {contact.first_name} {contact.last_name}
                      </p>

                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
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

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';
import useCopyToClipboard from 'common/hooks/useCopyToClipboard';
import { ClientContact } from 'common/interfaces/client-contact';
import { useClientQuery } from 'common/queries/clients';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Clipboard } from 'react-feather';
import { ChangeEvent } from 'react';
import React from 'react';

export function Contacts() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });
  const accentColor = useAccentColor();
  const [value, copy] = useCopyToClipboard()

  const[open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  }

  const handleClipboardCopy = async (value :string, event: ChangeEvent<HTMLInputElement>) => {

      setOpen(true);

      setTimeout(() => {
      
        handleClose();

      }, 1000)

    console.log(value);
  }

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
                      <Clipboard size={12} className="mx-0" onClick={(event: ChangeEvent<HTMLInputElement>) => handleClipboardCopy(contact.email, event)}/>
   
                        <span>{open ? 'Copied!' : ''}</span>

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


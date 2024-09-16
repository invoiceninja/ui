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
import { UserUnsubscribedTooltip } from '../../common/components/UserUnsubscribedTooltip';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { Icon } from '$app/components/icons/Icon';
import { MdMoreVert } from 'react-icons/md';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { ExternalLink } from 'react-feather';
import { route } from '$app/common/helpers/route';

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
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <InfoCard
            title={
              <div className="flex items-center justify-between">
                <span className="text-xl font-medium">{t('contacts')}</span>

                <Dropdown
                  customLabelButton={
                    <div className="cursor-pointer">
                      <Icon element={MdMoreVert} size={28} />
                    </div>
                  }
                  minDropdownElementWidth="9rem"
                  maxDropdownElementWidth="9rem"
                >
                  <DropdownElement
                    onClick={() =>
                      window.open(
                        route(
                          `${client.contacts[0].link}?silent=true&client_hash=:clientHash`,
                          {
                            clientHash: client.client_hash,
                          }
                        ),
                        '__blank'
                      )
                    }
                    icon={<Icon className="w-5 h-5" element={ExternalLink} />}
                  >
                    {t('view_portal')}
                  </DropdownElement>
                </Dropdown>
              </div>
            }
            value={
              <div className="space-y-2">
                {client.contacts.map(
                  (contact: ClientContact, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: accentColor }}
                        >
                          {contact.first_name} {contact.last_name}
                        </p>

                        <p>{contact.phone}</p>

                        <CopyToClipboard text={contact.email} />
                      </div>

                      {contact.is_locked && <UserUnsubscribedTooltip />}
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

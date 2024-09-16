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
import { UserUnsubscribedTooltip } from '../../common/components/UserUnsubscribedTooltip';
import { Tooltip } from '$app/components/Tooltip';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { Icon } from '$app/components/icons/Icon';
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
            title={t('contacts')}
            value={
              <div className="space-y-2">
                {client.contacts.map(
                  (contact: ClientContact, index: number) =>
                    Boolean(
                      contact.first_name ||
                        contact.last_name ||
                        contact.phone ||
                        contact.email
                    ) && (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center space-x-6">
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: accentColor }}
                            >
                              {contact.first_name} {contact.last_name}
                            </p>

                            <p>{contact.phone}</p>

                            {Boolean(contact.email) && (
                              <div className="flex space-x-1">
                                <span>{contact.email}</span>

                                <Tooltip
                                  message={t('copy_email') as string}
                                  placement="top"
                                  width="auto"
                                >
                                  <div className="mt-0.5">
                                    <CopyToClipboardIconOnly
                                      text={contact.email}
                                    />
                                  </div>
                                </Tooltip>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                window.open(
                                  route(
                                    `${client.contacts[index]?.link}?silent=true&client_hash=:clientHash`,
                                    {
                                      clientHash: client.client_hash,
                                    }
                                  ),
                                  '__blank'
                                )
                              }
                            >
                              <Icon
                                className="h-5 w-5"
                                element={ExternalLink}
                              />
                            </div>

                            <Tooltip
                              message={t('copy_link') as string}
                              placement="top"
                              width="auto"
                              centerVertically
                            >
                              <CopyToClipboardIconOnly
                                text={route(
                                  `${client.contacts[index]?.link}?silent=true&client_hash=:clientHash`,
                                  {
                                    clientHash: client.client_hash,
                                  }
                                )}
                                iconColor={accentColor}
                                iconSize={20}
                              />
                            </Tooltip>
                          </div>
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

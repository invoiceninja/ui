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
import { route } from '$app/common/helpers/route';
import { Link } from '$app/components/forms';

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
                        <div className="flex flex-col space-y-1">
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

                              <CopyToClipboardIconOnly text={contact.email} />
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Link
                              className="cursor-pointer"
                              to={route(
                                `${client.contacts[index]?.link}?silent=true&client_hash=:clientHash`,
                                {
                                  clientHash: client.client_hash,
                                }
                              )}
                              external
                            >
                              {t('client_portal')}
                            </Link>

                            <Tooltip
                              message={t('copy_link') as string}
                              placement="top"
                              width="auto"
                              centerVertically
                            >
                              <CopyToClipboardIconOnly
                                text={route(
                                  `${client.contacts[index]?.link}?silent=true`
                                )}
                                iconColor={accentColor}
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

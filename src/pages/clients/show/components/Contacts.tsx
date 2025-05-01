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
import { ClientContact } from '$app/common/interfaces/client-contact';
import { useTranslation } from 'react-i18next';
import { UserUnsubscribedTooltip } from '../../common/components/UserUnsubscribedTooltip';
import { Tooltip } from '$app/components/Tooltip';
import { CopyToClipboardIconOnly } from '$app/components/CopyToClipBoardIconOnly';
import { route } from '$app/common/helpers/route';
import { Link } from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import { InfoCard } from '$app/components/InfoCard';

interface Props {
  client: Client;
}

export function Contacts(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { client } = props;

  return (
    <>
      {client && (
        <InfoCard
          title={t('contacts')}
          className="col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3 shadow-sm h-full 2xl:h-max"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col h-44 w-full overflow-y-auto">
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
                    className="flex justify-between items-center first:pt-2 py-4 border-b border-dashed"
                    style={{ borderColor: colors.$21 }}
                  >
                    <div className="flex flex-col space-y-1 text-sm">
                      {Boolean(contact.first_name || contact.last_name) && (
                        <span
                          className="font-medium"
                          style={{ color: colors.$3 }}
                        >
                          {contact.first_name} {contact.last_name}
                        </span>
                      )}

                      {Boolean(contact.phone) && (
                        <span
                          className="font-medium"
                          style={{ color: colors.$22 }}
                        >
                          {contact.phone}
                        </span>
                      )}

                      {Boolean(contact.email) && (
                        <div className="flex space-x-2">
                          <span
                            className="font-medium"
                            style={{ color: colors.$22 }}
                          >
                            {contact.email}
                          </span>

                          <Tooltip
                            message={t('copy') as string}
                            placement="top"
                            width="auto"
                            centerVertically
                          >
                            <CopyToClipboardIconOnly text={contact.email} />
                          </Tooltip>
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
                          withoutExternalIcon
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
                          />
                        </Tooltip>
                      </div>
                    </div>

                    {contact.is_locked && <UserUnsubscribedTooltip />}
                  </div>
                )
            )}
          </div>
        </InfoCard>
      )}
    </>
  );
}

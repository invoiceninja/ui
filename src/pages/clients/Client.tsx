/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { useClientQuery } from 'common/queries/clients';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Spinner } from 'components/Spinner';
import { InfoCard } from 'components/InfoCard';
import { Tabs } from 'components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';
import { Tab } from 'components/Tabs';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { ClientContact } from 'common/interfaces/client-contact';

export function Client() {
  const { documentTitle, setDocumentTitle } = useTitle('view_client');

  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client, isLoading } = useClientQuery({ id });
  const accentColor = useAccentColor();

  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'view_client');
  }, [client]);

  const pages: BreadcrumRecord[] = [
    { name: t('clients'), href: '/clients' },
    {
      name: documentTitle,
      href: generatePath('/clients/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    { name: t('invoices'), href: generatePath('/clients/:id', { id }) },
    { name: t('quotes'), href: generatePath('/clients/:id/quotes', { id }) },
    { name: t('payments'), href: generatePath('/clients/:id/payments', { id }) },
  ];

  console.log(client);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <Button to={generatePath('/clients/:id/edit', { id })}>
          {t('edit_client')}
        </Button>
      }
    >
      {isLoading && <Spinner />}

      {client && (
        <>
          <div className="grid grid-cols-12 space-y-4 lg:space-y-0 lg:gap-4">
            <div className="col-span-12 lg:col-span-3">
              <InfoCard
                title={t('details')}
                value={
                  <>
                    <Link to={client.data.data.website} external>
                      {client.data.data.website}
                    </Link>
                  </>
                }
                className="h-full"
              />
            </div>

            <div className="col-span-12 lg:col-span-3">
              <InfoCard
                title={t('address')}
                value={
                  <>
                    <p>
                      {client.data.data.address1}, {client.data.data.address2}
                    </p>

                    <p>
                      {client.data.data.city}, {client.data.data.state}
                    </p>
                  </>
                }
                className="h-full"
              />
            </div>

            <div className="col-span-12 lg:col-span-3">
              <InfoCard
                title={t('contacts')}
                value={
                  <div className="space-y-2">
                    {client.data.data.contacts.map((contact: ClientContact) => (
                      <div key={contact.id}>
                        <p
                          className="font-semibold"
                          style={{ color: accentColor }}
                        >
                          {contact.first_name} {contact.last_name}
                        </p>

                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </div>
                    ))}
                  </div>
                }
                className="h-full"
              />
            </div>

            <div className="col-span-12 lg:col-span-3">
              <InfoCard
                title={t('standing')}
                value={
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{t('paid_to_date')}</p>
                      <span>{client.data.data.paid_to_date}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{t('balance')}</p>
                      <span>{client.data.data.balance}</span>
                    </div>
                  </div>
                }
                className="h-full"
              />
            </div>
          </div>

          <Tabs tabs={tabs} className="mt-6" />

          <div className="my-4">
            <Outlet />
          </div>
        </>
      )}
    </Default>
  );
}

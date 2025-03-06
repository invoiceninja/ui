/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Client } from '$app/common/interfaces/client';

interface Props {
  client: Client | undefined;
}

export function useTabs({ client }: Props) {
  const [t] = useTranslation();

  const { id } = useParams();

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/clients/:id/edit', { id }),
    },
    {
      name: t('settings'),
      href: route('/clients/:id/settings', { id }),
    },
    {
      name: t('documents'),
      href: route('/clients/:id/documents', { id }),
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={client?.documents.length} />
      ),
    },
    {
      name: t('locations'),
      href: route('/clients/:id/locations', { id }),
      formatName: () => (
        <div className="flex space-x-1">
          <span>{t('locations')}</span>
          {Boolean(client?.locations.length) && (
            <span className="font-bold">({client?.locations.length})</span>
          )}
        </div>
      ),
    },
  ];

  return tabs;
}

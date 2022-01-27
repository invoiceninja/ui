/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Breadcrumbs } from 'components/Breadcrumbs';
import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import { Upload, Table as DocumentsTable } from '../../components';
import {
  Upload,
  Table as DocumentsTable,
} from 'pages/settings/company/documents/components';
<<<<<<< HEAD
import { Documents } from 'pages/settings/company/components';
import { generatePath, useParams } from 'react-router-dom';
import { Tabs, Tab } from 'components/Tabs';
import { Default } from 'components/layouts/Default';
import { Container } from 'components/Container';
=======
import { generatePath, useParams } from 'react-router-dom';
import { Tabs, Tab } from 'components/Tabs';
>>>>>>> 2663b41fcaf83d32c09dc7ce1505c17047db7614
export function ProductDocs() {
  const [t] = useTranslation();
  const { id } = useParams();

  //   Tabs
  const tabs: Tab[] = [
    { name: t('overview'), href: generatePath('/products/:id', { id }) },

    {
      name: t('document'),
      href: generatePath('/products/:id/documents', { id }),
    },
  ];

  const pages = [
    { name: t('products'), href: '/products' },
    {
      name: t('product'),
      href: generatePath('/products/:id', { id }),
    },
  ];

  return (
    <Default>
      <Container>
        <Breadcrumbs pages={pages} />
        <Tabs tabs={tabs} className="mt-6" />

        <Upload />
        <DocumentsTable />
      </Container>
    </Default>
  );
}

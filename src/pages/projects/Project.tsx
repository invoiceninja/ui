/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';

export function Project() {
  const { documentTitle } = useTitle('project');
  const { id } = useParams();

  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [
    { name: t('projects'), href: '/projects' },
    {
      name: documentTitle,
      href: generatePath('/projects/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: generatePath('/projects/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: generatePath('/projects/:id/documents', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <Container>
        <Tabs tabs={tabs} />

        <Outlet />
      </Container>
    </Default>
  );
}

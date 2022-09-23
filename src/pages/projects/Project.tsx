/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { useProjectQuery } from 'common/queries/projects';
import { Page } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

export function Project() {
  const { documentTitle, setDocumentTitle } = useTitle('project');
  const { id } = useParams();
  const { data } = useProjectQuery({ id });

  const [t] = useTranslation();

  useEffect(() => {
    data?.name && setDocumentTitle(data.name);
  }, [data]);

  const pages: Page[] = [
    { name: t('projects'), href: '/projects' },
    {
      name: documentTitle,
      href: route('/projects/:id', { id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/projects/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/projects/:id/documents', { id }),
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

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
import { Page } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';

export function Payment() {
  const { id } = useParams();
  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('payments'), href: '/payments' },
    {
      name: t('edit_payment'),
      href: route('/payments/:id/edit', { id: id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/payments/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/payments/:id/documents', { id }),
    },
    {
      name: t('custom_fields'),
      href: route('/payments/:id/payment_fields', { id }),
    },
  ];

  return (
    <Default title={t('payment')} breadcrumbs={pages}>
      <Container>
        <Tabs tabs={tabs} />

        <Outlet />
      </Container>
    </Default>
  );
}

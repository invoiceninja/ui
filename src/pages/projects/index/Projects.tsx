/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Projects() {
  const [t] = useTranslation();
  const pages = [{ name: t('projects'), href: '/projects' }];

  return <Default breadcrumbs={pages} docsLink="docs/projects/"></Default>;
}

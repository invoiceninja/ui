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
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Create() {
  const { documentTitle } = useTitle('new_project');

  const [t] = useTranslation();

  const pages = [
    { name: t('projects'), href: '/projects' },
    { name: t('new_project'), href: '/projects/create' },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {/*  */}
    </Default>
  );
}

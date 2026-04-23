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
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BlueprintWizard } from './components/BlueprintWizard';

export default function Create() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const pages: Page[] = [
    { name: t('docuninja'), href: '/docuninja' },
    {
      name: t('templates'),
      href: route('/docuninja/templates'),
    },
    {
      name: t('create_template'),
      href: route('/docuninja/templates/create'),
    },
  ];

  const handleWizardComplete = (blueprintId: string) => {
    navigate(
      route('/docuninja/templates/:id/edit', {
        id: blueprintId,
      })
    );
  };

  const handleWizardCancel = () => {
    navigate(route('/docuninja/templates'));
  };

  return (
    <Default
      title={t('new_template')}
      breadcrumbs={pages}
    >
      <BlueprintWizard
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    </Default>
  );
}

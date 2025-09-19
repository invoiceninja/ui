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
    { name: t('documents'), href: '/documents' },
    {
      name: t('blueprints'),
      href: route('/documents/blueprints'),
    },
    {
      name: t('create_blueprint'),
      href: route('/documents/blueprints/create'),
    },
  ];

  const handleWizardComplete = (blueprintId: string) => {
    navigate(
      route('/documents/blueprints/:id/edit', {
        id: blueprintId,
      })
    );
  };

  const handleWizardCancel = () => {
    navigate(route('/documents/blueprints'));
  };

  return (
    <Default
      title={t('new_blueprint')}
      breadcrumbs={pages}
    >
      <BlueprintWizard
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    </Default>
  );
}

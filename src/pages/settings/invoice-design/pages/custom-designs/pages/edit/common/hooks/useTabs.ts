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
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function useTabs() {
  const [t] = useTranslation();

  const { id } = useParams();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const tabs: Tab[] = [
    {
      name: t('settings'),
      href: route('/settings/invoice_design/custom_designs/:id/edit', { id }),
      enabled: isCompanySettingsActive,
    },
    {
      name: t('body'),
      href: route('/settings/invoice_design/custom_designs/:id/edit/body', {
        id,
      }),
      enabled: isCompanySettingsActive,
    },
    {
      name: t('header'),
      href: route('/settings/invoice_design/custom_designs/:id/edit/header', {
        id,
      }),
      enabled: isCompanySettingsActive,
    },
    {
      name: t('footer'),
      href: route('/settings/invoice_design/custom_designs/:id/edit/footer', {
        id,
      }),
      enabled: isCompanySettingsActive,
    },
    {
      name: t('includes'),
      href: route('/settings/invoice_design/custom_designs/:id/edit/includes', {
        id,
      }),
      enabled: isCompanySettingsActive,
    },
    {
      name: t('variables'),
      href: route(
        '/settings/invoice_design/custom_designs/:id/edit/variables',
        {
          id,
        }
      ),
      enabled: isCompanySettingsActive,
    },
  ];

  return tabs;
}

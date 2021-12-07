/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';

export function GroupSettings() {
  const [t] = useTranslation();

  return <Settings title={t('group_settings')}>{/*  */}</Settings>;
}

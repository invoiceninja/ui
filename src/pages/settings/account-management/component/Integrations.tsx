/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '../../../../components/cards';

export function Integrations() {
  const [t] = useTranslation();

  return (
    <Card title={t('integrations')}>
      <Link
        to="/settings/integrations/api_tokens"
        className="px-4 sm:px-6 block hover:bg-gray-50 py-4"
      >
        {t('api_tokens')}
      </Link>
      <Link
        to="/settings/integrations/api_webhooks"
        className="px-4 sm:px-6 block hover:bg-gray-50 py-4"
      >
        {t('api_webhooks')}
      </Link>
      <a
        target="_blank"
        href="https://invoiceninja.github.io"
        className="px-4 sm:px-6 block hover:bg-gray-50 py-4"
      >
        {t('api_docs')}
      </a>
      <Link
        to="/settings/integrations/zapier"
        className="px-4 sm:px-6 block hover:bg-gray-50 py-4"
      >
        Zapier
      </Link>
    </Card>
  );
}

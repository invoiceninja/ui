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
import { Card, ClickableElement } from '../../../../components/cards';

export function Integrations() {
  const [t] = useTranslation();

  return (
    <Card title={t('integrations')}>
      <ClickableElement to="/settings/integrations/api_token">
        {t('api_tokens')}
      </ClickableElement>
      <ClickableElement to="/settings/integrations/api_webhooks">
        {t('api_webhooks')}
      </ClickableElement>
      <ClickableElement href="https://invoiceninja.github.io">
        {t('api_docs')}
      </ClickableElement>
      <ClickableElement to="/settings/integrations/zapier">
        Zapier
      </ClickableElement>
    </Card>
  );
}

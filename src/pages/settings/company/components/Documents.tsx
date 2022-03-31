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

export function Documents() {
  const [t] = useTranslation();

  return (
    <Card title={t('documents')}>
      <ClickableElement to="/settings/company_details/documents">
        {t('default_documents')}
      </ClickableElement>
    </Card>
  );
}

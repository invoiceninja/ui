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

export function Licence() {
  const [t] = useTranslation();

  return (
    <Card title="Licences">
      <ClickableElement>{t('purchase_license')}</ClickableElement>
      <ClickableElement>{t('apply_license')}</ClickableElement>
    </Card>
  );
}

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
import { Card, Element } from '../../../../components/cards';
import { Button } from '../../../../components/forms';

export function Plan() {
  const [t] = useTranslation();

  return (
    <Card title={t('plan')}>
      <Element leftSide={t('plan')}>Free</Element>
      <Element leftSide={t('expires_on')}>December 31, 2025</Element>
      <Element>
        <Button className="mt-4" type="minimal">{t('plan_change')}</Button>
      </Element>
    </Card>
  );
}

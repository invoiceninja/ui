/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Textarea } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

export function Customize() {
  const [t] = useTranslation();

  return (
    <Card title={t('customize')}>
      <Element leftSide={t('header')}>
        <Textarea />
      </Element>

      <Element leftSide={t('footer')}>
        <Textarea />
      </Element>

      <Element leftSide={t('custom_css')}>
        <Textarea />
      </Element>
    </Card>
  );
}

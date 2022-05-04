/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from 'common/helpers';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Button } from '../../../../components/forms';

export function Connect() {
  const [t] = useTranslation();

  return (
    <Card title={t('oneclick_login')}>
      {isHosted() && (
        <Element leftSide="Google">
          <Button type="minimal">{t('connect_google')}</Button>
        </Element>
      )}
      <Element leftSide="Gmail">
        <Button type="minimal">{t('connect_gmail')}</Button>
      </Element>
    </Card>
  );
}

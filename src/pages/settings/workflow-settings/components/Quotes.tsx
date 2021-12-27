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
import Toggle from '../../../../components/forms/Toggle';

export function Quotes() {
  const [t] = useTranslation();

  return (
    <Card title={t('quotes')}>
      <Element
        leftSide={t('auto_convert_quote')}
        leftSideHelp={t('auto_convert_quote_help')}
      >
        <Toggle />
      </Element>
      <Element
        leftSide={t('auto_archive_quote')}
        leftSideHelp={t('auto_archive_quote_help')}
      >
        <Toggle />
      </Element>
    </Card>
  );
}

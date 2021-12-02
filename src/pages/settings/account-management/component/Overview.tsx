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

export function Overview() {
  const [t] = useTranslation();

  return (
    <Card title={t('overview')}>
      <Element
        leftSide={t('activate_company')}
        leftSideHelp={t('activate_company_help')}
      >
        <Toggle />
      </Element>
      <Element
        leftSide={t('enable_markdown')}
        leftSideHelp={t('enable_markdown_help')}
      >
        <Toggle />
      </Element>
      <Element
        leftSide={t('include_drafts')}
        leftSideHelp={t('include_drafts_help')}
      >
        <Toggle />
      </Element>
    </Card>
  );
}

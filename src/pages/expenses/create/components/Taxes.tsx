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
import { Link } from '@invoiceninja/forms';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTranslation } from 'react-i18next';
import { ExpenseCardProps } from './Details';

export function TaxSettings(props: ExpenseCardProps) {
  const [t] = useTranslation();
  const { expense } = props;
  const company = useCurrentCompany();

  return (
    <Card title={t('taxes')} isLoading={!expense}>
      {company?.enabled_expense_tax_rates === 0 && (
        <Element leftSide={t('expense_tax_help')}>
          <Link to="/settings/tax_settings">{t('settings')}</Link>
        </Element>
      )}
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { SelectField } from '@invoiceninja/forms';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useTranslation } from 'react-i18next';

export function Selector() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();

  return (
    <>
      {companyChanges?.enabled_tax_rates > 0 && (
        <Card>
          {companyChanges?.enabled_tax_rates > 0 && (
            <Element leftSide={t('tax_rate1')}>
              <SelectField></SelectField>
            </Element>
          )}

          {companyChanges?.enabled_tax_rates > 1 && (
            <Element leftSide={t('tax_rate2')}>
              <SelectField></SelectField>
            </Element>
          )}

          {companyChanges?.enabled_tax_rates > 2 && (
            <Element leftSide={t('tax_rate3')}>
              <SelectField></SelectField>
            </Element>
          )}
        </Card>
      )}
    </>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { SortableVariableList } from './SortableVariableList';
import { useCustomField } from '$app/components/CustomField';
import { useColorScheme } from '$app/common/colors';
import { Calculator } from '$app/components/icons/Calculator';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

export default function TotalFields() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const company = useCurrentCompany();

  const customField = useCustomField();

  let defaultVariables = [
    { value: '$subtotal', label: t('subtotal') },
    { value: '$net_subtotal', label: t('net_subtotal') },
    { value: '$discount', label: t('discount') },
    { value: '$line_taxes', label: t('line_taxes') },
    { value: '$total_taxes', label: t('total_taxes') },
    { value: '$tax1', label: t('tax_rate1') },
    { value: '$tax2', label: t('tax_rate2') },
    { value: '$tax3', label: t('tax_rate3') },
    {
      value: '$custom_surcharge1',
      label: customField('surcharge1').label() || t('custom_surcharge1'),
    },
    {
      value: '$custom_surcharge2',
      label: customField('surcharge2').label() || t('custom_surcharge2'),
    },
    {
      value: '$custom_surcharge3',
      label: customField('surcharge3').label() || t('custom_surcharge3'),
    },
    {
      value: '$custom_surcharge4',
      label: customField('surcharge4').label() || t('custom_surcharge4'),
    },
    { value: '$paid_to_date', label: t('paid_to_date') },
    { value: '$total', label: t('total') },
    { value: '$outstanding', label: t('balance_due') },
  ];

  if (!company?.enabled_tax_rates) {
    defaultVariables = defaultVariables.filter(
      (variable) => variable.value !== '$tax1'
    );
  }

  if (company?.enabled_tax_rates < 2) {
    defaultVariables = defaultVariables.filter(
      (variable) => variable.value !== '$tax2'
    );
  }

  if (company?.enabled_tax_rates < 3) {
    defaultVariables = defaultVariables.filter(
      (variable) => variable.value !== '$tax3'
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <div>
            <Calculator color="#2176FF" size="1.3rem" />
          </div>

          <span>{t('total_fields')}</span>
        </div>
      }
      padding="small"
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <SortableVariableList
        for="total_columns"
        defaultVariables={defaultVariables}
      />
    </Card>
  );
}

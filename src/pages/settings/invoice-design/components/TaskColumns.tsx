/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
import { SortableVariableList } from './SortableVariableList';

export function TaskColumns() {
  const [t] = useTranslation();

  const defaultVariables = [
    { value: '$task.service', label: t('service') },
    { value: '$task.description', label: t('description') },
    { value: '$task.hours', label: t('hours') },
    { value: '$task.rate', label: t('rate') },
    { value: '$task.tax', label: t('tax') },
    { value: '$task.discount', label: t('discount') },
    { value: '$task.line_total', label: t('line_total') },
    { value: '$task.custom1', label: t('custom1') },
    { value: '$task.custom2', label: t('custom2') },
    { value: '$task.custom3', label: t('custom3') },
    { value: '$task.custom4', label: t('custom4') },
    { value: '$task.gross_line_total', label: t('gross_line_total') },
  ];

  return (
    <SortableVariableList
      for="task_columns"
      defaultVariables={defaultVariables}
    />
  );
}

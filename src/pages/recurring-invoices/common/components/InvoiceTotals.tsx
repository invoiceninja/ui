/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTotalVariables } from 'pages/invoices/common/hooks/useTotalVariables';
import { useResolveTotalVariable } from '../hooks/useResolveTotalVariable';

export function InvoiceTotals() {
  const variables = useTotalVariables();
  const resolveVariable = useResolveTotalVariable();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max">
      {variables.map((variable) => resolveVariable(variable))}
    </Card>
  );
}

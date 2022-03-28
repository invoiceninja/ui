/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringInvoiceStatus } from 'common/enums/recurring-invoice-status';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { useToggleStartStop } from '../hooks/useToggleStartStop';

export function Actions() {
  const [t] = useTranslation();
  const recurringInvoice = useCurrentRecurringInvoice();
  const toggleStartStop = useToggleStartStop();

  return (
    <Dropdown label={t('more_actions')}>
      {recurringInvoice &&
        (recurringInvoice.status_id === RecurringInvoiceStatus.DRAFT ||
          recurringInvoice.status_id === RecurringInvoiceStatus.PAUSED) && (
          <DropdownElement
            onClick={() => toggleStartStop(recurringInvoice, true)}
          >
            {t('start')}
          </DropdownElement>
        )}

      {recurringInvoice &&
        recurringInvoice.status_id === RecurringInvoiceStatus.ACTIVE && (
          <DropdownElement
            onClick={() => toggleStartStop(recurringInvoice, false)}
          >
            {t('stop')}
          </DropdownElement>
        )}

      {recurringInvoice && (
        <DropdownElement
          to={generatePath('/recurring_invoices/:id/clone', {
            id: recurringInvoice.id,
          })}
        >
          {t('clone_to_recurring_invoice')}
        </DropdownElement>
      )}
    </Dropdown>
  );
}

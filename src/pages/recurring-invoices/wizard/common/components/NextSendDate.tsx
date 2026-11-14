/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import { InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { Wizard } from '../hooks/useWizard';
import { toDateInput, today } from '../helpers/dates';

const HELP: Record<string, string> = {
  [RecurringInvoiceStatus.ACTIVE]: 'next_send_date_help',
  [RecurringInvoiceStatus.PENDING]: 'next_send_date_help',
  [RecurringInvoiceStatus.PAUSED]: 'paused_recurring_invoice_helper',
};

interface Props {
  wizard: Wizard;
}

export function NextSendDate({ wizard }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const start = toDateInput(wizard.recurringInvoice?.next_send_date);
  const help = HELP[wizard.recurringInvoice?.status_id ?? ''];

  return (
    <div>
      <InputField
        id="iw-start-date"
        label={t('next_send_date')}
        type="date"
        value={start}
        min={today()}
        changeOverride
        debounceTimeout={0}
        errorMessage={wizard.errors?.errors?.next_send_date}
        onValueChange={(value) => {
          if (value === start) {
            return;
          }

          wizard.patch({ next_send_date: value });
        }}
      />

      {help ? (
        <p className="text-[0.8125rem] mt-1.5" style={{ color: colors.$22 }}>
          {t(help)}
        </p>
      ) : null}
    </div>
  );
}

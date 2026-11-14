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
import { useGetSettingWithLevel } from '$app/common/hooks/useGetSetting';
import { useTranslation } from 'react-i18next';
import { Callout } from './Callout';
import { Wizard } from '../hooks/useWizard';
import { withoutBlankSetting } from '../helpers/settings';

interface Props {
  wizard: Wizard;
  hasDueDate: boolean;
}

export function AutoBillTiming({ wizard, hasDueDate }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const getSettingWithLevel = useGetSettingWithLevel();

  const autoBill = wizard.recurringInvoice?.auto_bill;

  const autoBillDate = getSettingWithLevel(
    withoutBlankSetting(wizard.client, 'auto_bill_date'),
    'auto_bill_date'
  );
  const autoEmail = getSettingWithLevel(
    withoutBlankSetting(wizard.client, 'auto_email_invoice'),
    'auto_email_invoice'
  );

  if (
    !autoBill ||
    autoBill === 'off' ||
    autoBillDate.level === null ||
    autoEmail.level === null
  ) {
    return null;
  }

  if (autoEmail.value === false) {
    return (
      <div className="mt-3">
        <Callout title={t('recurring_auto_email_off')} />
      </div>
    );
  }

  const onSendDate = autoBillDate.value === 'on_send_date';

  if (!onSendDate && !hasDueDate) {
    return (
      <div className="mt-3">
        <Callout title={t('auto_bill_needs_due_date')} />
      </div>
    );
  }

  return (
    <p className="text-[0.8125rem] mt-2.5" style={{ color: colors.$22 }}>
      {onSendDate
        ? t('auto_bill_charged_on_send_date')
        : t('auto_bill_charged_on_due_date')}
    </p>
  );
}

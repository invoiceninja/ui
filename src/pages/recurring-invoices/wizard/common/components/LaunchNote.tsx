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
import { trans } from '$app/common/helpers';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useGetSettingWithLevel } from '$app/common/hooks/useGetSetting';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { usePaymentTerms } from '../hooks/usePaymentTerms';
import { Wizard } from '../hooks/useWizard';
import { invitedEmails } from '../helpers/client-contact';
import { formatDate } from '../helpers/dates';
import {
  dueDate,
  firstSendDate,
  sendsRightAway,
  upcomingDates,
} from '../helpers/schedule';
import { withoutBlankSetting } from '../helpers/settings';
import { isDraft } from '../helpers/status';

const CHARGED_AT_SEND = ['always', 'optout'];

interface Props {
  wizard: Wizard;
  className?: string;
  onChange?: () => void;
}

export function LaunchNote({ wizard, className, onChange }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const getSettingWithLevel = useGetSettingWithLevel();

  const recurringInvoice = wizard.recurringInvoice;
  const client = wizard.client;
  const terms = usePaymentTerms(client);

  const autoEmail = getSettingWithLevel(
    withoutBlankSetting(client, 'auto_email_invoice'),
    'auto_email_invoice'
  );
  const autoBillDate = getSettingWithLevel(
    withoutBlankSetting(client, 'auto_bill_date'),
    'auto_bill_date'
  );

  const rightAway = sendsRightAway(recurringInvoice, wizard.startLater);
  const emails = invitedEmails(recurringInvoice?.invitations, client);

  const dates = upcomingDates(
    firstSendDate(recurringInvoice, wizard.startLater),
    recurringInvoice?.frequency_id ?? '',
    Number(recurringInvoice?.remaining_cycles ?? -1),
    2
  );

  if (
    !isDraft(recurringInvoice) ||
    !dates.length ||
    !emails.length ||
    autoEmail.level === null
  ) {
    return null;
  }

  const emailed = autoEmail.value !== false;
  const recipients = emails.join(', ');

  const charged =
    emailed &&
    CHARGED_AT_SEND.includes(recurringInvoice?.auto_bill ?? '') &&
    (autoBillDate.value === 'on_send_date' ||
      dueDate(dates[0], recurringInvoice?.due_date_days, terms) === dates[0]);

  const opening = emailed
    ? rightAway
      ? trans('send_now_first_invoice', { email: recipients })
      : trans('start_first_invoice_on', {
          email: recipients,
          date: formatDate(dates[0]),
        })
    : rightAway
      ? t('send_now_first_invoice_draft')
      : trans('start_first_invoice_draft_on', { date: formatDate(dates[0]) });

  return (
    <div
      className={classNames('space-y-1 text-sm leading-6', className)}
      style={{ color: colors.$3 }}
    >
      <p>
        {opening}{' '}
        {onChange ? (
          <button
            type="button"
            onClick={onChange}
            style={{ color: accentColor, fontWeight: 500 }}
          >
            {t('change')}
          </button>
        ) : null}
      </p>

      {emailed ? null : <p>{t('recurring_auto_email_off')}</p>}

      {rightAway && dates[1] ? (
        <p>{trans('next_invoice_on', { date: formatDate(dates[1]) })}</p>
      ) : null}

      {charged ? <p>{t('recurring_auto_bill_at_send')}</p> : null}
    </div>
  );
}

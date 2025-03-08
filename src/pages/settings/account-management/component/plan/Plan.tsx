/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date, trans } from '$app/common/helpers';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface PlanProps {
  title: ReactNode;
  color: string;
  trial: boolean;
  price: string;
  custom: boolean;
  term: 'month' | 'year';
}

export function Plan({ title, color, trial, price, custom, term }: PlanProps) {
  const scheme = useColorScheme();
  const account = useCurrentAccount();

  const width = () => {
    const percentage = (account.trial_days_left / 14) * 100;

    return Math.min(Math.max(percentage, 0), 100) + '%';
  };

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { t } = useTranslation();

  return (
    <div
      className="border border-l-8 rounded p-4 flex flex-col space-y-4"
      style={{ borderColor: color }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">{title}</p>

        {custom ? (
          <b>{price}</b>
        ) : (
          <p>
            {trial ? t('free_trial_then') : null} <b> ${price} /</b>{' '}
            <span className="lowercase">{t(term)}</span>
          </p>
        )}
      </div>

      {trial ? (
        <div className="flex justify-between items-center">
          <p>{trans('days_left', { days: account.trial_days_left })}</p>
          <p>{trans('days_trial', { days: 14 })}</p>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p>
            {t('expires_on')} <b>{date(account.plan_expires, dateFormat)}</b>
          </p>
        </div>
      )}

      {trial ? (
        <div
          className="w-full rounded-full h-2.5"
          style={{ backgroundColor: scheme.$2 }}
        >
          <div
            className="h-2.5 rounded-full"
            style={{ width: width(), background: color }}
          ></div>
        </div>
      ) : null}
    </div>
  );
}

export function Free() {
  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <p className="font-semibold">Free</p>

      <p>
        <b>$0</b>
      </p>
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from "$app/common/colors";
import { date } from "$app/common/helpers";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { useCurrentCompanyDateFormats } from "$app/common/hooks/useCurrentCompanyDateFormats";

export interface PlanProps {
  title: string;
  color: string;
  trial: boolean;
  price: string;
  custom: boolean;
}

export function Plan({ title, color, trial, price, custom }: PlanProps) {
  const scheme = useColorScheme();
  const account = useCurrentAccount();

  const width = () => {
    const percentage = (account.trial_days_left / 14) * 100;

    return Math.min(Math.max(percentage, 0), 100) + '%';
  };

  const { dateFormat } = useCurrentCompanyDateFormats();

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
            {trial ? 'Free trial, then' : null} <b> ${price} /</b> year
          </p>
        )}
      </div>

      {trial ? (
        <div className="flex justify-between items-center">
          <p>{account.trial_days_left} days left</p>
          <p>14 days trial</p>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p>
            Expires on <b>{date(account.plan_expires, dateFormat)}</b>
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
        <b>$0 /</b> year
      </p>
    </div>
  );
}
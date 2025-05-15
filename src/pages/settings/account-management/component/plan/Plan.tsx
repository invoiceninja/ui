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
import { date, endpoint, trans } from '$app/common/helpers';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { Modal } from '$app/components/Modal';
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const refresh = useRefreshCompanyUsers();

  const handleTrialCancellation = () => {
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    toast.processing();

    request('POST', endpoint('/api/client/account_management/cancel_trial'))
      .then(() => {
        toast.success(t('cancelled_trial') || 'Trial cancelled successfully');
        refresh();
        setShowCancelModal(false);
      })
      .catch(() => {
        toast.error();
      });
  };

  

  const width = () => {
    const percentage = (account.trial_days_left / 14) * 100;

    return Math.min(Math.max(percentage, 0), 100) + '%';
  };

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { t } = useTranslation();

  return (
    <>
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
            <span className="lowercase mr-4">{t(term)}</span>
            {account.is_trial && (
            <Button className="bg-red-500 text-white" behavior="button" type="minimal" onClick={handleTrialCancellation}>
              {t('cancel')}
            </Button>
            )}
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

      <Modal
        title={t('cancel_trial')}
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      >
        <div className="space-y-4">
          <p>{t('cancel_trial_description')}</p>

          <div className="flex justify-end space-x-2">
            <Button
              behavior="button"
              type="minimal"
              className="bg-red-500 text-white"
              onClick={confirmCancellation}
            >
              {t('continue')}
            </Button>
          </div>
        </div>
      </Modal>
      </>
  );
}

export function Free() {
  const { t } = useTranslation();

  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <p className="font-semibold">{t('free')}</p>
      <p>
        <b>$0</b>
      </p>
    </div>
  );
}

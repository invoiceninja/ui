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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Check, Plus } from 'react-feather';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { AxiosResponse } from 'axios';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { get } from 'lodash';
import { Free, Plan } from './plan/Plan';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { NewCreditCard } from './plan/NewCreditCard';
import { DeleteCreditCard } from './plan/DeleteCreditCard';
import { Popup } from './plan/Popup';
import { CreditCard } from './plan/CreditCard';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { usePlansQuery } from '$app/common/queries/plans';
import { useTranslation } from 'react-i18next';
import { useEnterpriseUtils } from '../common/hooks/useEnterpriseUtils';
import { Downgrade } from './plan/Downgrade';

export function Plan2() {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const account = useCurrentAccount();

  const [popupVisible, setPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [createPopupVisible, setCreatePopupVisible] = useState(false);

  const { data: methods } = useQuery({
    queryKey: ['/api/client/account_management/methods', account?.id],
    queryFn: () =>
      request('POST', endpoint('/api/client/account_management/methods'), {
        account_key: account?.key,
      }).then(
        (response: AxiosResponse<GenericManyResponse<CompanyGateway>>) =>
          response.data.data
      ),
    enabled: Boolean(account),
  });

  const [selectedGateway, setSelectedGateway] = useState<CompanyGateway | null>(
    null
  );

  const { data: plans } = usePlansQuery();
  const { calculatePrice } = useEnterpriseUtils();
  const { t } = useTranslation();

  if (!account || !plans) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="px-7 py-3 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Your Plan</h4>
          </div>

          {account.plan === '' ? <Free /> : null}

          {account.plan === 'enterprise' ? (
            <Plan
              title={<EnterpriseLabel />}
              color={accentColor}
              price={calculatePrice().toString()}
              trial={account.trial_days_left}
              custom={false}
              term={account.plan_term === 'month' ? 'month' : 'year'}
            />
          ) : null}

          {account.plan === 'pro' ? (
            <Plan
              title="Ninja Pro"
              color="#5EC16A"
              price={
                account.plan_term === 'month'
                  ? get(plans, 'plans.pro_plan')!.toString()
                  : get(plans, 'plans.pro_plan_annual')!.toString()
              }
              trial={account.trial_days_left}
              custom={false}
              term={account.plan_term === 'month' ? 'month' : 'year'}
            />
          ) : null}

          {account.plan === 'premium_business_plus' ? (
            <Plan
              title="Premium Business+"
              color="#FFCB00"
              price=""
              trial={account.trial_days_left}
              custom={false}
              term={account.plan_term === 'month' ? 'month' : 'year'}
            />
          ) : null}

          <div
            className="rounded p-4 flex flex-col 2xl:flex-row justify-between items-center space-y-5 2xl:space-y-0"
            style={{ backgroundColor: colors.$2 }}
          >
            <div className="flex flex-col space-y-2">
              <p className="font-semibold text-center 2xl:text-left">
                Upgrade to Pro or Enterprise Plans for advanced features!
              </p>

              <div className="grid grid-cols-2 gap-20 text-sm">
                <div className="space-y-2">
                  <h3 className="font-semibold mb-3">Pro</h3>
                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Remove Invoice Ninja logo</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Unlimited Clients</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Advanced Customization</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">REST API Access</span>
                  </p>

                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold mb-3">Enterprise</h3>
                
                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Additional Account Users</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Attach Files to Emails (pdf, jpg, xls..)</span>
                  </p>

                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Custom URL “invoice.company.com”</span>
                  </p>

                  <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                    <span className="block">Auto-sync Bank Transactions</span>
                  </p>
                </div>
              </div>
            </div>

            <Button behavior="button" onClick={() => setPopupVisible(true)}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-7 py-3 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Payment method</h4>

            <button
              type="button"
              style={{ color: accentColor }}
              className="text-sm hover:underline flex items-center space-x-1"
              onClick={() => setCreatePopupVisible(true)}
            >
              <Plus size={18} /> <span>{t('add_payment_method')}</span>
            </button>

            <NewCreditCard
              visible={createPopupVisible}
              onClose={() => setCreatePopupVisible(false)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {methods?.length === 0 ? (
              <button
                type="button"
                className="flex items-center flex-col w-full lg:w-72 p-8 rounded border"
                style={{ borderColor: colors.$11.toString() }}
                onClick={() => setCreatePopupVisible(true)}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Plus size={48} />
                  <p>{t('add_payment_method')}</p>
                </div>
              </button>
            ) : null}

            {methods?.map((method) => (
              <CreditCard
                key={method.id}
                onDelete={() => {
                  setSelectedGateway(method);
                  setDeletePopupVisible(true);
                }}
                gateway={method}
              />
            ))}
          </div>
        </div>
      </Card>

      {account.plan !== '' ? <Downgrade /> : null}

      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} />

      <DeleteCreditCard
        gateway={selectedGateway}
        visible={deletePopupVisible}
        onClose={() => {
          setSelectedGateway(null);
          setDeletePopupVisible(false);
        }}
      />
    </div>
  );
}

function EnterpriseLabel() {
  const { t } = useTranslation();
  const account = useCurrentAccount();

  const label = () => {
    if (account.num_users <= 2) {
      return '1-2';
    }

    if (account.num_users <= 5) {
      return '3-5';
    }

    if (account.num_users <= 10) {
      return '6-10';
    }

    if (account.num_users <= 20) {
      return '11-20';
    }

    if (account.num_users <= 30) {
      return '21-30';
    }

    if (account.num_users <= 50) {
      return '31-50';
    }
  };

  return (
    <p>
      {t('enterprise')} ({label()}{' '}
      <span className="lowercase">{t('users')}</span>)
    </p>
  );
}

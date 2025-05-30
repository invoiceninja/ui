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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useEnterpriseUtils } from '../../common/hooks/useEnterpriseUtils';
import { Check } from 'react-feather';
import { StartTrial } from './StartTrial';
import { Upgrade } from '../upgrade/Upgrade';
import { UpgradeModal } from '$app/pages/documents/components/UpgradeModal';
import { usePlansQuery } from '$app/common/queries/plans';


export function HostedPlan() {
    const accentColor = useAccentColor();
    const colors = useColorScheme();
    const scheme = useColorScheme();
    const account = useCurrentAccount();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const color = useAccentColor();
    const { t } = useTranslation();

    const [upgradeVisible, setUpgradeVisible] = useState(false);
    const [trialVisible, setTrialVisible] = useState(false);

    const width = () => {
        const percentage = (account.trial_days_left / 14) * 100;

        return Math.min(Math.max(percentage, 0), 100) + '%';
    };

    const title = () => {
        if (account.plan === 'pro') {
            return t('pro');
        }

        if (account.plan === 'enterprise') {
            return <EnterpriseLabel />
        }

        return t('forever_free');
    }

    const trial = account.trial_days_left > 0;

    const { calculatePrice } = useEnterpriseUtils();
    const price = calculatePrice().toString();

    const term = account.plan_term === 'month' ? 'month' : 'year';

    const refresh = useRefreshCompanyUsers();
    const {data: plans} = usePlansQuery();
        
    console.log("plans = ");
    console.log(plans);

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

    return(
        <>
        <div
            className="border border-l-8 rounded p-4 flex flex-col space-y-4"
            style={{ borderColor: color }}
        >
            <div className="flex justify-between items-center">
                <p className="font-semibold">{title()}</p>

                <div>
                {trial ? t('free_trial_then') : null} <b> ${price} /</b>{' '}
                <span className="lowercase mr-4">{t(term)}</span>
                </div>
        
            </div>

            {trial ? (
                <div className="flex justify-between items-center">
                    <p>{trans('days_left', { days: account.trial_days_left })}</p>
                    <p>{trans('days_trial', { days: 14 })}</p>
                </div>
            ) : (
                <div className="flex justify-between items-center">
                    {account.plan_expires && (
                    <p>
                        {t('expires_on')} <b>{date(account.plan_expires, dateFormat)}</b>
                    </p>
                    )}
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

            <div className="flex flex-col space-y-2">
                <p className="font-semibold text-center 2xl:text-center">
                    {t('upgrade_for_features')}
                </p>
            </div>

            <div
                className="rounded p-4 flex flex-col 2xl:flex-row justify-between space-y-5 2xl:space-y-0 "
                style={{ backgroundColor: colors.$2 }}
            >
              <div className="grid grid-cols-3 gap-20 text-sm justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold mb-3">{t('pro')}</h3>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_1')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_2')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_3')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_4')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_7')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_8')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_9')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_10')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                    <Check size={18} style={{ color: accentColor }} />
                            <span className="block">{t('pro_plan_feature_11')}</span>
                    </p>
                    
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_13')}</span>
                    </p>
                   
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_15')}</span>
                    </p>
                   
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold mb-3">{t('enterprise')}</h3>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('all_pro_features_plus')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_16')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_17')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_18')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('enterprise_plan_feature_1')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('enterprise_plan_feature_2')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('enterprise_plan_feature_3')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_14')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('pro_plan_feature_12')}</span>
                    </p>
                    <p className="flex items-center space-x-1">
                        <Check size={18} style={{ color: accentColor }} />
                        <span className="block">{t('enterprise_plan_feature_4')}</span>
                    </p>
                </div>

                    <div className="flex flex-col space-y-2 items-center justify-center">
                        <Button behavior="button" onClick={() => setUpgradeVisible(true)}>
                            {t('upgrade')}
                        </Button>
                        {account.can_trial && (
                            <div className="flex flex-col items-center space-y-2">
                                <p>or</p>
                                <Button behavior="button" type="secondary" onClick={() => setTrialVisible(true)}>
                                    {t('trial_call_to_action')}
                                </Button>
                            </div>
                        )
                        }
                    </div>
                    
              </div>
            
        </div>
        
    <UpgradeModal
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        onPaymentComplete={() => { refresh(); }}
    />

    <StartTrial
        visible={trialVisible}
        onClose={() => setTrialVisible(false)}
    />

    </>
    );
}
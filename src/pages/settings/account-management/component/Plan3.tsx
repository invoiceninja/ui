/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useTranslation } from 'react-i18next';
import { HostedPlan } from './plan/HostedPlan';
import { Downgrade } from './upgrade/Downgrade';

export function Plan3() {

    const { t } = useTranslation();

    const account = useCurrentAccount();


    return(
        <div className="space-y-4">
            <Card>
                <div className="px-7 py-3 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">{t('plan')}</h4>
                    </div>

                    <HostedPlan />

                    {account?.plan !== '' && (
                        <Downgrade />
                    )}
                </div>
            </Card>
        </div>
    )
}
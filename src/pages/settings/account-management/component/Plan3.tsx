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
import { DeleteCreditCard } from './plan/DeleteCreditCard';
import { Popup } from './plan/Popup';
import { CreditCard } from './plan/CreditCard';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { usePlansQuery } from '$app/common/queries/plans';
import { useTranslation } from 'react-i18next';
import { useEnterpriseUtils } from '../common/hooks/useEnterpriseUtils';
import { Downgrade } from './plan/Downgrade';
import { StartTrial } from './plan/StartTrial';
import { NewCreditCard } from './plan/NewCreditCard';
import { DocuNinja } from './plan/DocuNinja';
import { useIsPaid } from '$app/common/hooks/usePaidOrSelfhost';
import { HostedPlan } from './plan/HostedPlan';
import { PlanUpgrade } from './upgrade/PlanUpgrade';

export function Plan3() {

    const accentColor = useAccentColor();
    const colors = useColorScheme();
    const account = useCurrentAccount();

    const { t } = useTranslation();

    return(
        <div className="space-y-4">
            <Card>
                <div className="px-7 py-3 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">{t('plan')}</h4>
                    </div>

                    <HostedPlan />

                    <PlanUpgrade />
                </div>
            </Card>
        </div>
    )
}
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Payment } from 'common/interfaces/payment';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import paymentStatus from 'common/constants/payment-status';

interface Props {
    payment: any
}

export function PaymentOverview(props: Props) {
    const [t] = useTranslation();
    const formatMoney = useFormatMoney();
    const company = useCurrentCompany();

    return (
        <Card className=''>
            <div className="grid grid-cols-2 gap-4">
                <div className='flex items-center justify-center'>{t('amount')}: {formatMoney(props?.payment?.amount || 0, company.settings.country_id, props.payment?.currency_id)}</div>
                <div className='flex items-center justify-center'>{t('applied')}: {formatMoney(props?.payment?.applied || 0, company.settings.country_id, props.payment?.currency_id)}</div>
                <div className='flex items-center justify-center'><StatusBadge for={paymentStatus} code={props?.payment?.status_id} /></div>
                <div className='flex items-center justify-center'>{t('refunded')}: {formatMoney(props?.payment?.refunded || 0, company.settings.country_id, props.payment?.currency_id)}</div> 
            </div>
        </Card>
    );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { endpoint } from 'common/helpers';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { Spinner } from 'components/Spinner';
import { SystemLogRecord } from 'common/interfaces/system-log';
import ReactJson from 'react-json-view'
import { date as formatDate } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';

export function SystemLog() {
    const [t] = useTranslation();
    const pages = [{ name: t('system_logs'), href: '/system_logs' }];
    const { dateFormat }= useCurrentCompanyDateFormats();

    const { data, isLoading } = useQuery(
        '/api/v1/system_logs?per_page=200&sort=created_at|DESC',
        () => request('GET', endpoint('/api/v1/system_logs?per_page=200&sort=created_at|DESC'))
    );

    const categories = [
        {id: 1, name: t('gateway_id')},
        {id: 2, name: t('email')},
        {id: 3, name: t('webhook')},
        {id: 4, name: t('pdf')},
        {id: 5, name: t('security')},  
    ];

    const events = [
        {id: 10, name: t('payment_failure')},
        {id: 11, name: t('payment_success')},
        {id: 21, name: t('success')},
        {id: 22, name: t('failure')},
        {id: 23, name: t('error')},
        {id: 30, name: t('email_send')},
        {id: 31, name: t('email_retry_queue')},
        {id: 32, name: t('email_bounced')},
        {id: 33, name: t('email_spam_complaint')},
        {id: 34, name: t('email_delivery')},
        {id: 35, name: t('opened')},
        {id: 40, name: t('webhook_response')},
        {id: 41, name: t('webhook_success')},
        {id: 50, name: t('pdf')},
        {id: 60, name: t('login_failure')},
        {id: 61, name: t('user')},
    ];

    const types = [
        {id: 300, name: t('paypal')},
        {id: 301, name: t('payment_type_stripe')},
        {id: 302, name: t('ledger')},
        {id: 303, name: t('failure')},
        {id: 304, name: t('checkout_com')},
        {id: 305, name: `auth.net`},
        {id: 306, name: t('custom')},
        {id: 307, name: `Braintree`},
        {id: 309, name: t('wepay')},
        {id: 310, name: `PayFast`},
        {id: 311, name: `PayTrace`},
        {id: 312, name: `Mollie`},
        {id: 313, name: `eWay`},
        {id: 320, name: `Square`},
        {id: 321, name: t('gocardless')},
        {id: 322, name: `Razorpay`},
        {id: 400, name: `Quota exceeded`},
        {id: 401, name: `Upstream failure`},
        {id: 500, name: `Webhook response`},
        {id: 600, name: `PDF Failure`},
        {id: 601, name: `PDF Sucess`},
        {id: 701, name: `Modified`},
        {id: 702, name: `Deleted`},
        {id: 800, name: `Login Success`},
        {id: 801, name: `Login Failure`},
    ];

    const getCategory = (id: any) => {
        
        const category = categories.find((data: any) => data.id == id);

        return category ? category.name : 'Undefined Category';

    };

    const getEvent = (id: any) => {
        
        const event = events.find((data: any) => data.id == id);

        return event ? event.name : 'Undefined Event';

    };

    const getType = (id: any) => {
        
        const type = types.find((data: any) => data.id == id);

        return type ? type.name : 'Undefined Type';

    };

    const getLog = (src: any) => {

        try {
            const o = JSON.parse(src);

            if (o && typeof o === "object") {
                return <ReactJson src={JSON.parse(src)} collapsed={true} />
            }

        } catch (e) {
            return src;
        }
        return src;

    }

    return (
        <Default
            title={t('system_logs')}
            breadcrumbs={pages}
        >
            {isLoading && (
                <NonClickableElement>
                    <Spinner />
                </NonClickableElement>
            )}

            {/* Stacked list */}
            <ul role="list" className="mt-5 border-t border-gray-200 divide-y divide-gray-200 sm:mt-0 sm:border-t-0">
                {data?.data?.data.map((system_log: SystemLogRecord) => (
                    <li key={system_log.id}>
                        <div className="flex items-center py-5 sm:py-6">
                            <div className="min-w-0 flex-1">
                                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 truncate">{getCategory(system_log.category_id)} </p>
                                        <p className="mt-2 flex items-center text-sm text-gray-500">
                                            <span className="truncate">{getType(system_log.type_id)} - {formatDate(system_log.created_at, dateFormat)}</span>
                                        </p>
                                    </div>
                                    <div className="hidden md:block">
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                {getEvent(system_log.event_id)} 
                                            </p>
                                            {getLog(system_log.log)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </Default>
    );
}

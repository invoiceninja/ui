/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { endpoint } from '$app/common/helpers';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Spinner } from '$app/components/Spinner';
import { SystemLogRecord } from '$app/common/interfaces/system-log';
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Card, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { JSONTree } from 'react-json-tree';
import { Badge } from '$app/components/Badge';

interface Category {
  id: number;
  name: string;
}

const jsonTreeTheme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

export function SystemLog() {
  const [t] = useTranslation();
  const pages = [{ name: t('system_logs'), href: '/system_logs' }];
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data, isLoading } = useQuery(
    '/api/v1/system_logs?per_page=200&sort=created_at|DESC',
    () =>
      request(
        'GET',
        endpoint('/api/v1/system_logs?per_page=200&sort=created_at|DESC')
      )
  );

  const categories: Category[] = [
    { id: 1, name: t('gateway_id') },
    { id: 2, name: t('email') },
    { id: 3, name: t('webhook') },
    { id: 4, name: t('pdf') },
    { id: 5, name: t('security') },
  ];

  const events: Category[] = [
    { id: 10, name: t('payment_failure') },
    { id: 11, name: t('payment_success') },
    { id: 21, name: t('success') },
    { id: 22, name: t('failure') },
    { id: 23, name: t('error') },
    { id: 30, name: t('email_send') },
    { id: 31, name: t('email_retry_queue') },
    { id: 32, name: t('email_bounced') },
    { id: 33, name: t('email_spam_complaint') },
    { id: 34, name: t('email_delivery') },
    { id: 35, name: t('opened') },
    { id: 40, name: t('webhook_response') },
    { id: 41, name: t('webhook_success') },
    { id: 50, name: t('pdf') },
    { id: 60, name: t('login_failure') },
    { id: 61, name: t('user') },
  ];

  const types: Category[] = [
    { id: 300, name: t('paypal') },
    { id: 301, name: t('payment_type_stripe') },
    { id: 302, name: t('ledger') },
    { id: 303, name: t('failure') },
    { id: 304, name: t('checkout_com') },
    { id: 305, name: `auth.net` },
    { id: 306, name: t('custom') },
    { id: 307, name: `Braintree` },
    { id: 309, name: t('wepay') },
    { id: 310, name: `PayFast` },
    { id: 311, name: `PayTrace` },
    { id: 312, name: `Mollie` },
    { id: 313, name: `eWay` },
    { id: 320, name: `Square` },
    { id: 321, name: t('gocardless') },
    { id: 322, name: `Razorpay` },
    { id: 400, name: `Quota exceeded` },
    { id: 401, name: `Upstream failure` },
    { id: 500, name: `Webhook response` },
    { id: 600, name: `PDF Failure` },
    { id: 601, name: `PDF Sucess` },
    { id: 701, name: `Modified` },
    { id: 702, name: `Deleted` },
    { id: 800, name: `Login Success` },
    { id: 801, name: `Login Failure` },
  ];

  const getCategory = (id: number | undefined) => {
    const category = categories.find(
      (category: Category) => category.id === id
    );

    return category ? category.name : 'Undefined Category';
  };

  const getEvent = (id: number | undefined) => {
    const event = events.find((event: Category) => event.id === id);

    return event ? event.name : 'Undefined Event';
  };

  const getType = (id: number | undefined) => {
    const type = types.find((type: any) => type.id === id);

    return type ? type.name : 'Undefined Type';
  };

  const getLog = (src: string) => {
    return <JSONTree data={JSON.parse(src)} theme={jsonTreeTheme} /> || src;
  };

  return (
    <Default title={t('system_logs')} breadcrumbs={pages}>
      {isLoading && (
        <NonClickableElement>
          <Spinner />
        </NonClickableElement>
      )}

      <Card>
        {data?.data.data.map(
          (
            systemLog: SystemLogRecord,
            index: number,
            { length }: { length: number }
          ) => (
            <>
              <Element
                key={index}
                leftSide={getCategory(systemLog.category_id)}
                leftSideHelp={`${getType(systemLog.type_id)} ${formatDate(
                  systemLog.created_at,
                  dateFormat
                )}`}
              >
                <div className="flex flex-col space-y-2">
                  <div>
                    <Badge>{getEvent(systemLog.event_id)}</Badge>
                  </div>

                  <div>{getLog(systemLog.log)}</div>
                </div>
              </Element>

              {index + 1 !== length && <Divider />}
            </>
          )
        )}
      </Card>
    </Default>
  );
}

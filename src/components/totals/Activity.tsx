/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint, trans } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { Spinner } from 'components/Spinner';
import { request } from 'common/helpers/request';
import { useQuery } from 'react-query';
import { Card } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { ActivityRecord } from 'common/interfaces/activity-record';

export function Activity() {
  const [t] = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data, isLoading, isError } = useQuery('/api/v1/activities', () =>
    request('GET', endpoint('/api/v1/activities'))
  );

  return (
    <Card title={t('activity')}>
      {isLoading && (
        <NonClickableElement>
          <Spinner />
        </NonClickableElement>
      )}

      {isError && (
        <NonClickableElement>{t('error_refresh_page')}</NonClickableElement>
      )}

      {data?.data.data &&
        data.data.data.map((record: ActivityRecord, index: number) => (
          <NonClickableElement key={index}>
            <span className="mr-1">{date(record.created_at, dateFormat)}:</span>

            {trans(`activity_${record.activity_type_id}`, {
              client: record.client_id,
              contact: record.contact_id,
              quote: record.quote_id,
              user: record.user_id,
              expense: record.expense_id,
              invoice: record.invoice_id,
              recurring_invoice: record.recurring_invoice_id,
            })}
          </NonClickableElement>
        ))}
    </Card>
  );
}

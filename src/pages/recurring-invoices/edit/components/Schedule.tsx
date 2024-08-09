/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Card } from '$app/components/cards';
import { Spinner } from '$app/components/Spinner';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { RecurringInvoiceContext } from '../../create/Create';
import { useOutletContext } from 'react-router-dom';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';

export default function Schedule() {
  const [t] = useTranslation();

  const context: RecurringInvoiceContext = useOutletContext();
  const { recurringInvoice } = context;

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['/api/v1/recurring_invoices', recurringInvoice?.id, 'slider'],
    queryFn: () =>
      request(
        'GET',
        endpoint(
          '/api/v1/recurring_invoices/:id?include=activities.history&show_dates=true',
          { id: recurringInvoice?.id }
        )
      ).then(
        (response: GenericSingleResourceResponse<RecurringInvoice>) =>
          response.data.data
      ),
    enabled: Boolean(recurringInvoice?.id),
    staleTime: Infinity,
  });

  return (
    <Card title={t('schedule')} className="w-full xl:w-2/3">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && (
        <div className="flex px-6 pt-2 pb-3 font-medium text-sm">
          <span className="w-1/2">{t('send_date')}</span>
          <span className="w-1/2">{t('due_date')}</span>
        </div>
      )}

      {resource?.recurring_dates.map((recurringDate, index) => (
        <div key={index} className="flex px-6 py-2 text-sm">
          <span className="w-1/2">
            {date(recurringDate.send_date, dateFormat)}
          </span>
          <span className="w-1/2">
            {date(recurringDate.due_date, dateFormat)}
          </span>
        </div>
      ))}
    </Card>
  );
}

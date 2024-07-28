/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { DashboardField } from '$app/common/interfaces/company-user';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FIELDS_LABELS } from './DashboardCardSelector';
import { Card as CardElement } from '$app/components/cards';
import { useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';

interface DashboardCardsProps {
  dateRange: string;
  startDate: string;
  endDate: string;
}

interface CardProps extends DashboardCardsProps {
  field: DashboardField;
}

export const PERIOD_LABELS = {
  current: 'current_period',
  previous: 'previous_period',
};

function Card(props: CardProps) {
  const [t] = useTranslation();

  const { dateRange, startDate, endDate, field } = props;

  const queryClient = useQueryClient();
  const formatMoney = useFormatMoney();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<number>(0);

  useEffect(() => {
    setIsFormBusy(true);

    queryClient.fetchQuery(['/api/v1/charts/calculated_fields'], () =>
      request('POST', endpoint('/api/v1/charts/calculated_fields'), {
        date_range: dateRange,
        start_date: startDate,
        end_date: endDate,
        field: field.field,
        calculation: field.calculate,
        period: field.period,
        format: field.format,
      })
        .then((response) => setResponseData(response.data))
        .finally(() => setIsFormBusy(false))
    );
  }, [field]);

  return (
    <CardElement>
      {isFormBusy && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isFormBusy && (
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="font-medium">{t(FIELDS_LABELS[field.field])}</span>

          {field.format === 'money' && (
            <span>{formatMoney(responseData, '', '')}</span>
          )}

          <span>
            {t(
              PERIOD_LABELS[field.period as keyof typeof PERIOD_LABELS] ??
                field.period
            )}
          </span>
        </div>
      )}
    </CardElement>
  );
}

export function DashboardCards(props: DashboardCardsProps) {
  const { dateRange, startDate, endDate } = props;

  const currentUser = useCurrentUser();

  const [currentFields, setCurrentFields] = useState<DashboardField[]>([]);

  useEffect(() => {
    if (currentUser && Object.keys(currentUser).length) {
      setCurrentFields(
        currentUser.company_user?.settings.dashboard_fields ?? []
      );
    }
  }, [currentUser]);

  return (
    <div className="grid grid-cols-7 mt-4 gap-4">
      {currentFields.map((field, index) => (
        <Card
          key={index}
          field={field}
          dateRange={dateRange}
          startDate={startDate}
          endDate={endDate}
        />
      ))}
    </div>
  );
}

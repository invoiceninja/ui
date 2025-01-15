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
import { DashboardField } from '$app/common/interfaces/company-user';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FIELDS_LABELS } from './DashboardCardSelector';
import { useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { Card as ShadcnCard } from '../../../../components/ui/card';
import classNames from 'classnames';

interface DashboardCardsProps {
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
}

interface CardProps extends DashboardCardsProps {
  field: DashboardField;
  layoutBreakpoint: string | undefined;
}

export const PERIOD_LABELS = {
  current: 'current_period',
  previous: 'previous_period',
};

export function DashboardCard(props: CardProps) {
  const [t] = useTranslation();

  const { dateRange, startDate, endDate, field, currencyId } = props;

  const queryClient = useQueryClient();
  const formatMoney = useFormatMoney();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<number>();

  useEffect(() => {
    (async () => {
      typeof responseData === 'undefined' && setIsFormBusy(true);

      const response = await queryClient.fetchQuery(
        [
          '/api/v1/charts/calculated_fields',
          dateRange,
          startDate,
          endDate,
          field.field,
          field.calculate,
          field.period,
          currencyId,
        ],
        () =>
          request('POST', endpoint('/api/v1/charts/calculated_fields'), {
            date_range: dateRange,
            start_date: startDate,
            end_date: endDate,
            field: field.field,
            calculation: field.calculate,
            period: field.period,
            format: field.format,
            currency_id: currencyId,
          }).then((response) => response.data),
        { staleTime: Infinity }
      );

      setResponseData(response);
      typeof responseData === 'undefined' && setIsFormBusy(false);
    })();
  }, [field]);

  return (
    <ShadcnCard
      className={classNames('px-6 py-6 h-full', {
        'col-span-2':
          props.layoutBreakpoint === 'xxl' ||
          props.layoutBreakpoint === 'xl' ||
          !props.layoutBreakpoint,
        'col-span-3': props.layoutBreakpoint === 'lg',
        'col-span-4': props.layoutBreakpoint === 'md',
        'col-span-6': props.layoutBreakpoint === 'sm',
        'col-span-12':
          props.layoutBreakpoint === 'xs' || props.layoutBreakpoint === 'xxs',
      })}
    >
      {isFormBusy && (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {!isFormBusy && (
        <div className="flex flex-col items-center justify-center space-y-1 h-full w-full">
          <span className="font-medium">{t(FIELDS_LABELS[field.field])}</span>

          <span>
            {field.format === 'money' && field.calculate !== 'count'
              ? formatMoney(responseData ?? 0, '', '')
              : responseData}
          </span>

          <span className="text-gray-500">
            {t(
              PERIOD_LABELS[field.period as keyof typeof PERIOD_LABELS] ??
                field.period
            )}
          </span>
        </div>
      )}
    </ShadcnCard>
  );
}

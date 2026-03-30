/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { cloneDeep, set } from 'lodash';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { User } from '$app/common/interfaces/user';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DashboardCard } from './DashboardCard';

interface Props {
  currentDashboardFields: string[];
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
  layoutBreakpoint: string;
}

export function PreferenceCardsGrid({
  currentDashboardFields,
  dateRange,
  startDate,
  endDate,
  currencyId,
}: Props) {
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const reactSettings = useReactSettings();

  const [order, setOrder] = useState<string[]>(currentDashboardFields);

  useEffect(() => {
    setOrder(currentDashboardFields);
  }, [currentDashboardFields.length]);

  useEffect(() => {
    if (!user) return;

    if (
      JSON.stringify(reactSettings.dashboard_fields) === JSON.stringify(order)
    )
      return;

    const updated = cloneDeep(user) as User;
    set(updated, 'company_user.react_settings.dashboard_fields', order);

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: updated.id }),
      updated
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      set(updated, 'company_user', response.data.data);

      $refetch(['company_users']);

      dispatch(updateUser(updated));
      dispatch(resetChanges());
    });
  }, [order]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        width: '100%',
      }}
    >
      {currentDashboardFields.map((key, index) => (
        <div key={`${key}-${index}`} style={{ height: '130px' }}>
          <DashboardCard
            fieldKey={key}
            dateRange={dateRange}
            startDate={startDate}
            endDate={endDate}
            currencyId={currencyId}
          />
        </div>
      ))}
    </div>
  );
}

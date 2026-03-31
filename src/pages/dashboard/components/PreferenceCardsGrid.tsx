/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState, useCallback, useRef } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { MdRefresh } from 'react-icons/md';
import dayjs from 'dayjs';

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
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const user = useCurrentUser();
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const pendingRef = useRef<number>(0);

  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [order, setOrder] = useState<string[]>(currentDashboardFields);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    setOrder(currentDashboardFields);
  }, [currentDashboardFields.length]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (
      JSON.stringify(reactSettings.dashboard_fields) === JSON.stringify(order)
    ) {
      return;
    }

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

  const handleRefresh = useCallback(() => {
    pendingRef.current = currentDashboardFields.length;

    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
  }, [currentDashboardFields.length]);

  const handleCardSettled = useCallback(() => {
    pendingRef.current -= 1;

    if (pendingRef.current <= 0) {
      setLastRefreshedAt(dayjs().format('HH:mm'));
      setIsRefreshing(false);

      pendingRef.current = 0;
    }
  }, []);

  return (
    <div>
      <div className="flex justify-end items-center mb-2 gap-3">
        {lastRefreshedAt && (
          <span style={{ fontSize: '0.75rem', color: colors.$17 }}>
            {t('last_updated')}: {lastRefreshedAt}
          </span>
        )}

        <button
          className={`flex items-center justify-center p-1 rounded-md border ${
            isRefreshing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            borderColor: colors.$24,
            backgroundColor: colors.$1,
            color: colors.$3,
          }}
        >
          <MdRefresh size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 w-full">
        {currentDashboardFields.map((key, index) => (
          <div key={`${key}-${index}`} style={{ height: '130px' }}>
            <DashboardCard
              fieldKey={key}
              dateRange={dateRange}
              startDate={startDate}
              endDate={endDate}
              currencyId={currencyId}
              refreshKey={refreshKey}
              onSettled={handleCardSettled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

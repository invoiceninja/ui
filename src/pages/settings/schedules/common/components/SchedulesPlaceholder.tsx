/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdAdd, MdOutlineSchedule } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { useSchedulesTotalQuery } from '$app/common/queries/schedules';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { SCHEDULE_STARTERS } from '../helpers/schedule-starters';

interface BoxTheme {
  backgroundColor: string;
  hoverBackgroundColor: string;
}

const Box = styled.div<{ theme: BoxTheme }>`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export const useShowSchedulesPlaceholder = () => {
  const { data: schedulesTotal, isFetching } = useSchedulesTotalQuery();

  return schedulesTotal === 0 && !isFetching;
};

export function SchedulesPlaceholder() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const colors = useColorScheme();
  const showPlaceholder = useShowSchedulesPlaceholder();

  if (!showPlaceholder) {
    return null;
  }

  return (
    <Card
      title={t('schedules')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div className="flex flex-col items-center px-4 sm:px-6 pt-10 pb-8 text-center">
        <Icon element={MdOutlineSchedule} size={64} color={colors.$17} />

        <span className="mt-4 text-lg font-medium" style={{ color: colors.$3 }}>
          {t('no_schedules')}
        </span>

        <span className="mt-2 max-w-md text-sm" style={{ color: colors.$22 }}>
          {t('no_schedules_hint')}
        </span>

        <Button className="mt-6" to="/settings/schedules/create">
          <Icon element={MdAdd} size={18} color={colors.$1} />
          <span>{t('new_schedule')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 pb-6 md:grid-cols-3">
        {SCHEDULE_STARTERS.map((starter) => (
          <Box
            key={starter.key}
            className="flex flex-col p-4 border shadow-sm rounded-md cursor-pointer"
            theme={{
              backgroundColor: colors.$1,
              hoverBackgroundColor: colors.$4,
            }}
            style={{ borderColor: colors.$24 }}
            onClick={() =>
              navigate(
                route('/settings/schedules/create?starter=:starter', {
                  starter: starter.key,
                })
              )
            }
          >
            <Icon element={starter.icon} size={22} />

            <span
              className="mt-3 text-sm font-medium break-words"
              style={{ color: colors.$3 }}
            >
              {t(starter.title)}
            </span>

            <span
              className="mt-1 text-xs break-words"
              style={{ color: colors.$22 }}
            >
              {t(starter.description)}
            </span>
          </Box>
        ))}
      </div>
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { Task } from '$app/common/interfaces/task';
import { parseTimeLog } from '$app/pages/tasks/common/helpers/calculate-time';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';
import { useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { TaskStatusesDropdown } from './TaskStatusesDropdown';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { ChevronDown } from '$app/components/icons/ChevronDown';
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';

interface Props {
  entity: Task;
  withoutDropdown?: boolean;
}

export function TaskStatus(props: Props) {
  const [t] = useTranslation();

  const ref = useRef(null);

  const colors = useColorScheme();

  const adjustColorDarkness = useAdjustColorDarkness();
  const statusThemeColors = useStatusThemeColorScheme();

  const { invoice_id, archived_at, is_deleted, time_log, status } =
    props.entity;

  const [visibleDropdown, setVisibleDropdown] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  useClickAway(ref, () => {
    visibleDropdown && setVisibleDropdown(false);
  });

  const isRunning = () => {
    const timeLogs = parseTimeLog(time_log);
    const parsedTimeLogLength = timeLogs.length;

    if (!parsedTimeLogLength) return false;

    const lastParsedTimeLog = timeLogs[parsedTimeLogLength - 1];

    return lastParsedTimeLog[1] === 0;
  };

  if (is_deleted) return <Badge variant="red">{t('deleted')}</Badge>;

  if (archived_at) return <Badge variant="orange">{t('archived')}</Badge>;

  if (invoice_id) {
    return (
      <Badge variant="green" style={{ backgroundColor: statusThemeColors.$3 }}>
        {t('invoiced')}
      </Badge>
    );
  }

  if (isRunning()) {
    return (
      <Badge
        variant="light-blue"
        style={{ backgroundColor: statusThemeColors.$2 }}
      >
        {t('running')}
      </Badge>
    );
  }

  if (status) {
    const { red, green, blue, hex } = hexToRGB(status.color);

    const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

    return (
      <div ref={ref} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center">
          <div
            className={classNames(
              'text-xs rounded-l px-2 py-1 border-r border-white font-medium',
              {
                'rounded-r border-r-0': props.withoutDropdown,
              }
            )}
            style={{
              color: adjustColorDarkness(hex, darknessAmount),
              backgroundColor: status.color,
            }}
          >
            {status.name}
          </div>

          {!props.withoutDropdown && (
            <div
              className="flex items-center justify-center rounded-r py-1 h-full"
              style={{
                color: adjustColorDarkness(hex, darknessAmount),
                backgroundColor: status.color,
                width: '1.5rem',
              }}
              onClick={() =>
                !isFormBusy && setVisibleDropdown((current) => !current)
              }
            >
              <ChevronDown
                color={adjustColorDarkness(hex, darknessAmount)}
                size="1rem"
              />
            </div>
          )}
        </div>

        <TaskStatusesDropdown
          visible={visibleDropdown}
          isFormBusy={isFormBusy}
          setIsFormBusy={setIsFormBusy}
          task={props.entity}
          setVisible={setVisibleDropdown}
        />
      </div>
    );
  }

  return (
    <div ref={ref} onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center">
        <div
          className={classNames(
            'text-xs rounded-l px-2 py-1 border-r border-white font-medium bg-gray-100 text-gray-800',
            {
              'rounded-r border-r-0': props.withoutDropdown,
            }
          )}
        >
          {t('logged')}
        </div>

        {!props.withoutDropdown && (
          <div
            className="flex items-center justify-center rounded-r py-1 h-full bg-gray-100"
            onClick={() =>
              !isFormBusy && setVisibleDropdown((current) => !current)
            }
            style={{
              width: '1.5rem',
            }}
          >
            <ChevronDown color="#1f2937" size="1rem" />
          </div>
        )}
      </div>

      <TaskStatusesDropdown
        visible={visibleDropdown}
        isFormBusy={isFormBusy}
        setIsFormBusy={setIsFormBusy}
        task={props.entity}
        setVisible={setVisibleDropdown}
      />
    </div>
  );
}

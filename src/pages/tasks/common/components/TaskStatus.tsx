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
import { StatusBadge } from '$app/components/StatusBadge';
import { parseTimeLog } from '$app/pages/tasks/common/helpers/calculate-time';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';
import { useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { TaskStatusesDropdown } from './TaskStatusesDropdown';

interface Props {
  entity: Task;
}

export function TaskStatus(props: Props) {
  const [t] = useTranslation();

  const ref = useRef(null);

  const adjustColorDarkness = useAdjustColorDarkness();

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

  if (invoice_id) return <Badge variant="green">{t('invoiced')}</Badge>;

  if (isRunning()) return <Badge variant="light-blue">{t('running')}</Badge>;

  if (status) {
    const { red, green, blue, hex } = hexToRGB(status.color);

    const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

    return (
      <div ref={ref} onClick={(event) => event.stopPropagation()}>
        <StatusBadge
          for={{}}
          code={status.name}
          style={{
            color: adjustColorDarkness(hex, darknessAmount),
            backgroundColor: status.color,
          }}
          onClick={() =>
            !isFormBusy && setVisibleDropdown((current) => !current)
          }
        />

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
      <StatusBadge
        for={{}}
        code="logged"
        onClick={() => !isFormBusy && setVisibleDropdown((current) => !current)}
      />

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

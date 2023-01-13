/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClickableElement, Element } from '@invoiceninja/cards';
import { endpoint, isProduction } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { DocumentsTable } from 'components/DocumentsTable';
import { TabGroup } from 'components/TabGroup';
import { useAtom } from 'jotai';
import { Upload } from 'pages/settings/company/documents/components';
import { TaskStatus } from 'pages/tasks/common/components/TaskStatus';
import { isTaskRunning } from 'pages/tasks/common/helpers/calculate-entity-state';
import {
  calculateTime,
  calculateTimeDifference,
} from 'pages/tasks/common/helpers/calculate-time';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { currentTaskAtom } from '../common/atoms';
import { useFormatTimeLog } from '../common/hooks';

export function ViewSlider() {
  const [t] = useTranslation();

  const [currentTask] = useAtom(currentTaskAtom);

  const [runningLogTime, setRunningLogTime] = useState<string>();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const formatTimeLog = useFormatTimeLog();
  const accentColor = useAccentColor();

  const queryClient = useQueryClient();

  const [intervalValue, setIntervalValue] =
    useState<ReturnType<typeof setInterval>>();

  const isTaskActive = currentTask && isTaskRunning(currentTask);

  const timeLogs = currentTask && formatTimeLog(currentTask.time_log);

  const onSuccess = () => {
    queryClient.invalidateQueries(
      route('/api/v1/tasks/:id', { id: currentTask?.id })
    );
  };

  useEffect(() => {
    if (currentTask && isTaskActive) {
      if (timeLogs && timeLogs.length) {
        const lastTimeLog = timeLogs[timeLogs.length - 1];

        const [, startTaskTime, endTaskTime] = lastTimeLog;

        const currentInterval = setInterval(() => {
          setRunningLogTime(
            calculateTimeDifference(startTaskTime, endTaskTime).toString()
          );
        }, 1000);

        setIntervalValue(currentInterval);
      }
    }

    if (!isTaskActive && intervalValue) {
      clearInterval(intervalValue);
      setRunningLogTime('00:00:00');
    }

    return () => {
      isProduction() && clearInterval(intervalValue);
    };
  }, [isTaskActive]);

  return (
    <TabGroup tabs={[t('overview'), t('documents')]} width="full">
      <div>
        {currentTask && (
          <>
            <Element leftSide={t('duration')}>
              {calculateTime(currentTask.time_log.toString())}
            </Element>

            <Element leftSide={t('rate')}>
              {formatMoney(
                currentTask.rate || company.settings.default_task_rate,
                currentTask.client?.country_id || company?.settings.country_id,
                currentTask.client?.settings.currency_id ||
                  company?.settings.currency_id
              )}
            </Element>

            <Element leftSide={t('status')}>
              <TaskStatus entity={currentTask} />
            </Element>

            <NonClickableElement
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              <div className="inline-flex items-center">
                <span>{currentTask.description}</span>
              </div>
            </NonClickableElement>

            {timeLogs?.map(([date, start, end], i) =>
              i < timeLogs.length - 1 ? (
                <ClickableElement key={i}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p>{date}</p>

                      <small>
                        {start} - {end}
                      </small>
                    </div>

                    <p>{calculateTimeDifference(start, end)}</p>
                  </div>
                </ClickableElement>
              ) : (
                <ClickableElement key={i}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p>{date}</p>

                      <small>
                        {start} - {end}
                      </small>
                    </div>

                    <p>
                      {isTaskActive
                        ? runningLogTime
                        : calculateTimeDifference(start, end)}
                    </p>
                  </div>
                </ClickableElement>
              )
            )}
          </>
        )}
      </div>

      <div className="px-4">
        <Upload
          endpoint={endpoint('/api/v1/tasks/:id/upload', {
            id: currentTask?.id,
          })}
          onSuccess={onSuccess}
          widgetOnly
        />

        <DocumentsTable
          documents={currentTask?.documents || []}
          onDocumentDelete={onSuccess}
        />
      </div>
    </TabGroup>
  );
}

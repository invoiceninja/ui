/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClickableElement, Element } from '$app/components/cards';
import { endpoint } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { TabGroup } from '$app/components/TabGroup';
import { useAtom } from 'jotai';
import { Upload } from '$app/pages/settings/company/documents/components';
import { TaskStatus } from '$app/pages/tasks/common/components/TaskStatus';
import { isTaskRunning } from '$app/pages/tasks/common/helpers/calculate-entity-state';
import {
  calculateDifferenceBetweenLogs,
  calculateHours,
} from '$app/pages/tasks/common/helpers/calculate-time';
import { useTranslation } from 'react-i18next';
import { currentTaskAtom } from '../common/atoms';
import { useFormatTimeLog } from '../common/hooks';
import { TaskClock } from './TaskClock';
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';

export function ViewSlider() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const company = useCurrentCompany();
  const accentColor = useAccentColor();
  const formatMoney = useFormatMoney();
  const formatTimeLog = useFormatTimeLog();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const [currentTask] = useAtom(currentTaskAtom);

  const currentTaskTimeLogs =
    currentTask && formatTimeLog(currentTask.time_log);

  const onSuccess = () => {
    $refetch(['tasks']);
  };

  return (
    <TabGroup
      tabs={[t('overview'), t('documents')]}
      width="full"
      formatTabLabel={(tabIndex) => {
        if (tabIndex === 1) {
          return (
            <DocumentsTabLabel
              numberOfDocuments={currentTask?.documents.length}
            />
          );
        }
      }}
    >
      <div>
        {currentTask && (
          <>
            <Element leftSide={t('duration')}>
              {calculateHours(currentTask.time_log.toString())}
            </Element>

            <Element leftSide={t('rate')}>
              {formatMoney(
                currentTask.rate || company.settings.default_task_rate,
                currentTask.client?.country_id,
                currentTask.client?.settings.currency_id
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

            {currentTaskTimeLogs?.map(([date, start, end], i) => (
              <ClickableElement key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p>{formatDate(date, dateFormat)}</p>

                    <small>
                      {start} - {end}
                    </small>
                  </div>

                  <div>
                    {isTaskRunning(currentTask) &&
                    i === currentTaskTimeLogs.length - 1 ? (
                      <TaskClock
                        task={currentTask}
                        calculateLastTimeLog={true}
                      />
                    ) : (
                      calculateDifferenceBetweenLogs(currentTask.time_log, i)
                    )}
                  </div>
                </div>
              </ClickableElement>
            ))}
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
          disableUpload={
            !hasPermission('edit_task') && !entityAssigned(currentTask)
          }
        />

        <DocumentsTable
          documents={currentTask?.documents || []}
          onDocumentDelete={onSuccess}
          disableEditableOptions={!entityAssigned(currentTask, true)}
        />
      </div>
    </TabGroup>
  );
}

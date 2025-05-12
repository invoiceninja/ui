/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { endpoint } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
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
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';
import { Divider } from '$app/components/cards/Divider';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function ViewSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const accentColor = useAccentColor();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const formatTimeLog = useFormatTimeLog();
  const entityAssigned = useEntityAssigned();

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
              textCenter
            />
          );
        }
      }}
      withHorizontalPadding
      horizontalPaddingWidth="1.5rem"
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
              <TaskStatus entity={currentTask} withoutDropdown />
            </Element>

            {currentTask.description && (
              <div className="flex flex-col items-center px-6">
                <span
                  className="text-sm font-medium self-start"
                  style={{ color: colors.$22 }}
                >
                  {t('description')}
                </span>

                <span className="text-sm mt-1" style={{ color: colors.$17 }}>
                  {currentTask.description}
                </span>
              </div>
            )}

            {Boolean(currentTaskTimeLogs?.length) && (
              <Divider
                className="pt-2"
                withoutPadding
                borderColor={colors.$20}
              />
            )}

            <div className="flex flex-col space-y-4 px-6 py-5">
              {currentTaskTimeLogs?.map(([date, start, end], i) => (
                <Box
                  key={i}
                  className="flex items-center justify-between p-4 w-full shadow-sm border rounded-md"
                  style={{ borderColor: colors.$20 }}
                  theme={{
                    backgroundColor: colors.$1,
                    hoverBackgroundColor: colors.$4,
                  }}
                >
                  <div className="flex flex-col">
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.$3 }}
                    >
                      {formatDate(date, dateFormat)}
                    </p>

                    <span className="text-xs" style={{ color: colors.$17 }}>
                      {start} - {end}
                    </span>
                  </div>

                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.$3 }}
                  >
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
                </Box>
              ))}
            </div>
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
          disableEditableOptions={
            !entityAssigned(currentTask, true) && !hasPermission('edit_task')
          }
        />
      </div>
    </TabGroup>
  );
}

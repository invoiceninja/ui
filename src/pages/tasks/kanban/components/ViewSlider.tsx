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
import { endpoint } from 'common/helpers';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { DocumentsTable } from 'components/DocumentsTable';
import { TabGroup } from 'components/TabGroup';
import { useAtom } from 'jotai';
import { Upload } from 'pages/settings/company/documents/components';
import { TaskStatus } from 'pages/tasks/common/components/TaskStatus';
import { isTaskRunning } from 'pages/tasks/common/helpers/calculate-entity-state';
import { calculateTime } from 'pages/tasks/common/helpers/calculate-time';
import { useStart } from 'pages/tasks/common/hooks/useStart';
import { useStop } from 'pages/tasks/common/hooks/useStop';
import { Edit, Pause, Play, Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { currentTaskAtom } from '../common/atoms';
import { useFormatTimeLog } from '../common/hooks';

export function ViewSlider() {
  const [t] = useTranslation();
  const [currentTask] = useAtom(currentTaskAtom);

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const formatTimeLog = useFormatTimeLog();

  const startTask = useStart();
  const stopTask = useStop();

  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries(
      route('/api/v1/tasks/:id', { id: currentTask?.id })
    );
  };

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

            <ClickableElement
              to={route('/tasks/:id/edit', { id: currentTask.id })}
            >
              <div className="inline-flex items-center space-x-1">
                <Edit size={18} />
                <span>{t('edit_task')}</span>
              </div>
            </ClickableElement>

            <ClickableElement>
              <div className="inline-flex items-center space-x-1">
                <Plus size={18} />
                <span>{t('invoice_task')}</span>
              </div>
            </ClickableElement>

            {!isTaskRunning(currentTask) && (
              <ClickableElement onClick={() => startTask(currentTask)}>
                <div className="inline-flex items-center space-x-1">
                  <Play size={18} />
                  <span>{t('start')}</span>
                </div>
              </ClickableElement>
            )}

            {isTaskRunning(currentTask) && (
              <ClickableElement onClick={() => stopTask(currentTask)}>
                <div className="inline-flex items-center space-x-1">
                  <Pause size={18} />
                  <span>{t('stop')}</span>
                </div>
              </ClickableElement>
            )}

            <NonClickableElement>{currentTask.description}</NonClickableElement>

            {formatTimeLog(currentTask.time_log).map(
              ([date, start, end], i) => (
                <ClickableElement key={i}>
                  <div>
                    <p>{date}</p>

                    <small>
                      {start} - {end}
                    </small>
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

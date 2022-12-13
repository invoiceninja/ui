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
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import { Slider } from 'components/cards/Slider';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { TaskStatus } from 'pages/tasks/common/components/TaskStatus';
import { isTaskRunning } from 'pages/tasks/common/helpers/calculate-entity-state';
import { calculateTime } from 'pages/tasks/common/helpers/calculate-time';
import { useStart } from 'pages/tasks/common/hooks/useStart';
import { useStop } from 'pages/tasks/common/hooks/useStop';
import { Edit, Pause, Play, Plus } from 'react-feather';
import { useTranslation } from 'react-i18next';
import {
  currentTaskAtom,
  currentTaskIdAtom,
  isKanbanSliderVisibleAtom,
} from '../common/atoms';
import { useFormatTimeLog } from '../common/hooks';

export function ViewSlider() {
  const [t] = useTranslation();
  const [isKanbanSliderVisible, setIsKanbanSliderVisible] = useAtom(
    isKanbanSliderVisibleAtom
  );
  const setCurrentTaskId = useSetAtom(currentTaskIdAtom);
  const setCurrentTask = useSetAtom(currentTaskAtom);

  const currentTask = useAtomValue(currentTaskAtom);
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const formatTimeLog = useFormatTimeLog();

  const startTask = useStart();
  const stopTask = useStop();

  return (
    <>
      {currentTask && (
        <Slider
          visible={isKanbanSliderVisible}
          onClose={() => {
            setIsKanbanSliderVisible(false);
            setCurrentTaskId(undefined);
            setCurrentTask(undefined);
          }}
          size="regular"
          title={
            currentTask
              ? `${t('task')} ${currentTask.number}`
              : (t('task') as string)
          }
        >
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

          {formatTimeLog(currentTask.time_log).map(([date, start, end], i) => (
            <ClickableElement key={i}>
              <div>
                <p>{date}</p>

                <small>
                  {start} - {end}
                </small>
              </div>
            </ClickableElement>
          ))}
        </Slider>
      )}
    </>
  );
}

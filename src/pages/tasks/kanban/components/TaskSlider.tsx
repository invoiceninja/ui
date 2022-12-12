/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Slider } from 'components/cards/Slider';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentTaskAtom, isKanbanSliderVisibleAtom } from '../Kanban';

export function TaskSlider() {
  const [t] = useTranslation();
  const [isKanbanSliderVisible, setIsKanbanSliderVisible] = useAtom(
    isKanbanSliderVisibleAtom
  );

  const currentTask = useAtomValue(currentTaskAtom);

  return (
    <Slider
      visible={isKanbanSliderVisible}
      onClose={() => setIsKanbanSliderVisible(false)}
      size="regular"
      title={
        currentTask
          ? `${t('task')} ${currentTask.number}`
          : (t('task') as string)
      }
      withContainer
    ></Slider>
  );
}

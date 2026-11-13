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
import { Task } from '$app/common/interfaces/task';
import { Banner } from '$app/components/Banner';
import { useShowEditOption } from '../hooks/useShowEditOption';

interface Props {
  task: Task;
}

export function TaskLockedBanner({ task }: Props) {
  const [t] = useTranslation();

  const showEditOption = useShowEditOption();

  if (showEditOption(task)) {
    return null;
  }

  return <Banner variant="orange">{t('locked_task')}</Banner>;
}

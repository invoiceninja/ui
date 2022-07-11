/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from 'common/interfaces/task';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { isTaskRunning } from 'pages/tasks/common/helpers/calculate-entity-state';
import { useStart } from 'pages/tasks/common/hooks/useStart';
import { useTranslation } from 'react-i18next';

interface Props {
  task: Task;
}

export function Actions(props: Props) {
  const { task } = props;
  const [t] = useTranslation();

  const start = useStart();

  return (
    <Dropdown label={t('more_actions')}>
      {!isTaskRunning(task) && (
        <DropdownElement onClick={() => start(task)}>
          {t('start')}
        </DropdownElement>
      )}

      <DropdownElement>{t('change_status')}</DropdownElement>
      <DropdownElement>{t('invoice_task')}</DropdownElement>
    </Dropdown>
  );
}

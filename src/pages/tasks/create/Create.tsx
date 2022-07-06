/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { Task } from 'common/interfaces/task';
import { useBlankTaskQuery } from 'common/queries/tasks';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Create() {
  const { documentTitle } = useTitle('new_task');
  const { data: blankTask } = useBlankTaskQuery();

  const [t] = useTranslation();
  const [task, setTask] = useState<Task>();

  const handleChange = (property: keyof Task, value: unknown) => {
    setTask((current) => current && { ...current, [property]: value });
  };

  useEffect(() => {
    blankTask && setTask(blankTask);
  }, [blankTask]);

  return (
    <Default title={documentTitle}>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer></Card>
      </div>
    </Default>
  );
}

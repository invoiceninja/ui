/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Record } from "./client-map";

export const taskMap: Record[] = [
  { trans: 'start_date', value: 'task.start_date' },
  { trans: 'end_date', value: 'task.end_date' },
  { trans: 'duration', value: 'task.duration' },
  { trans: 'rate', value: 'task.rate' },
  { trans: 'number', value: 'task.number' },
  { trans: 'description', value: 'task.description' },
  { trans: 'custom_value1', value: 'task.custom_value1' },
  { trans: 'custom_value2', value: 'task.custom_value2' },
  { trans: 'custom_value3', value: 'task.custom_value3' },
  { trans: 'custom_value4', value: 'task.custom_value4' },
  { trans: 'status', value: 'task.status_id' },
  { trans: 'project', value: 'task.project_id' },
];

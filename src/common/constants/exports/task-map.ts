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
  { trans: 'start_date', value: 'task.start_date', map: 'task' },
  { trans: 'start_time', value: 'task.start_time', map: 'task' },
  { trans: 'end_date', value: 'task.end_date', map: 'task' },
  { trans: 'end_time', value: 'task.end_time', map: 'task' },
  { trans: 'duration', value: 'task.duration', map: 'task' },
  { trans: 'duration_words', value: 'task.duration_words', map: 'task' },
  { trans: 'rate', value: 'task.rate', map: 'task' },
  { trans: 'number', value: 'task.number', map: 'task' },
  { trans: 'description', value: 'task.description', map: 'task' },
  { trans: 'custom_value1', value: 'task.custom_value1', map: 'task' },
  { trans: 'custom_value2', value: 'task.custom_value2', map: 'task' },
  { trans: 'custom_value3', value: 'task.custom_value3', map: 'task' },
  { trans: 'custom_value4', value: 'task.custom_value4', map: 'task' },
  { trans: 'status', value: 'task.status_id', map: 'task' },
  { trans: 'project', value: 'task.project_id', map: 'task' },
];

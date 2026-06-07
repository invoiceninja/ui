/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  TaskProjectFilter,
  TaskUserFilter,
  useTaskUserFilters,
} from './TaskUserFilters';
import { TaskViewSwitcher } from './TaskViewSwitcher';

// Header controls for every task view: user + project pickers on the left,
// view switcher pill bar on the right. The user picker drives both `user_id`
// and `assigned_user_id`; the project picker drives `project_tasks`. Both are
// URL-backed so they persist across view switches.
export function TaskHeaderControls() {
  const state = useTaskUserFilters();

  return (
    <div className="flex flex-nowrap items-center justify-end gap-3">
      <TaskUserFilter state={state} />
      <TaskProjectFilter state={state} />
      <TaskViewSwitcher />
    </div>
  );
}

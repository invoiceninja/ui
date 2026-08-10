/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Task } from '$app/common/interfaces/task';
import {
  extractTextFromHTML,
  sanitizeHTML,
} from '$app/common/helpers/html-string';

const bracket = (task: Task): string => {
  if (task.project?.name) return task.project.name;
  if (task.client?.display_name) return task.client.display_name;
  return '';
};

// Decorated label used in the day/week/month calendar views. Always prefers
// project name in brackets; falls back to client name; omits the brackets
// entirely when neither exists.
export const taskCalendarLabel = (task: Task): string => {
  const head = task.description || `#${task.number || task.id.slice(0, 6)}`;
  const tail = bracket(task);
  return tail ? `${head} (${tail})` : head;
};

// Same as taskCalendarLabel but safe for rendering descriptions that may
// contain HTML (lists, links, rich-text). Strips tags and clips to a
// readable length — pair with a Tooltip that renders the full HTML.
export const taskCalendarLabelTruncated = (task: Task, max = 50): string => {
  if (!task.description) {
    const fallback = `#${task.number || task.id.slice(0, 6)}`;
    const tail = bracket(task);
    return tail ? `${fallback} (${tail})` : fallback;
  }
  const plain = extractTextFromHTML(sanitizeHTML(task.description));
  const head = plain.length > max ? `${plain.slice(0, max)}…` : plain;
  const tail = bracket(task);
  return tail ? `${head} (${tail})` : head;
};

// Primary line for the daily/weekly two-line layout: description only
// (HTML-stripped + clipped). No bracket — the secondary line carries the
// project/client name on its own row.
export const taskPrimaryLabel = (task: Task, max = 50): string => {
  if (!task.description) {
    return `#${task.number || task.id.slice(0, 6)}`;
  }
  const plain = extractTextFromHTML(sanitizeHTML(task.description));
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
};

// Secondary line: project name preferred, then client name. Empty string
// when neither is set so callers can skip rendering the row entirely.
export const taskSecondaryLabel = (task: Task): string => bracket(task);

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ActivityRecord } from 'common/interfaces/activity-record';

export function resolveActivityResource(activity: ActivityRecord) {
  if (activity.quote && activity.client_id) {
    return 'quote';
  }

  if (activity.expense && activity.expense_id) {
    return 'expense';
  }

  if (activity.invoice && activity.invoice_id) {
    return 'invoice';
  }

  if (activity.recurring_invoice && activity.recurring_invoice_id) {
    return 'recurring_invoice';
  }

  if (activity.payment && activity.payment_id) {
    return 'payment';
  }

  if (activity.credit && activity.credit_id) {
    return 'credit';
  }

  if (activity.task && activity.client_id) {
    return 'task';
  }

  if (activity.contact && activity.contact_id) {
    return 'contact';
  }

  if (activity.client_id && activity.client_id) {
    return 'client';
  }
}

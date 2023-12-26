/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Schedule } from '$app/common/interfaces/schedule';
import {
  DEFAULT_REPORT_FIELDS,
  REPORTS_FIELDS,
} from '../components/EmailReport';

interface Params {
  schedule: Schedule | undefined;
}

const PROPERTIES_ALIASES = {
  range: 'date_range',
  expense_billed: 'is_expense_billed',
  income_billed: 'is_income_billed',
  products: 'product_key',
  client: 'client_id',
};

export function useTemplateParametersProperties(params: Params) {
  const { schedule } = params;

  const getReportParametersProperties = () => {
    if (schedule) {
      let reportProperties = (
        REPORTS_FIELDS[schedule.parameters.report_name] || DEFAULT_REPORT_FIELDS
      ).map(
        (field) =>
          PROPERTIES_ALIASES[field as keyof typeof PROPERTIES_ALIASES] || field
      );

      if (schedule.parameters.date_range !== 'custom') {
        reportProperties = reportProperties.filter(
          (property) => property !== 'start_date' && property !== 'end_date'
        );
      }

      return reportProperties;
    }

    return [];
  };

  const templateParametersProperties = {
    email_statement: [
      'date_range',
      'status',
      'show_aging_table',
      'show_credits_table',
      'show_payments_table',
      'only_clients_with_invoices',
      'clients',
    ],
    email_record: ['entity', 'entity_id'],
    email_report: ['report_name', ...getReportParametersProperties()],
  };

  return templateParametersProperties;
}

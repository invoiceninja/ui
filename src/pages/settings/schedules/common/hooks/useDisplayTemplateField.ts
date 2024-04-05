/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export type Template = 'email_statement' | 'email_record' | 'email_report';

type TemplateField = 'template' | 'next_run' | 'frequency' | 'remaining_cycles';

const TEMPLATE_FIELDS: Record<Template, TemplateField[]> = {
  email_statement: ['template', 'next_run', 'frequency', 'remaining_cycles'],
  email_record: ['template', 'next_run'],
  email_report: ['template', 'next_run', 'frequency', 'remaining_cycles'],
};

interface Params {
  template: Template;
}
export function useDisplayTemplateField(params: Params) {
  const { template } = params;

  return (filed: TemplateField) => {
    return TEMPLATE_FIELDS[template].includes(filed);
  };
}

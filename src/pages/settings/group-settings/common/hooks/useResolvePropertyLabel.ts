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

export function useResolvePropertyLabel() {
  const [t] = useTranslation();

  const KEYWORD_ALIASES = {
    default_expense_payment_type_id: 'expense_payment_type',
    auto_bill_date: 'auto_bill_on',
    use_credits_payment: 'use_available_credits',
    client_portal_allow_over_payment: 'allow_over_payment',
    client_portal_allow_under_payment: 'allow_under_payment',
    client_portal_under_payment_minimum: 'minimum_under_payment_amount',
    client_initiated_payments_minimum: 'minimum_payment_amount',
    counter_number_applied: 'generate_number',
    recurring_number_prefix: 'recurring_prefix',
    reset_counter_frequency_id: 'reset_counter',
    client_manual_payment_notification: 'manual_payment_email',
    client_online_payment_notification: 'online_payment_email',
    recurring_invoice_number_pattern: `${t('recurring_invoice')} ${t(
      'number_pattern'
    )}`,
    recurring_invoice_number_counter: `${t('recurring_invoice')} ${t(
      'number_counter'
    )}`,
    project_number_pattern: `${t('project')} ${t('number_pattern')}`,
    project_number_counter: `${t('project')} ${t('number_counter')}`,
    recurring_expense_number_pattern: `${t('recurring_expense')} ${t(
      'number_pattern'
    )}`,
    recurring_expense_number_counter: `${t('recurring_expense')} ${t(
      'number_counter'
    )}`,
    purchase_order_number_pattern: `${t('purchase_order')} ${t(
      'number_pattern'
    )}`,
    purchase_order_number_counter: `${t('purchase_order')} ${t(
      'number_counter'
    )}`,
    client_portal_enable_uploads: 'client_document_upload',
    vendor_portal_enable_uploads: 'vendor_document_upload',
    client_portal_terms: 'terms_of_service',
    client_portal_privacy_policy: 'privacy_policy',
    enable_client_portal_password: 'enable_portal_password',
    portal_custom_head: 'header',
    portal_custom_footer: 'footer',
    portal_custom_css: 'custom_css',
    portal_custom_js: 'custom_javascript',
    email_sending_method: 'email_provider',
    mailgun_secret: 'secret',
    mailgun_endpoint: 'endpoint',
    email_from_name: 'from_name',
    entity_send_time: 'send_time',
    tax_name1: 'default_tax_name_1',
    tax_rate1: 'default_tax_rate_1',
    tax_name2: 'default_tax_name_2',
    tax_rate2: 'default_tax_rate_2',
    tax_name3: 'default_tax_name_3',
    tax_rate3: 'default_tax_rate_3',
    enable_client_portal_tasks: 'show_tasks_in_client_portal',
    show_all_tasks_client_portal: 'tasks_shown_in_portal',
    reset_counter_date: 'next_reset',
    accept_client_input_quote_approval: 'accept_purchase_order_number',
    postmark_secret: 'secret',
    invoice_design_id: 'invoice_design',
    quote_design_id: 'quote_design',
    credit_design_id: 'credit_design',
    purchase_order_design_id: 'purchase_order_design',
    company_logo_size: 'logo_size',
    hide_empty_columns_on_pdf: 'empty_columns',
    company_logo: 'logo',
    company_gateway_ids: 'company_gateways',
    num_days_reminder1: 'days',
    num_days_reminder2: 'days',
    num_days_reminder3: 'days',
    late_fee_amount1: 'late_fee_amount',
    late_fee_amount2: 'late_fee_amount',
    late_fee_amount3: 'late_fee_amount',
    late_fee_percent1: 'late_fee_percent',
    late_fee_percent2: 'late_fee_percent',
    late_fee_percent3: 'late_fee_percent',
    schedule_reminder1: 'schedule',
    schedule_reminder2: 'schedule',
    schedule_reminder3: 'schedule',
    enable_reminder1: 'send_email',
    enable_reminder2: 'send_email',
    enable_reminder3: 'send_email',
    endless_reminder_frequency_id: 'frequency',
    enable_reminder_endless: 'send_email',
  };

  return (key: string) => {
    const keywordAlias = KEYWORD_ALIASES[key as keyof typeof KEYWORD_ALIASES];

    if (keywordAlias) {
      return t(keywordAlias);
    }

    return t(key);
  };
}

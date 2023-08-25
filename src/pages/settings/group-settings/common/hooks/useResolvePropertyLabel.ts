/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';

const KEYWORD_ALIASES = [
  { default_expense_payment_type_id: 'expense_payment_type' },
  { auto_bill_date: 'auto_bill_on' },
  { use_credits_payment: 'use_available_credits' },
  { client_portal_allow_over_payment: 'allow_over_payment' },
  { client_portal_allow_under_payment: 'allow_under_payment' },
  { client_portal_under_payment_minimum: 'minimum_under_payment_amount' },
  { client_initiated_payments_minimum: 'minimum_payment_amount' },
  { counter_number_applied: 'generate_number' },
  { recurring_number_prefix: 'recurring_prefix' },
  { reset_counter_frequency_id: 'reset_counter' },
  { client_manual_payment_notification: 'manual_payment_email' },
  { client_online_payment_notification: 'online_payment_email' },
  {
    recurring_invoice_number_pattern: `${trans(
      'recurring_invoice',
      {}
    )} ${trans('number_pattern', {})}`,
  },
  {
    recurring_invoice_number_counter: `${trans(
      'recurring_invoice',
      {}
    )} ${trans('number_counter', {})}`,
  },
  {
    project_number_pattern: `${trans('project', {})} ${trans(
      'number_pattern',
      {}
    )}`,
  },
  {
    project_number_counter: `${trans('project', {})} ${trans(
      'number_counter',
      {}
    )}`,
  },
  {
    recurring_expense_number_pattern: `${trans(
      'recurring_expense',
      {}
    )} ${trans('number_pattern', {})}`,
  },
  {
    recurring_expense_number_counter: `${trans(
      'recurring_expense',
      {}
    )} ${trans('number_counter', {})}`,
  },
  {
    purchase_order_number_pattern: `${trans('purchase_order', {})} ${trans(
      'number_pattern',
      {}
    )}`,
  },
  {
    purchase_order_number_counter: `${trans('purchase_order', {})} ${trans(
      'number_counter',
      {}
    )}`,
  },
  { client_portal_enable_uploads: 'client_document_upload' },
  { vendor_portal_enable_uploads: 'vendor_document_upload' },
  { client_portal_terms: 'terms_of_service' },
  { client_portal_privacy_policy: 'privacy_policy' },
  { enable_client_portal_password: 'enable_portal_password' },
  { portal_custom_head: 'header' },
  { portal_custom_footer: 'footer' },
  { portal_custom_css: 'custom_css' },
  { portal_custom_js: 'custom_javascript' },
  { email_sending_method: 'email_provider' },
  { mailgun_secret: 'secret' },
  { mailgun_endpoint: 'endpoint' },
  { email_from_name: 'from_name' },
  { entity_send_time: 'send_time' },
  { tax_name1: 'default_tax_name_1' },
  { tax_rate1: 'default_tax_rate_1' },
  { tax_name2: 'default_tax_name_2' },
  { tax_rate2: 'default_tax_rate_2' },
  { tax_name3: 'default_tax_name_3' },
  { tax_rate3: 'default_tax_rate_3' },
];

export const useResolvePropertyLabel = () => {
  const [t] = useTranslation();

  return (key: string) => {
    const keywordAlias = KEYWORD_ALIASES.find(
      (keyword) => keyword[key as keyof typeof keyword]
    );

    if (keywordAlias) {
      return t(keywordAlias[key as keyof typeof keywordAlias] as string);
    }

    return t(key);
  };
};

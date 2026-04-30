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

export const LABEL_TRANSLATION_MAP: Record<string, string> = {
  // Core Entity Labels
  '$number_label': 'invoice_number',
  '$date_label': 'invoice_date',
  '$due_date_label': 'due_date',
  '$po_number_label': 'po_number',
  '$amount_label': 'amount',
  '$balance_label': 'balance',
  '$partial_label': 'partial_deposit',
  '$subtotal_label': 'subtotal',
  '$discount_label': 'discount',
  '$taxes_label': 'taxes',
  '$total_label': 'total',
  '$paid_to_date_label': 'paid_to_date',
  '$balance_due_label': 'balance_due',
  '$entity_label': 'invoice',
  
  // Client Labels
  '$client.name_label': 'client_name',
  '$client.number_label': 'client_number',
  '$client.email_label': 'email',
  '$client.phone_label': 'phone',
  '$client.address1_label': 'address1',
  '$client.address2_label': 'address2',
  '$client.city_label': 'city',
  '$client.state_label': 'state',
  '$client.postal_code_label': 'postal_code',
  '$client.postal_city_state_label': 'postal_city_state',
  '$client.city_state_postal_label': 'city_state_postal',
  '$client.country_label': 'country',
  '$client.vat_number_label': 'vat_number',
  '$client.id_number_label': 'id_number',
  '$client.website_label': 'website',
  '$client.balance_label': 'client_balance',
  '$client.location_name_label': 'location_name',
  '$client.custom1_label': 'custom1',
  '$client.custom2_label': 'custom2',
  '$client.custom3_label': 'custom3',
  '$client.custom4_label': 'custom4',
  
  // Company Labels
  '$company.name_label': 'company_name',
  '$company.email_label': 'email',
  '$company.phone_label': 'phone',
  '$company.address1_label': 'address1',
  '$company.address2_label': 'address2',
  '$company.city_label': 'city',
  '$company.state_label': 'state',
  '$company.postal_code_label': 'postal_code',
  '$company.postal_city_state_label': 'postal_city_state',
  '$company.city_state_postal_label': 'city_state_postal',
  '$company.country_label': 'country',
  '$company.vat_number_label': 'vat_number',
  '$company.id_number_label': 'id_number',
  '$company.website_label': 'website',
  '$company.custom1_label': 'custom1',
  '$company.custom2_label': 'custom2',
  '$company.custom3_label': 'custom3',
  '$company.custom4_label': 'custom4',
  
  // Product/Item Labels
  '$product.product_key_label': 'item',
  '$product.description_label': 'description',
  '$product.notes_label': 'description',
  '$product.quantity_label': 'qty',
  '$product.unit_cost_label': 'unit_cost',
  '$product.line_total_label': 'line_total',
  '$product.discount_label': 'discount',
  '$product.tax_name1_label': 'tax',
  '$product.tax_name2_label': 'tax',
  '$product.tax_name3_label': 'tax',
  
  // Contact Labels
  '$contact.first_name_label': 'first_name',
  '$contact.last_name_label': 'last_name',
  '$contact.full_name_label': 'full_name',
  '$contact.email_label': 'email',
  '$contact.phone_label': 'phone',
  '$contact.name_label': 'contact',
  '$contact.custom1_label': 'contact_custom_value1',
  '$contact.custom2_label': 'contact_custom_value2',
  '$contact.custom3_label': 'contact_custom_value3',
  '$contact.custom4_label': 'contact_custom_value4',

  // Location Labels
  '$location.name_label': 'location_name',
  '$location.address1_label': 'address1',
  '$location.address2_label': 'address2',
  '$location.city_label': 'city',
  '$location.state_label': 'state',
  '$location.postal_code_label': 'postal_code',
  '$location.country_label': 'country',
  '$location.custom1_label': 'custom1',
  '$location.custom2_label': 'custom2',
  '$location.custom3_label': 'custom3',
  '$location.custom4_label': 'custom4',

  // Invoice / Entity Labels
  '$entity.custom1_label': 'custom1',
  '$entity.custom2_label': 'custom2',
  '$entity.custom3_label': 'custom3',
  '$entity.custom4_label': 'custom4',
  '$invoice.custom1_label': 'custom1',
  '$invoice.custom2_label': 'custom2',
  '$invoice.custom3_label': 'custom3',
  '$invoice.custom4_label': 'custom4',

  // Task Labels
  '$task.description_label': 'description',
  '$task.hours_label': 'hours',
  '$task.rate_label': 'rate',
  '$task.service_label': 'service',
  '$task.line_total_label': 'line_total',
};

export function isLabelVariable(variable: string): boolean {
  return variable.endsWith('_label');
}

export function getLabelVariable(fieldVariable: string): string {
  return `${fieldVariable}_label`;
}

export function getFieldVariable(labelVariable: string): string | undefined {
  if (!labelVariable.endsWith('_label')) {
    return undefined;
  }
  return labelVariable.replace('_label', '');
}

export function getLabelTranslationKey(labelVariable: string): string | undefined {
  return LABEL_TRANSLATION_MAP[labelVariable];
}

export function useLabelMapping() {
  const [t] = useTranslation();

  const getDisplayLabel = (labelVariable: string): string => {
    const translationKey = LABEL_TRANSLATION_MAP[labelVariable];
    
    if (translationKey) {
      return t(translationKey);
    }

    return labelVariable;
  };

  return {
    getDisplayLabel,
    isLabelVariable,
    getLabelVariable,
    getFieldVariable,
    getLabelTranslationKey,
    LABEL_TRANSLATION_MAP,
  };
}

export function getSampleLabelValue(labelVariable: string, t: (key: string) => string): string {
  const translationKey = LABEL_TRANSLATION_MAP[labelVariable];
  
  if (translationKey) {
    return t(translationKey);
  }

  return labelVariable;
}

/**
 * Replace all label variables in a string with their translated values
 * Example: "$number_label: $date_label" -> "Invoice Number: Invoice Date"
 */
export function replaceLabelVariables(text: string, t: (key: string) => string): string {
  return text.replace(/\$[\w.]+_label\b/g, match => getSampleLabelValue(match, t));
}

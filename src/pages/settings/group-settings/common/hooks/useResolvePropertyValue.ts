/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { useResolveDateFormat } from '$app/common/hooks/useResolveDateFormat';
import { useResolveLanguage } from '$app/common/hooks/useResolveLanguage';
import { useResolvePaymentTerm } from '$app/common/hooks/useResolvePaymentTerm';
import { useResolvePaymentType } from '$app/common/hooks/useResolvePaymentType';
import { useResolveTimeZone } from '$app/common/hooks/useResolveTimeZone';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveDesign } from '$app/common/hooks/useResolveDesign';
import {
  COUNTER_PADDINGS,
  RESECT_COUNTER_FREQUENCIES,
} from '$app/pages/settings/generated-numbers/components/Settings';
import { useResolveGateway } from '$app/common/hooks/useResolveGateway';
import frequencies from '$app/common/constants/frequency';

export const useResolvePropertyValue = () => {
  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const resolveCountry = useResolveCountry();
  const resolveCurrency = useResolveCurrency();
  const resolvePaymentType = useResolvePaymentType();
  const resolvePaymentTerm = useResolvePaymentTerm({
    resolveWithNumDays: true,
  });
  const resolveLanguage = useResolveLanguage();
  const resolveTimeZone = useResolveTimeZone();
  const resolveDateFormat = useResolveDateFormat();
  const resolveDesign = useResolveDesign();
  const resolveGateway = useResolveGateway();

  const PROPERTY_CUSTOMIZED_VALUES = {
    country_id: (countryId: string) => resolveCountry(countryId)?.name,
    currency_id: (currencyId: string) => resolveCurrency(currencyId)?.name,
    payment_type_id: (paymentTypeId: string) =>
      resolvePaymentType(paymentTypeId)?.name,
    valid_until: (numDays: string) => resolvePaymentTerm(numDays)?.name,
    default_expense_payment_type_id: (paymentTypeId: string) =>
      resolvePaymentType(paymentTypeId)?.name,
    language_id: (languageId: string) => resolveLanguage(languageId)?.name,
    timezone_id: (timeZoneId: string) => resolveTimeZone(timeZoneId)?.name,
    date_format_id: (dateFormatId: string) =>
      dayjs().format(resolveDateFormat(dateFormatId)?.format_moment),
    payment_terms: (numDays: string) => resolvePaymentTerm(numDays)?.name,
    reset_counter_date: (dateValue: string) => date(dateValue, dateFormat),
    entity_send_time: (hour: string) =>
      dayjs().startOf('day').add(Number(hour), 'hour').format('h:ss A'),
    email_sending_method: (provider: string) => {
      if (provider === 'gmail') {
        return 'Gmail';
      } else if (provider === 'office365') {
        return 'Microsoft';
      } else if (provider === 'client_postmark') {
        return 'Postmark';
      } else if (provider === 'client_mailgun') {
        return 'Mailgun';
      }
      return t('default');
    },
    page_numbering_alignment: (alignment: string) => {
      if (alignment === 'C') {
        return t('center');
      } else if (alignment === 'R') {
        return t('right');
      }
      return t('left');
    },
    invoice_design_id: (designId: string) => resolveDesign(designId)?.name,
    quote_design_id: (designId: string) => resolveDesign(designId)?.name,
    credit_design_id: (designId: string) => resolveDesign(designId)?.name,
    purchase_order_design_id: (designId: string) =>
      resolveDesign(designId)?.name,
    counter_padding: (paddingId: string) =>
      COUNTER_PADDINGS.find((_, index) => index + 1 === Number(paddingId)),
    reset_counter_frequency_id: (frequencyId: string) =>
      t(
        RESECT_COUNTER_FREQUENCIES.find(
          (_, index) => index === Number(frequencyId)
        ) || ''
      ),
    company_logo: () => t('enabled'),
    company_gateway_ids: (gatewayIds: string) =>
      gatewayIds
        .split(',')
        .map((gatewayId) => resolveGateway(gatewayId)?.label)
        .join(', '),
    tax_rate1: (taxRate: string) => `${taxRate} %`,
    tax_rate2: (taxRate: string) => `${taxRate} %`,
    tax_rate3: (taxRate: string) => `${taxRate} %`,
    default_task_rate: (taxRate: string) => `${taxRate} %`,
    late_fee_percent1: (fee: string) => `${fee} %`,
    late_fee_percent2: (fee: string) => `${fee} %`,
    late_fee_percent3: (fee: string) => `${fee} %`,
    endless_reminder_frequency_id: (frequencyId: string) =>
      t(frequencies[frequencyId as keyof typeof frequencies]),
  };

  return (key: string, value: string | boolean) => {
    const resolvingFunction =
      PROPERTY_CUSTOMIZED_VALUES?.[
        key as keyof typeof PROPERTY_CUSTOMIZED_VALUES
      ];

    if (resolvingFunction) {
      return resolvingFunction(value as string) || '';
    }

    if (typeof value === 'boolean') {
      return value ? t('enabled') : t('disabled');
    }

    return t(value);
  };
};

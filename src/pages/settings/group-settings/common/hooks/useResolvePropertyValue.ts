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

export const useResolvePropertyValue = () => {
  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const resolveCountry = useResolveCountry();
  const resolveCurrency = useResolveCurrency();
  const resolvePaymentType = useResolvePaymentType();
  const resolvePaymentTerm = useResolvePaymentTerm();
  const resolveLanguage = useResolveLanguage();
  const resolveTimeZone = useResolveTimeZone();
  const resolveDateFormat = useResolveDateFormat();

  const PROPERTY_CUSTOMIZED_VALUES = [
    { country_id: (countryId: string) => resolveCountry(countryId)?.name },
    { currency_id: (currencyId: string) => resolveCurrency(currencyId)?.name },
    {
      payment_type_id: (paymentTypeId: string) =>
        resolvePaymentType(paymentTypeId)?.name,
    },
    {
      valid_until: (numDays: string) =>
        resolvePaymentTerm(Number(numDays))?.name,
    },
    {
      default_expense_payment_type_id: (paymentTypeId: string) =>
        resolvePaymentType(paymentTypeId)?.name,
    },
    {
      language_id: (languageId: string) => resolveLanguage(languageId)?.name,
    },
    {
      timezone_id: (timeZoneId: string) => resolveTimeZone(timeZoneId)?.name,
    },
    {
      date_format_id: (dateFormatId: string) =>
        dayjs().format(resolveDateFormat(dateFormatId)?.format_moment),
    },
    {
      payment_terms: (numDays: string) =>
        resolvePaymentTerm(Number(numDays))?.name,
    },
    {
      reset_counter_date: (dateValue: string) => date(dateValue, dateFormat),
    },
    {
      entity_send_time: (hour: string) =>
        dayjs().startOf('day').add(Number(hour), 'hour').format('h:ss A'),
    },
    {
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
    },
  ];

  return (key: string, value: string | boolean) => {
    const propertyValue = PROPERTY_CUSTOMIZED_VALUES.find(
      (property) => property[key as keyof typeof property]
    );

    const resolvingFunction =
      propertyValue?.[key as keyof typeof propertyValue];

    if (resolvingFunction) {
      return resolvingFunction(value as string) || '';
    }

    if (typeof value === 'boolean') {
      return value ? t('enabled') : t('disabled');
    }

    return t(value);
  };
};

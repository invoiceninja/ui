/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useLogo } from '$app/common/hooks/useLogo';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { htmlToPlainText } from '$app/common/helpers/html-string';
import { Settings } from '$app/common/interfaces/company.interface';
import { InvoiceData, SAMPLE_INVOICE_DATA } from '../utils/variable-replacer';

function trimToValue(value: string | undefined | null): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function withFallback(
  value: string | undefined | null,
  fallback: string
): string {
  return trimToValue(value) ?? fallback;
}

function withHtmlFallback(
  value: string | undefined | null,
  fallback: string
): string {
  return withFallback(htmlToPlainText(value ?? ''), fallback);
}

function joinParts(
  parts: Array<string | undefined>,
  separator: string
): string | undefined {
  const present = parts
    .map((part) => trimToValue(part))
    .filter((part): part is string => Boolean(part));

  return present.length > 0 ? present.join(separator) : undefined;
}

function formatCityStatePostal(
  city?: string,
  state?: string,
  postal?: string
): string | undefined {
  return joinParts([joinParts([city, state], ', '), postal], ' ');
}

function formatPostalCityState(
  city?: string,
  state?: string,
  postal?: string
): string | undefined {
  return joinParts([postal, joinParts([city, state], ', ')], ' ');
}

function overlayCompany(
  settings: Settings | undefined,
  companyLogo: string,
  countryName?: string,
  countryIso?: string
): InvoiceData['company'] {
  const sample = SAMPLE_INVOICE_DATA.company;

  return {
    ...sample,
    name: withFallback(settings?.name, sample.name),
    logo: companyLogo || sample.logo,
    address: withFallback(settings?.address1, sample.address),
    address1: withFallback(settings?.address1, sample.address1),
    address2: withFallback(settings?.address2, sample.address2),
    city: withFallback(settings?.city, sample.city),
    state: withFallback(settings?.state, sample.state),
    postal_code: withFallback(settings?.postal_code, sample.postal_code),
    postal_city: withFallback(
      joinParts([settings?.postal_code, settings?.city], ' '),
      sample.postal_city
    ),
    city_state_postal: withFallback(
      formatCityStatePostal(
        settings?.city,
        settings?.state,
        settings?.postal_code
      ),
      sample.city_state_postal
    ),
    postal_city_state: withFallback(
      formatPostalCityState(
        settings?.city,
        settings?.state,
        settings?.postal_code
      ),
      sample.postal_city_state
    ),
    country: withFallback(countryName, sample.country),
    country_2: withFallback(countryIso, sample.country_2),
    classification: withFallback(settings?.classification, sample.classification),
    id_number: withFallback(settings?.id_number, sample.id_number),
    phone: withFallback(settings?.phone, sample.phone),
    email: withFallback(settings?.email, sample.email),
    website: withFallback(settings?.website, sample.website),
    vat_number: withFallback(settings?.vat_number, sample.vat_number),
    custom_value1: withFallback(settings?.custom_value1, sample.custom_value1),
    custom_value2: withFallback(settings?.custom_value2, sample.custom_value2),
    custom_value3: withFallback(settings?.custom_value3, sample.custom_value3),
    custom_value4: withFallback(settings?.custom_value4, sample.custom_value4),
  };
}

export function useSampleInvoiceData(): InvoiceData {
  const company = useCurrentCompany();
  const user = useCurrentUser();
  const companyLogo = useLogo();
  const resolveCountry = useResolveCountry();

  const settings = company?.settings;
  const country = settings?.country_id
    ? resolveCountry(settings.country_id)
    : undefined;

  return useMemo(() => {
    const sample = SAMPLE_INVOICE_DATA;
    const userName = joinParts([user?.first_name, user?.last_name], ' ');

    return {
      ...sample,
      invoice: {
        ...sample.invoice,
        terms: withHtmlFallback(settings?.invoice_terms, sample.invoice.terms),
        footer: withHtmlFallback(settings?.invoice_footer, sample.invoice.footer),
        term_days: withFallback(settings?.payment_terms, sample.invoice.term_days),
      },
      company: overlayCompany(
        settings,
        companyLogo,
        country?.name,
        country?.iso_3166_2
      ),
      user: {
        name: withFallback(userName, sample.user.name),
        first_name: withFallback(user?.first_name, sample.user.first_name),
        last_name: withFallback(user?.last_name, sample.user.last_name),
        signature: withHtmlFallback(
          user?.signature,
          withFallback(userName, sample.user.signature)
        ),
      },
    };
  }, [companyLogo, country?.iso_3166_2, country?.name, settings, user]);
}

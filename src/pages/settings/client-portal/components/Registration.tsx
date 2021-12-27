/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

export function Registration() {
  const [t] = useTranslation();

  const fields = [
    { field: 'first_name', label: t('first_name') },
    { field: 'last_name', label: t('last_name') },
    { field: 'email', label: t('email') },
    { field: 'phone', label: t('phone') },
    { field: 'password', label: t('password') },
    { field: 'name', label: t('name') },
    { field: 'website', label: t('website') },
    { field: 'address1', label: t('address1') },
    { field: 'address2', label: t('address2') },
    { field: 'city', label: t('city') },
    { field: 'state', label: t('state') },
    { field: 'postal_code', label: t('postal_code') },
    { field: 'country', label: t('country') },
    { field: 'custom1', label: t('custom1') },
    { field: 'custom2', label: t('custom2') },
    { field: 'custom3', label: t('custom3') },
    { field: 'custom4', label: t('custom4') },
    { field: 'public_notes', label: t('public_notes') },
    { field: 'vat_number', label: t('vat_number') },
  ];

  return (
    <Card title={t('registration')}>
      <Element
        leftSide={t('client_registration')}
        leftSideHelp={t('client_registration_help')}
      >
        <Toggle />
      </Element>

      <div className="pt-4 border-b"></div>

      {fields.map((field) => (
        <Element key={field.field} leftSide={field.label}>
          <Toggle id={field.field} />
        </Element>
      ))}
    </Card>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway } from 'common/interfaces/statics';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RequiredFields(props: Props) {
  const [t] = useTranslation();

  const handleChange = (property: keyof CompanyGateway, value: boolean) => {
    props.setCompanyGateway(
      (current) => current && { ...current, [property]: value }
    );
  };

  return (
    <Card title={t('required_fields')}>
      <Element leftSide={t('client_name')}>
        <Toggle
          value={props.companyGateway.require_client_name}
          onChange={(value) => handleChange('require_client_name', value)}
        />
      </Element>

      <Element leftSide={t('client_phone')}>
        <Toggle
          value={props.companyGateway.require_client_phone}
          onChange={(value) => handleChange('require_client_phone', value)}
        />
      </Element>

      <Element leftSide={t('contact_name')}>
        <Toggle
          value={props.companyGateway.require_contact_name}
          onChange={(value) => handleChange('require_contact_name', value)}
        />
      </Element>

      <Element leftSide={t('contact_email')}>
        <Toggle
          value={props.companyGateway.require_contact_email}
          onChange={(value) => handleChange('require_contact_email', value)}
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <Toggle
          value={props.companyGateway.require_postal_code}
          onChange={(value) => handleChange('require_postal_code', value)}
        />
      </Element>

      <Element leftSide={t('cvv')}>
        <Toggle
          value={props.companyGateway.require_cvv}
          onChange={(value) => handleChange('require_cvv', value)}
        />
      </Element>

      <Element leftSide={t('billing_address')}>
        <Toggle
          value={props.companyGateway.require_billing_address}
          onChange={(value) => handleChange('require_billing_address', value)}
        />
      </Element>

      <Element leftSide={t('shipping_address')}>
        <Toggle
          value={props.companyGateway.require_shipping_address}
          onChange={(value) => handleChange('require_shipping_address', value)}
        />
      </Element>

      <Divider />

      <Element leftSide={t('update_address')}>
        <Toggle
          label={t('update_address_help')}
          value={props.companyGateway.update_details}
          onChange={(value) => handleChange('update_details', value)}
        />
      </Element>
    </Card>
  );
}

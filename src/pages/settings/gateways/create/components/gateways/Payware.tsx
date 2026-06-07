/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTranslation } from 'react-i18next';
import { formatLabel } from '../../helpers/format-label';
import { useHandleCredentialsChange } from '../../hooks/useHandleCredentialsChange';
import { useResolveConfigValue } from '../../hooks/useResolveConfigValue';
import { Field, useResolveInputField } from '../../hooks/useResolveInputField';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
  errors: ValidationBag | undefined;
}

const TEXT_FIELDS = ['partnerId', 'vposId'];
const TTL_FIELD = 'timeToLive';
const TTL_MIN = 60;
const TTL_MAX = 600;
const TTL_DEFAULT = '600';

export function Payware(props: Props) {
  const [t] = useTranslation();

  const config = useResolveConfigValue(props.companyGateway);
  const handleCredentialChange = useHandleCredentialsChange(
    props.setCompanyGateway
  );
  const resolveInputField = useResolveInputField(
    props.companyGateway,
    props.setCompanyGateway
  );

  const fieldLabels: Record<string, string> = {
    partnerId: t('payware_partner_id_label'),
    vposId: t('payware_vpos_id_label'),
  };

  const fieldHelp: Record<string, string> = {
    partnerId: t('payware_partner_id_help'),
    vposId: t('payware_vpos_id_help'),
    paywarePublicKey: t('payware_public_key_help'),
  };

  const fields = Object.keys(JSON.parse(props.gateway.fields));

  return (
    <>
      {fields.map((field, index) => {
        if (field === TTL_FIELD) {
          return (
            <Element
              key={index}
              leftSide={t('payment_period')}
              leftSideHelp={t('payment_period_help')}
            >
              <InputField
                type="number"
                value={config(field) || TTL_DEFAULT}
                onValueChange={(value) => {
                  const clamped = Math.max(
                    TTL_MIN,
                    Math.min(TTL_MAX, parseInt(value) || parseInt(TTL_DEFAULT))
                  );
                  handleCredentialChange(
                    field as keyof Field,
                    clamped.toString()
                  );
                }}
                errorMessage={props.errors?.errors[field]}
              />
            </Element>
          );
        }

        return (
          <Element
            key={index}
            leftSide={fieldLabels[field] ?? formatLabel(field)}
            {...(fieldHelp[field] ? { leftSideHelp: fieldHelp[field] } : {})}
          >
            {TEXT_FIELDS.includes(field) ? (
              <InputField
                type="text"
                value={config(field)}
                onValueChange={(value) =>
                  handleCredentialChange(field as keyof Field, value)
                }
                errorMessage={props.errors?.errors[field]}
              />
            ) : (
              resolveInputField(
                field,
                JSON.parse(props.gateway.fields)[field],
                props.errors
              )
            )}
          </Element>
        );
      })}
    </>
  );
}

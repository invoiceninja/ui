/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';

interface Props {
  errors: ValidationBag | undefined;
  isFormBusy: boolean;
}

export function SMTPMailDriver({ errors, isFormBusy }: Props) {
  const [t] = useTranslation();

  const company = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <>
      <Element leftSide={t('host')} leftSideHelp={t('host_help')}>
        <InputField
          value={company?.smtp_host || ''}
          onValueChange={(value) => handleChange('smtp_host', value)}
          disabled={isFormBusy}
          errorMessage={errors?.errors.smtp_host}
        />
      </Element>

      <Element leftSide={t('port')} leftSideHelp={t('port_help')}>
        <InputField
          value={company?.smtp_port || ''}
          onValueChange={(value) => handleChange('smtp_port', value)}
          disabled={isFormBusy}
          errorMessage={errors?.errors.smtp_port}
        />
      </Element>

      <Element leftSide={t('encryption')}>
        <SelectField
          value={company?.smtp_encryption || ''}
          onValueChange={(value) => handleChange('smtp_encryption', value)}
          withBlank
          disabled={isFormBusy}
          errorMessage={errors?.errors.smtp_encryption}
          customSelector
        >
          <option value="tls">STARTTLS</option>
          <option value="ssl">SSL/TLS</option>
        </SelectField>
      </Element>

      <Element leftSide={t('username')}>
        <InputField
          value={company?.smtp_username || ''}
          onValueChange={(value) => handleChange('smtp_username', value)}
          disabled={isFormBusy}
          errorMessage={errors?.errors.smtp_username}
        />
      </Element>

      <Element leftSide={t('password')}>
        <InputField
          value={company?.smtp_password || ''}
          onValueChange={(value) => handleChange('smtp_password', value)}
          disabled={isFormBusy}
          errorMessage={errors?.errors.smtp_password}
        />
      </Element>

      <Element
        leftSide={t('local_domain')}
        leftSideHelp={t('local_domain_help')}
      >
        <InputField
          value={company?.smtp_local_domain || ''}
          onValueChange={(value) => handleChange('smtp_local_domain', value)}
          disabled={isFormBusy}
          errorMessage={errors?.errors.smtp_local_domain}
        />
      </Element>

      <Element
        leftSide={t('bcc_email')}
        leftSideHelp={t('comma_sparated_list')}
      >
        <InputField
          value={company?.settings.bcc_email || ''}
          onValueChange={(value) => handleChange('settings.bcc_email', value)}
        />
      </Element>

      <Element leftSide={t('send_time')}>
        <SelectField
          value={company?.settings.entity_send_time?.toString() || ''}
          onValueChange={(value) =>
            handleChange(
              'settings.entity_send_time',
              value.length > 0 ? value : 6
            )
          }
          withBlank
          customSelector
        >
          {[...Array(24).keys()].map((number, index) => (
            <option key={index} value={(number + 1).toString()}>
              {dayjs()
                .startOf('day')
                .add(number + 1, 'hour')
                .format('h:ss A')}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('verify_peer')}>
        <Toggle
          checked={company?.smtp_verify_peer ?? true}
          onValueChange={(value) => handleChange('smtp_verify_peer', value)}
          disabled={isFormBusy}
        />
      </Element>
    </>
  );
}

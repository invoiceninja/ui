/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Element } from '$app/components/cards';
import { Button, InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function SMTPMailDriver() {
  const [t] = useTranslation();

  const company = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleTestConfiguration = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/smtp/check'), {
        smtp_host: company?.smtp_host || '',
        smtp_port: company?.smtp_port || '',
        smtp_encryption: company?.smtp_encryption || '',
        smtp_username: company?.smtp_username || '',
        smtp_password: company?.smtp_password || '',
        smtp_local_domain: company?.smtp_local_domain || '',
        smtp_verify_peer: company?.smtp_verify_peer ?? true,
      })
        .then((response) => toast.success(response.data.message))
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <>
      <Element leftSide={t('host')}>
        <InputField
          value={company?.smtp_host || ''}
          onValueChange={(value) => handleChange('smtp_host', value)}
          disabled={isFormBusy}
        />
      </Element>

      <Element leftSide={t('port')}>
        <InputField
          value={company?.smtp_port || ''}
          onValueChange={(value) => handleChange('smtp_port', value)}
          disabled={isFormBusy}
        />
      </Element>

      <Element leftSide={t('encryption')}>
        <SelectField
          value={company?.smtp_encryption || ''}
          onValueChange={(value) => handleChange('smtp_encryption', value)}
          withBlank
          disabled={isFormBusy}
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
        />
      </Element>

      <Element leftSide={t('password')}>
        <InputField
          value={company?.smtp_password || ''}
          onValueChange={(value) => handleChange('smtp_password', value)}
          disabled={isFormBusy}
        />
      </Element>

      <Element leftSide={t('local_domain')}>
        <InputField
          value={company?.smtp_local_domain || ''}
          onValueChange={(value) => handleChange('smtp_local_domain', value)}
          disabled={isFormBusy}
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
          value={company?.settings.entity_send_time || ''}
          onValueChange={(value) =>
            handleChange(
              'settings.entity_send_time',
              value.length > 0 ? value : 6
            )
          }
          withBlank
        >
          {[...Array(24).keys()].map((number, index) => (
            <option key={index} value={number + 1}>
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

      <Element pushContentToRight>
        <Button
          behavior="button"
          onClick={handleTestConfiguration}
          disableWithoutIcon
          disabled={isFormBusy}
        >
          {t('send_test_email')}
        </Button>
      </Element>
    </>
  );
}

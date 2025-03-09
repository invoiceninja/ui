/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { Card, Element } from '../../../../components/cards';
import { Button, SelectField } from '../../../../components/forms';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useNavigate } from 'react-router-dom';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';

export function SecuritySettings() {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);

  const navigate = useNavigate();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [isSessionsLogoutBusy, setIsSessionsLogoutBusy] =
    useState<boolean>(false);

  const options = [
    {
      value: 1800000,
      label: route(t('count_minutes'), { count: '30' }),
    },
    {
      value: 7200000,
      label: route(t('count_hours'), { count: '2' }),
    },
    {
      value: 28800000,
      label: route(t('count_hours'), { count: '8' }),
    },
    {
      value: 86400000,
      label: route(t('count_day'), { count: '1' }),
    },
    {
      value: 604800000,
      label: route(t('count_days'), { count: '7' }),
    },
    {
      value: 2592000000,
      label: route(t('count_days'), { count: '30' }),
    },
    {
      value: 0,
      label: t('never'),
    },
  ];

  const handleLogoutAllSessions = () => {
    if (!isSessionsLogoutBusy) {
      setIsSessionsLogoutBusy(true);

      request('POST', endpoint('/api/v1/logout'))
        .then(() => {
          toast.success('success');
          navigate('/logout');
        })
        .finally(() => setIsSessionsLogoutBusy(false));
    }
  };

  return (
    <Card title={t('security_settings')}>
      {/* <Element leftSide={t('password_timeout')}>
        <SelectField
          id="default_password_timeout"
          value={companyChanges?.default_password_timeout}
          onChange={handleChange}
          errorMessage={errors?.errors.default_password_timeout}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element> */}

      <Element leftSide={t('web_session_timeout')}>
        <SelectField
          value={companyChanges?.session_timeout}
          onValueChange={(value) => handleChange('session_timeout', value)}
          errorMessage={errors?.errors.session_timeout}
          customSelector
          dismissable={false}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      {/* <Element leftSide={t('require_password_with_social_login')}>
        <Toggle
          checked={companyChanges?.oauth_password_required}
          id="oauth_password_required"
          onChange={(value: boolean) =>
            handleToggleChange('oauth_password_required', value)
          }
        />
      </Element> */}

      <Element
        leftSide={t('end_all_sessions')}
        leftSideHelp={t('end_all_sessions_help')}
      >
        <Button
          behavior="button"
          type="secondary"
          onClick={handleLogoutAllSessions}
          disabled={isSessionsLogoutBusy}
          disableWithoutIcon
        >
          {t('logout')}
        </Button>
      </Element>
    </Card>
  );
}

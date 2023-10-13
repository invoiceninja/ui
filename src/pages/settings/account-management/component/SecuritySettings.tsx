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
import { updateChanges } from '$app/common/stores/slices/company-users';
import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { route } from '$app/common/helpers/route';
import { Card, Element } from '../../../../components/cards';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { SearchableSelect } from '$app/components/SearchableSelect';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';

export function SecuritySettings() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const options = [
    {
      value: 1_800_000,
      label: route(t('count_minutes'), { count: '30' }),
    },
    {
      value: 7_200_000,
      label: route(t('count_hours'), { count: '2' }),
    },
    {
      value: 28_800_000,
      label: route(t('count_hours'), { count: '8' }),
    },
    {
      value: 86_400_000,
      label: route(t('count_day'), { count: '1' }),
    },
    {
      value: 604_800_000,
      label: route(t('count_days'), { count: '7' }),
    },
    {
      value: 2_592_000_000,
      label: route(t('count_days'), { count: '30' }),
    },
    {
      value: 0,
      label: t('never'),
    },
  ];

  const handleToggleChange = (id: string, value: boolean) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  const handleChange = useHandleCurrentCompanyChangeProperty()

  return (
    <Card title={t('security_settings')}>
      <Element leftSide={t('password_timeout')}>
        <SearchableSelect
          value={companyChanges?.default_password_timeout}
          errorMessage={errors?.errors.default_password_timeout}
          onValueChange={(v) => handleChange('default_password_timeout', v)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SearchableSelect>
      </Element>

      <Element leftSide={t('web_session_timeout')}>
        <SearchableSelect
          value={companyChanges?.session_timeout}
          onValueChange={(v) => handleChange('session_timeout', v)}
          errorMessage={errors?.errors.session_timeout}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SearchableSelect>
      </Element>

      <Element leftSide={t('require_password_with_social_login')}>
        <Toggle
          checked={companyChanges?.oauth_password_required}
          id="oauth_password_required"
          onChange={(value: boolean) =>
            handleToggleChange('oauth_password_required', value)
          }
        />
      </Element>
    </Card>
  );
}

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
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';

export function Quotes() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const disableSettingsField = useDisableSettingsField();

  const handleToggleChange = (id: string, value: boolean) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  return (
    <Card title={t('quotes')}>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="auto_convert_quote"
            labelElement={
              <SettingsLabel
                label={t('auto_convert_quote')}
                helpLabel={t('auto_convert_quote_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(companyChanges?.settings?.auto_convert_quote)}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_convert_quote', value)
          }
          disabled={disableSettingsField('auto_convert_quote')}
        />
      </Element>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="auto_archive_quote"
            labelElement={
              <SettingsLabel
                label={t('auto_archive_quote')}
                helpLabel={t('auto_archive_quote_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(companyChanges?.settings?.auto_archive_quote)}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_quote', value)
          }
          disabled={disableSettingsField('auto_archive_quote')}
        />
      </Element>

      {isCompanySettingsActive && (
        <Element
          leftSide={t('use_quote_terms')}
          leftSideHelp={t('use_quote_terms_help')}
        >
          <Toggle
            checked={Boolean(companyChanges?.use_quote_terms_on_conversion)}
            onChange={(value: boolean) =>
              handleToggleChange('use_quote_terms_on_conversion', value)
            }
          />
        </Element>
      )}
    </Card>
  );
}

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
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';

export function Quotes() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

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
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="auto_convert_quote" />
            )}

            <div className="flex flex-col">
              <span>{t('auto_convert_quote')}</span>
              <span className="text-xs text-gray-500">
                {t('auto_convert_quote_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof companyChanges?.settings?.auto_convert_quote ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(companyChanges?.settings?.auto_convert_quote)}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_convert_quote', value)
          }
        />
      </Element>
      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="auto_archive_quote" />
            )}

            <div className="flex flex-col">
              <span>{t('auto_archive_quote')}</span>
              <span className="text-xs text-gray-500">
                {t('auto_archive_quote_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof companyChanges?.settings?.auto_archive_quote ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(companyChanges?.settings?.auto_archive_quote)}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_quote', value)
          }
        />
      </Element>
    </Card>
  );
}

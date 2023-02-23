/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RootState } from 'common/stores/store';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { updateChanges } from 'common/stores/slices/user';

export function Preferences() {
  const [t] = useTranslation();
  const reactSettingsChanges = useSelector(
    (state: RootState) => state.user.changes?.company_user?.react_settings
  );
  const dispatch = useDispatch();

  const handleChange = (property: string, value: string | boolean) => {
    dispatch(
      updateChanges({
        property: property,
        value: value,
      })
    );
  };

  return (
    <Card title={t('preferences')}>
      <Element leftSide={t('show_pdf_preview')}>
        <Toggle
          checked={
            reactSettingsChanges.show_pdf_preview === true ||
            typeof reactSettingsChanges.show_pdf_preview === 'undefined'
          }
          onValueChange={(value) =>
            handleChange('company_user.react_settings.show_pdf_preview', value)
          }
        />
      </Element>
    </Card>
  );
}

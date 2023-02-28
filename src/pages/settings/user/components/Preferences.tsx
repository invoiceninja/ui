/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { updateChanges } from 'common/stores/slices/user';
import { useReactSettings } from 'common/hooks/useReactSettings';

export function Preferences() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const reactSettings = useReactSettings();

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
          checked={reactSettings.show_pdf_preview}
          onValueChange={(value) =>
            handleChange('company_user.react_settings.show_pdf_preview', value)
          }
        />
      </Element>
    </Card>
  );
}

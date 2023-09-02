/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { updateChanges } from '$app/common/stores/slices/user';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { InputField } from '$app/components/forms';

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
          checked={
            typeof reactSettings.show_pdf_preview === 'boolean'
              ? reactSettings.show_pdf_preview
              : true
          }
          onValueChange={(value) =>
            handleChange('company_user.react_settings.show_pdf_preview', value)
          }
        />
      </Element>

      <Element leftSide={t('show_document_preview')}>
        <Toggle
          checked={reactSettings.show_document_preview}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.show_document_preview',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('react_notification_link')}
        leftSideHelp={t('react_notification_link_help')}
      >
        <Toggle
          checked={reactSettings.react_notification_link}
          onValueChange={(value) =>
            handleChange(
              'company_user.react_settings.react_notification_link',
              value
            )
          }
        />
      </Element>

      <Element
        leftSide={t('number_precision')}
        leftSideHelp={t('number_precision_help')}
      >
        <InputField
          value={reactSettings?.number_precision}
          onValueChange={(value) =>
            handleChange('company_user.react_settings.number_precision', value)
          }
          type="number"
          placeholder={t('number_precision')}
        />
      </Element>
    </Card>
  );
}

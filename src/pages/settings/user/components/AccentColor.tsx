/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { useDispatch, useSelector } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/user';
import { RootState } from '../../../../common/stores/store';
import colors from '$app/common/constants/colors';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export function AccentColor() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const reactSettings = useReactSettings();

  const userChanges = useSelector((state: RootState) => state.user.changes);

  return (
    <Card title={t('accent_color')}>
      <Element leftSide={t('accent_color')}>
        <ColorPicker
          value={
            userChanges?.company_user?.settings?.accent_color || colors.primary
          }
          onValueChange={(color) =>
            dispatch(
              updateChanges({
                property: 'company_user.settings.accent_color',
                value: color,
              })
            )
          }
        />
      </Element>

      <Element leftSide={t('sidebar_active_background_color')}>
        <ColorPicker
          value={reactSettings.sidebar_background || colors.ninjaGray}
          onValueChange={(color) =>
            dispatch(
              updateChanges({
                property: 'company_user.react_settings.sidebar_background',
                value: color,
              })
            )
          }
        />
      </Element>
    </Card>
  );
}

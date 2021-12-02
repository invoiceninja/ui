/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../common/stores/store';
import { updatePrimaryColor } from '../../../../common/stores/slices/settings';

export function AccentColor() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const colors = useSelector((state: RootState) => state.settings.colors);

  return (
    <Card>
      <Element leftSide={t('accent_color')}>
        <input
          type="color"
          value={colors.primary}
          onChange={(event) =>
            dispatch(updatePrimaryColor({ color: event.target.value }))
          }
        />
      </Element>
    </Card>
  );
}

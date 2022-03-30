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
import { updateChanges } from 'common/stores/slices/user';
import { RootState } from '../../../../common/stores/store';
import colors from 'common/constants/colors';
import { DebounceInput } from 'react-debounce-input';

export function AccentColor() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const userChanges = useSelector((state: RootState) => state.user.changes);

  return (
    <Card>
      <Element leftSide={t('accent_color')}>
        <DebounceInput
          value={
            userChanges?.company_user?.settings?.accent_color || colors.primary
          }
          type="color"
          onChange={(event) =>
            dispatch(
              updateChanges({
                property: 'company_user.settings.accent_color',
                value: event.target.value,
              })
            )
          }
        />
      </Element>
    </Card>
  );
}

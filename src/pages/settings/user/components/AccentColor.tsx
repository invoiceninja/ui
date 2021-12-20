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
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { RootState } from '../../../../common/stores/store';

export function AccentColor() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const user = useCurrentUser();
  const userState = useSelector((state: RootState) => state.user);

  return (
    <Card>
      <Element leftSide={t('accent_color')}>
        <input
          value={
            userState.changes?.company_user?.settings?.hasOwnProperty(
              'accent_color'
            )
              ? userState.changes?.company_user?.settings?.accent_color
              : user?.company_user?.settings?.accent_color || ''
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

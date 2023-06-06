/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { deletePassword, updateChanges } from '$app/common/stores/slices/user';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { RootState } from '$app/common/stores/store';

export function Password() {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const errors: ValidationBag = useOutletContext();

  const userChanges = useSelector((state: RootState) => state.user.changes);

  const [isPasswordsChanged, setIsPasswordsChanged] = useState(false);

  useEffect(() => {
    isPasswordsChanged &&
      window.addEventListener('user.updated', () => dispatch(deletePassword()));
  }, [isPasswordsChanged]);

  return (
    <Card title={t('password')}>
      <Element leftSide={t('new_password')}>
        <InputField
          type="password"
          value={userChanges.password || ''}
          onValueChange={(value) => {
            dispatch(updateChanges({ property: 'password', value }));

            !isPasswordsChanged && setIsPasswordsChanged(true);
          }}
          errorMessage={errors?.errors?.password}
        />
      </Element>
    </Card>
  );
}

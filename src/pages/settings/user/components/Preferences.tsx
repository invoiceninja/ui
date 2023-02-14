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
  const userChanges = useSelector((state: RootState) => state.user.changes);
  const dispatch = useDispatch();

  const showPdfPreview =
    userChanges?.company_user?.settings?.react_settings?.show_pdf_preview;

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
            showPdfPreview === true || typeof showPdfPreview === 'undefined'
          }
          onValueChange={(value) =>
            handleChange(
              'company_user.settings.react_settings.show_pdf_preview',
              value
            )
          }
        />
      </Element>
    </Card>
  );
}

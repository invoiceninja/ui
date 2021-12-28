/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { updateChanges } from 'common/stores/slices/company-users';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import Toggle from '../../../../components/forms/Toggle';

export function Quotes() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

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
        leftSide={t('auto_convert_quote')}
        leftSideHelp={t('auto_convert_quote_help')}
      >
        <Toggle
          checked={companyChanges?.settings?.auto_convert_quote || false}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_convert_quote', value)
          }
        />
      </Element>
      <Element
        leftSide={t('auto_archive_quote')}
        leftSideHelp={t('auto_archive_quote_help')}
      >
        <Toggle
          checked={companyChanges?.settings?.auto_archive_quote || false}
          onChange={(value: boolean) =>
            handleToggleChange('settings.auto_archive_quote', value)
          }
        />
      </Element>
    </Card>
  );
}

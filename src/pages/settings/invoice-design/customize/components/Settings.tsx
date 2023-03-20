/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDesignsQuery } from '$app/common/queries/designs';
import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import {
  Payload,
  useDesignUtilities,
} from '$app/pages/settings/invoice-design/customize/common/hooks';
import { useTranslation } from 'react-i18next';

interface Props {
  payload: Payload;
}

export function Settings({ payload }: Props) {
  const { t } = useTranslation();
  const { data: designs } = useDesignsQuery();
  const { handleDesignChange, handleDesignPropertyChange } =
    useDesignUtilities();

  return (
    <Card>
      <Element leftSide={t('name')}>
        <InputField
          onValueChange={(value) => handleDesignPropertyChange('name', value)}
          debounceTimeout={500}
        />
      </Element>

      <Element leftSide={t('design')}>
        <SelectField
          defaultValue={payload?.design?.id || ''}
          onValueChange={(value) => handleDesignChange(value)}
        >
          {designs &&
            designs.map((design) => (
              <option key={design.id} value={design.id}>
                {design.name}
              </option>
            ))}
        </SelectField>
      </Element>

      <Element leftSide={t('html_mode')}>
        <Toggle checked={false} />
      </Element>
    </Card>
  );
}

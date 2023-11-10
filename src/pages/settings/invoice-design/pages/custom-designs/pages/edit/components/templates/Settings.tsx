/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'react-use';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Checkbox, InputField } from '$app/components/forms';
import { useDesignUtilities } from '../../common/hooks';
import { payloadAtom } from '../../Edit';
import { templateEntites } from '../../../create/Create';

interface Props {
  errors: ValidationBag | undefined;
}

export function Settings(props: Props) {
  const [payload] = useAtom(payloadAtom);
  const [value] = useState(payload.design?.design.body);

  const { t } = useTranslation();
  const { handleBlockChange } = useDesignUtilities();
  const { errors } = props;
  const { handlePropertyChange, handleResourceChange } = useDesignUtilities();

  useDebounce(() => value && handleBlockChange('body', value), 1000, [value]);

  return (
    <Card onFormSubmit={(e) => e.preventDefault()}>
      <Element leftSide={t('name')}>
        <InputField
          value={payload.design?.name}
          onValueChange={(value) => handlePropertyChange('name', value)}
          errorMessage={errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('resource')}>
        {templateEntites.map((entity) => (
          <Checkbox
            key={entity}
            label={t(entity)}
            value={entity}
            onValueChange={(value, checked) =>
              handleResourceChange(value, Boolean(checked))
            }
            checked={payload.design?.entities.includes(entity)}
          />
        ))}
      </Element>
    </Card>
  );
}

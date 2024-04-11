/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { useValidationMessageAlias } from '$app/common/hooks/useValidationMessageAlias';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Alert } from './Alert';

interface Props {
  errors: ValidationBag;
  entity?: 'client';
  withoutTopMessage?: boolean;
  withoutListBullets?: boolean;
}

export function ValidationAlert(props: Props) {
  const { entity, withoutTopMessage, withoutListBullets } = props;

  const validationMessageAlias = useValidationMessageAlias({ entity });

  return (
    <Alert className="mb-6" type="danger">
      {!withoutTopMessage && <p>{props.errors.message}</p>}

      <ul>
        {Object.keys(props.errors.errors).map((key, index) => (
          <li key={index}>
            {!withoutListBullets && <>&#8211; </>}
            {validationMessageAlias(key, props.errors.errors[key])}
          </li>
        ))}
      </ul>
    </Alert>
  );
}

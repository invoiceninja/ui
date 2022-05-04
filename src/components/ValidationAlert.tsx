/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Alert } from './Alert';

interface Props {
  errors: ValidationBag;
}

export function ValidationAlert(props: Props) {
  return (
    <Alert className="mb-6" type="danger">
      <p>{props.errors.message}</p>

      <ul>
        {Object.keys(props.errors.errors).map((key, index) => (
          <li key={index}>&#8211; {props.errors.errors[key]}</li>
        ))}
      </ul>
    </Alert>
  );
}

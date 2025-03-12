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
import { Alert } from '../Alert';

interface Props {
  errors: ValidationBag;
}

export function EInvoiceValidationAlert(props: Props) {
  const { errors } = props;

  const getFieldParentLabel = (fieldKey: string) => {
    const pathKeysLength = fieldKey.split('|').length;

    const updatedComponentPath = fieldKey
      .split('|')
      .filter((_, index) => index < pathKeysLength - 2)
      .join('|');
    const updatedPathKeysLength = updatedComponentPath.split('|').length;

    let topParentName = '';
    let lastParentName = '';

    lastParentName = updatedComponentPath.split('|')[updatedPathKeysLength - 1];

    if (updatedPathKeysLength > 1) {
      topParentName =
        updatedComponentPath.split('|')[updatedPathKeysLength - 2];

      return `(${topParentName}, ${lastParentName})`;
    }

    if (updatedPathKeysLength > 0) {
      return `(${lastParentName})`;
    }

    return null;
  };

  return (
    <Alert className="mb-6" type="danger">
      <ul>
        {Object.keys(props.errors.errors).map((key, index) => (
          <li key={index}>{`${errors.errors[key]} ${getFieldParentLabel(
            key
          )}`}</li>
        ))}
      </ul>
    </Alert>
  );
}

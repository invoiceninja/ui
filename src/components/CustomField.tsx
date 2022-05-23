/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { Element } from './cards';
import {
  InputCustomField,
  Props as InputCustomFieldProps,
} from './forms/InputCustomField';

interface Props extends InputCustomFieldProps {
  fieldOnly?: boolean;
}

export function CustomField(props: Props) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const [fieldLabel] = props.value.includes('|')
      ? props.value.split('|')
      : [props.value, ''];
    setLabel(fieldLabel || '');
  }, []);

  if (props.fieldOnly) {
    return <InputCustomField {...props} />;
  }

  return (
    <Element leftSide={label}>
      <InputCustomField {...props} />
    </Element>
  );
}

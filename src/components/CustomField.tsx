/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { Element } from './cards';
import { InputCustomField, Props } from './forms/InputCustomField';

export function CustomField(props: Props) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const [fieldLabel] = props.value.includes('|')
      ? props.value.split('|')
      : [props.value, ''];
    setLabel(fieldLabel || '');
  }, []);

  return (
    <Element leftSide={label}>
      <InputCustomField {...props} />
    </Element>
  );
}

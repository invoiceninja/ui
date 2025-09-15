/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { JSX } from 'react';

import '../css/Select.css';

type SelectIntrinsicProps = JSX.IntrinsicElements['select'];
interface SelectProps extends SelectIntrinsicProps {
  label: string;
}

export default function Select({
  children,
  label,
  className,
  ...other
}: SelectProps): JSX.Element {
  return (
    <div className="Input__wrapper">
      <label style={{ marginTop: '-1em' }} className="Input__label">
        {label}
      </label>
      <select {...other} className={className || 'select'}>
        {children}
      </select>
    </div>
  );
}

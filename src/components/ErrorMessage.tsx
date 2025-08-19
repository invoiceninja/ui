/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode, useEffect } from 'react';
import { Alert } from './Alert';
import classNames from 'classnames';

interface Props {
  className?: string;
  children: ReactNode | undefined;
}

export function ErrorMessage({ children, className }: Props) {
  useEffect(() => {
    const errorMessageBox = document.querySelector('.error-message-box');

    if (errorMessageBox) {
      errorMessageBox.scrollIntoView({ behavior: 'smooth' });
    }
  }, [children]);

  if (!children) {
    return null;
  }

  return (
    <Alert className={classNames('error-message-box', className)} type="danger">
      {children}
    </Alert>
  );
}

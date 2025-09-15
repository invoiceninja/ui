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

import '../css/FlashMessage.css';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface FlashMessageProps {
  children: ReactNode;
}

export default function FlashMessage({
  children,
}: FlashMessageProps): JSX.Element {
  return createPortal(
    <div className="FlashMessage__overlay" role="dialog">
      <p className="FlashMessage__alert" role="alert">
        {children}
      </p>
    </div>,
    document.body
  );
}

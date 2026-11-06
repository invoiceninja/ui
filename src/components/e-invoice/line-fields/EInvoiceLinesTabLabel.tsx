/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  countLinesWithValues,
  EInvoiceLinesRoot,
  getLineEntries,
} from './fields';

interface Props {
  eInvoice: unknown;
  root: EInvoiceLinesRoot;
  errors?: ValidationBag;
}

export function EInvoiceLinesTabLabel(props: Props) {
  const [t] = useTranslation();

  const { eInvoice, root, errors } = props;

  const count = countLinesWithValues(getLineEntries(eInvoice, root));

  const hasErrors = Object.keys(errors?.errors ?? {}).some((key) =>
    key.startsWith('e_invoice')
  );

  return (
    <div
      className={classNames('flex space-x-1', {
        'text-red-500': hasErrors,
      })}
    >
      <span>{t('e_invoice_line_fields')}</span>

      {count > 0 && <span>({count})</span>}
    </div>
  );
}

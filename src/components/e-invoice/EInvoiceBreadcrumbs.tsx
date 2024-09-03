/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChevronRight } from 'react-feather';
import { Icon } from '../icons/Icon';
import { EInvoiceUIComponents } from './EInvoiceGenerator';

interface Props {
  resolvedTypes: string[];
  resolvedUIComponents: EInvoiceUIComponents;
  onBreadCrumbIndexChange: (index: number) => void;
}

export function EInvoiceBreadcrumbs(props: Props) {
  const { resolvedTypes, resolvedUIComponents, onBreadCrumbIndexChange } =
    props;

  return (
    <div className="flex flex-col mt-4 px-6 space-y-8">
      <div className="flex items-center">
        {resolvedTypes.map((type, index) => (
          <div key={type} className="flex items-center">
            <div
              className="cursor-pointer hover:underline"
              onClick={() => onBreadCrumbIndexChange(index)}
            >
              {type}
            </div>

            {index !== resolvedTypes.length - 1 && (
              <Icon
                element={ChevronRight}
                style={{ marginLeft: 6, marginRight: 6 }}
              />
            )}
          </div>
        ))}
      </div>

      {Array.isArray(resolvedUIComponents) && (
        <div>
          {resolvedUIComponents.find(
            (_, index) => resolvedUIComponents.length - 1 === index
          )}
        </div>
      )}
    </div>
  );
}

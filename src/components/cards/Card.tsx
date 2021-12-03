/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/stores/store';
import { Button } from '../forms';

export function Card(props: {
  children: ReactNode;
  title?: string;
  description?: string;
  withSaveButton?: boolean;
  onSaveClick?: any;
  saveButtonLabel?: string;
}) {
  const colors = useSelector((state: RootState) => state.settings.colors);
  const [t] = useTranslation();

  return (
    <div className="bg-white shadow overflow-hidden rounded">
      {props.title && (
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {props.title}
          </h3>
          {props.description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {props.description}
            </p>
          )}
        </div>
      )}
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="py-4">{props.children}</dl>
      </div>
      {props.withSaveButton && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="sm:py-5 sm:px-6 flex justify-end">
              <Button>{props.saveButtonLabel ?? t('save')}</Button>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

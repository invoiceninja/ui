/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  hasResults: boolean;
}

export function SearchGroupTitle({ title, hasResults }: Props) {
  const [t] = useTranslation();

  if (!hasResults) return null;

  return (
    <div className="px-4 mt-4 mb-2 first:mt-0">
      <span className="text-xs font-medium text-gray-400">{t(title)}</span>
    </div>
  );
}

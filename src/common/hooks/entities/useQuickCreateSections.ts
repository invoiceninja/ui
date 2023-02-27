/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from 'common/helpers';
import { IconType } from 'react-icons';
import {
  MdAreaChart,
  MdOutlineBuild,
  MdOutlineShoppingBag,
} from 'react-icons/md';

interface EntitySection {
  name: string;
  icon: IconType;
  visible: boolean;
}

export function useQuickCreateSections() {
  const sections: EntitySection[] = [
    {
      name: 'income',
      icon: MdAreaChart,
      visible: true,
    },
    {
      name: 'expense',
      icon: MdOutlineShoppingBag,
      visible: true,
    },
    {
      name: 'settings',
      icon: MdOutlineBuild,
      visible: isHosted(),
    },
  ];

  return sections;
}

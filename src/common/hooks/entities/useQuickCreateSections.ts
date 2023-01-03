/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isSelfHosted } from 'common/helpers';
import { IconType } from 'react-icons';
import { MdOutlineBuild, MdOutlineShoppingBag, MdTag } from 'react-icons/md';

interface EntitySection {
  name: string;
  icon: IconType;
  visible: boolean;
}

export function useQuickCreateSections() {
  const sections: EntitySection[] = [
    {
      name: 'general',
      icon: MdTag,
      visible: true,
    },
    {
      name: 'purchase',
      icon: MdOutlineShoppingBag,
      visible: true,
    },
    {
      name: 'common',
      icon: MdOutlineBuild,
      visible: isSelfHosted(),
    },
  ];

  return sections;
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { TabGroup } from 'components/TabGroup';
import { useTranslation } from 'react-i18next';
import { Products } from './Products';
import { Tasks } from './Tasks';

export function Table() {
  const [t] = useTranslation();

  return (
    <>
      <div className="col-span-12">
        <TabGroup tabs={[t('products'), t('tasks')]}>
          <Tab.Panel>
            <Products />
          </Tab.Panel>
          <Tab.Panel>
            <Tasks />
          </Tab.Panel>
        </TabGroup>
      </div>
    </>
  );
}

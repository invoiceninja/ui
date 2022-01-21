/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import { TabGroup } from 'components/TabGroup';

export function Address() {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('address')}>
      <CardContainer>
        <TabGroup tabs={['one', 'two', 'thre']}>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </TabGroup>
      </CardContainer>
    </Card>
  );
}

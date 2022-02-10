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
import { Card } from '@invoiceninja/cards';
import MDEditor from '@uiw/react-md-editor';
import { TabGroup } from 'components/TabGroup';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-8 h-max" withContainer>
      <TabGroup tabs={[t('terms'), t('notes'), t('settings')]}>
        <Tab.Panel>
          <MDEditor />
        </Tab.Panel>
        <Tab.Panel>
          <MDEditor />
        </Tab.Panel>
        <Tab.Panel>
          <MDEditor />
        </Tab.Panel>
      </TabGroup>
    </Card>
  );
}

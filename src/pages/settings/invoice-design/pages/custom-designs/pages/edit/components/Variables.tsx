/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TabGroup } from '$app/components/TabGroup';
import { Card } from '$app/components/cards';
import { variables } from '$app/pages/settings/invoice-design/customize/common/variables';
import { Variable } from '$app/pages/settings/templates-and-reminders/common/components/Variable';
import { useTranslation } from 'react-i18next';

export default function Variables() {
  const { t } = useTranslation();

  return (
    <Card title={t('variables')} padding="small" childrenClassName="px-5">
      <TabGroup tabs={[t('invoice'), t('client'), t('contact'), t('company')]}>
        <section>
          {variables.invoice.map((variable, index) => (
            <Variable key={index}>{variable}</Variable>
          ))}
        </section>

        <section>
          {variables.client.map((variable, index) => (
            <Variable key={index}>{variable}</Variable>
          ))}
        </section>

        <section>
          {variables.contact.map((variable, index) => (
            <Variable key={index}>{variable}</Variable>
          ))}
        </section>

        <section>
          {variables.company.map((variable, index) => (
            <Variable key={index}>{variable}</Variable>
          ))}
        </section>
      </TabGroup>
    </Card>
  );
}

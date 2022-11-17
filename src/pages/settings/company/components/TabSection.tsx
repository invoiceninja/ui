/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanyDetailsTabs } from 'common/interfaces/company-details';
import { TabButton } from './TabButton';

interface Props {
  handleChangeTab: (sectionKey: string) => void;
  tabsActivity: CompanyDetailsTabs;
}

export function TabSection(props: Props) {
  return (
    <div className="flex justify-center">
      <TabButton
        text="details"
        active={props.tabsActivity?.details}
        onClick={props.handleChangeTab}
      />
      <TabButton
        text="address"
        active={props.tabsActivity.address}
        onClick={props.handleChangeTab}
      />
      <TabButton
        text="logo"
        active={props.tabsActivity.logo}
        onClick={props.handleChangeTab}
      />
      <TabButton
        text="defaults"
        active={props.tabsActivity.defaults}
        onClick={props.handleChangeTab}
      />
      <TabButton
        text="documents"
        active={props.tabsActivity.documents}
        onClick={props.handleChangeTab}
      />
      <TabButton
        text="custom_fields"
        active={props.tabsActivity.custom_fields}
        onClick={props.handleChangeTab}
      />
    </div>
  );
}

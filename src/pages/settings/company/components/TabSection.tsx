/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanySettingsTabs } from 'common/constants/company-settings';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { CompanyDetailsTabs } from 'common/interfaces/company-details';
import { TabButton } from './TabButton';

interface Props {
  handleChangeTab: (sectionKey: string) => void;
  tabsActivity: CompanyDetailsTabs;
}

export function TabSection(props: Props) {
  const company = useCurrentCompany();
  const companyPrimaryColor = company?.settings?.primary_color;

  return (
    <div
      style={{
        backgroundColor: `${companyPrimaryColor}`,
        boxShadow: '0 5px 6px -5px black',
      }}
      className="flex justify-center"
    >
      {Object.values(CompanySettingsTabs).map((value) => (
        <TabButton
          key={value}
          text={value}
          active={props.tabsActivity[value as keyof typeof props.tabsActivity]}
          onClick={() => props.handleChangeTab(value)}
        />
      ))}
    </div>
  );
}

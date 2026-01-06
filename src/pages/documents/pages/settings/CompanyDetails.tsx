/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { classNames } from '$app/common/helpers';
import { Page } from '$app/components/Breadcrumbs';
import { SelectField } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { useSettingsTabs } from './common/hooks/useSettingsTabs';

const LinkStyled = styled(Link)`
  color: ${(props) => props.theme.color};
  background-color: ${(props) => props.theme.backgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

function CompanyDetails() {
  const [t] = useTranslation();

  const routes = useSettingsTabs();
  const colors = useColorScheme();
  const location = useLocation();
  const navigate = useNavigate();

  const pages: Page[] = [
    {
      name: t('docuninja'),
      href: '/docuninja',
    },
    {
      name: t('settings'),
      href: '/docuninja/settings',
    },
  ];

  return (
    <Default title={t('settings')} breadcrumbs={pages}>

      <div className="grid grid-cols-12 lg:gap-6">
        <div className="col-span-12 lg:col-span-3">
          <a className="flex items-center mb-3 mt-4 px-0 lg:px-3 text-sm font-medium">
            <span className="truncate" style={{ color: colors.$17 }}>
              {t('settings')}
            </span>
          </a>

          <SelectField
            className="lg:hidden text-sm"
            value={location.pathname}
            onValueChange={(value) => navigate(value)}
            withBlank
            customSelector
          >
            {routes
              .filter((item) => item.enabled)
              .map((item) => (
                <option key={item.name} value={item.href}>
                  {item.name}
                </option>
              ))}
          </SelectField>

          <nav className="space-y-1 hidden lg:block" aria-label="Sidebar">
            {routes.map(
              (item) =>
                item.enabled && (
                  <LinkStyled
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                    theme={{
                      backgroundColor: item.current ? colors.$20 : 'transparent',
                      color: item.current ? colors.$3 : colors.$3,
                      hoverColor: colors.$20,
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                  </LinkStyled>
                )
            )}
          </nav>
        </div>

        <div className="col-span-12 lg:col-start-4 space-y-6 mt-4">
          <Outlet />
        </div>
      </div>
    </Default>
  );
}

export default CompanyDetails;

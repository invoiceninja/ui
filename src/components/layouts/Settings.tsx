/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Breadcrumbs, Page } from '$app/components/Breadcrumbs';
import { useAtom } from 'jotai';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { classNames } from '../../common/helpers';
import { SelectField } from '../forms';
import { Default } from './Default';
import { companySettingsErrorsAtom } from '../../pages/settings/common/atoms';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { useSettingsRoutes } from './common/hooks';
import { Icon } from '../icons/Icon';
import { MdClose, MdGroup } from 'react-icons/md';
import { FaObjectGroup } from 'react-icons/fa';
import { useActiveSettingsDetails } from '$app/common/hooks/useActiveSettingsDetails';
import { useSwitchToCompanySettings } from '$app/common/hooks/useSwitchToCompanySettings';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';

interface Props {
  title: string;
  children: ReactNode;
  onSaveClick?: any;
  onCancelClick?: any;
  breadcrumbs?: Page[];
  docsLink?: string;
  navigationTopRight?: ReactNode;
  disableSaveButton?: boolean;
  withoutBackButton?: boolean;
}

const LinkStyled = styled(Link)`
  color: ${(props) => props.theme.color};
  background-color: ${(props) => props.theme.backgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function Settings(props: Props) {
  const [t] = useTranslation();
  const [errors, setErrors] = useAtom(companySettingsErrorsAtom);
  const activeSettings = useActiveSettingsDetails();
  const switchToCompanySettings = useSwitchToCompanySettings();
  const { isGroupSettingsActive, isClientSettingsActive } =
    useCurrentSettingsLevel();

  const location = useLocation();
  const navigate = useNavigate();
  const settingPathNameKey = location.pathname.split('/')[2];

  const { basic, advanced } = useSettingsRoutes();

  useEffect(() => {
    setErrors(undefined);
  }, [settingPathNameKey]);

  const colors = useColorScheme();

  return (
    <Default
      onSaveClick={props.onSaveClick}
      onCancelClick={props.onCancelClick}
      title={props.title}
      docsLink={props.docsLink}
      navigationTopRight={props.navigationTopRight}
      disableSaveButton={props.disableSaveButton}
      withoutBackButton={props.withoutBackButton}
    >
      <div className="grid grid-cols-12 lg:gap-10">
        <div className="col-span-12 lg:col-span-3">
          {(isGroupSettingsActive || isClientSettingsActive) && (
            <div
              className="flex items-center justify-between border py-3 rounded space-x-3 px-2"
              style={{
                backgroundColor: colors.$1,
                borderColor: colors.$5,
              }}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div>
                  <Icon
                    element={isGroupSettingsActive ? FaObjectGroup : MdGroup}
                    size={20}
                  />
                </div>

                <span className="text-sm truncate">
                  {isGroupSettingsActive
                    ? t('group_settings')
                    : t('client_settings')}
                  : {activeSettings.name}
                </span>
              </div>

              <div
                className="cursor-pointer"
                onClick={() => {
                  switchToCompanySettings();

                  isGroupSettingsActive && navigate('/settings/group_settings');
                  isClientSettingsActive && navigate('/clients');
                }}
              >
                <Icon element={MdClose} size={20} />
              </div>
            </div>
          )}

          <a className="flex items-center py-4 px-3 text-xs uppercase font-medium">
            <span className="truncate">{t('basic_settings')}</span>
          </a>

          <SelectField
            className="lg:hidden"
            value={location.pathname}
            onValueChange={(value) => navigate(value)}
            withBlank
          >
            {basic.map(
              (item) =>
                item.enabled && (
                  <option key={item.name} value={item.href}>
                    {item.name}
                  </option>
                )
            )}
          </SelectField>

          <nav className="space-y-1 hidden lg:block" aria-label="Sidebar">
            {basic.map(
              (item) =>
                item.enabled && (
                  <LinkStyled
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      'flex items-center px-3 py-2 text-sm font-medium rounded'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                    theme={{
                      backgroundColor: item.current ? colors.$5 : '',
                      color: item.current ? colors.$3 : '',
                      hoverColor: colors.$5,
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                  </LinkStyled>
                )
            )}
          </nav>

          {advanced.filter((route) => route.enabled).length > 0 && (
            <div className="flex items-center py-4 px-3 text-xs uppercase font-medium mt-8 truncate space-x-1">
              <span>{t('advanced_settings')}</span>
              <sup>{t('pro')}</sup>
            </div>
          )}

          <SelectField
            className="lg:hidden"
            value={location.pathname}
            onValueChange={(value) => navigate(value)}
            withBlank
          >
            {advanced.map(
              (item) =>
                item.enabled && (
                  <option key={item.name} value={item.href}>
                    {item.name}
                  </option>
                )
            )}
          </SelectField>

          <nav className="space-y-1 hidden lg:block" aria-label="Sidebar">
            {advanced.map((item, index) => (
              <div key={index}>
                {item.enabled && (
                  <LinkStyled
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      'flex items-center px-3 py-2 text-sm font-medium rounded'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                    theme={{
                      backgroundColor: item.current ? colors.$5 : '',
                      color: item.current ? colors.$3 : '',
                      hoverColor: colors.$5,
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                  </LinkStyled>
                )}

                {item.children && item.current && (
                  <div className="bg-gray-100 space-y-4 py-3 rounded-b">
                    {item.children &&
                      item.children.map((item, index) => (
                        <Link
                          key={index}
                          to={item.href}
                          className={classNames(
                            item.current ? 'text-gray-900 font-semibold' : '',
                            'ml-4 px-3 text-sm block text-gray-700 hover:text-gray-900 transition duration-200 ease-in-out'
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="col-span-12 lg:col-start-4 space-y-6 mt-5">
          {props.breadcrumbs && <Breadcrumbs pages={props.breadcrumbs} />}

          {errors && <ValidationAlert errors={errors} />}

          {props.children}
        </div>
      </div>
    </Default>
  );
}

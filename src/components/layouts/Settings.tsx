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
import { MdClose } from 'react-icons/md';
import { FaObjectGroup } from 'react-icons/fa';
import { useActiveSettingsDetails } from '$app/common/hooks/useActiveSettingsDetails';
import { SettingsLevel } from '$app/common/enums/settings';
import { useSwitchToCompanySettings } from '$app/common/hooks/useSwitchToCompanySettings';

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

export function Settings(props: Props) {
  const [t] = useTranslation();
  const [errors, setErrors] = useAtom(companySettingsErrorsAtom);
  const activeSettings = useActiveSettingsDetails();
  const switchToCompanySettings = useSwitchToCompanySettings();

  const location = useLocation();
  const navigate = useNavigate();
  const settingPathNameKey = location.pathname.split('/')[2];

  const { basic, advanced } = useSettingsRoutes();

  useEffect(() => {
    setErrors(undefined);
  }, [settingPathNameKey]);

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
          {activeSettings.level === SettingsLevel.Group && (
            <div
              className={`flex items-center justify-between px-2 bg-white border border-gray-200 py-3 rounded space-x-3`}
            >
              <div className="flex items-center space-x-1 lg:space-x-3 3xl:space-x-1 flex-1 w-[90%] lg:w-[75%] 3xl:w-[90%]">
                <div>
                  <Icon element={FaObjectGroup} size={20} />
                </div>

                <div className="flex-col hidden lg:inline 3xl:hidden w-[70%]">
                  <p className="text-sm truncate w-full">
                    {t('group_settings')}
                  </p>

                  <p className="text-sm truncate w-full">
                    {activeSettings.name}
                  </p>
                </div>

                <span className="text-sm lg:hidden 3xl:inline">
                  {t('group_settings')}:
                </span>

                <span className="text-sm truncate lg:hidden 3xl:inline flex-1">
                  {activeSettings.name}
                </span>
              </div>

              <div className="cursor-pointer" onClick={switchToCompanySettings}>
                <Icon element={MdClose} size={20} />
              </div>
            </div>
          )}

          <a className="flex items-center py-4 px-3 text-xs uppercase font-medium text-gray-600">
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
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'flex items-center px-3 py-2 text-sm font-medium rounded'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
            )}
          </nav>

          {advanced.filter((route) => route.enabled).length > 0 && (
            <a className="flex items-center py-4 px-3 text-xs uppercase font-medium text-gray-600 mt-8">
              <span className="truncate">{t('advanced_settings')}</span>
            </a>
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
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      item.children ? 'rounded-t' : 'rounded',
                      'flex items-center px-3 py-2 text-sm font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <span className="truncate">{item.name}</span>
                  </Link>
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

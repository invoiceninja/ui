/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Menu, Transition } from '@headlessui/react';
import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { authenticate } from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { Fragment, useEffect, useState } from 'react';
import { Check, ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { route } from '$app/common/helpers/route';
import { DropdownElement } from './dropdown/DropdownElement';
import { useLogo } from '$app/common/hooks/useLogo';
import { useCompanyName } from '$app/common/hooks/useLogo';
import { CompanyCreate } from '$app/pages/settings/company/create/CompanyCreate';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { isDemo, isHosted, isSelfHosted } from '$app/common/helpers';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { Icon } from './icons/Icon';
import { MdLogout, MdManageAccounts } from 'react-icons/md';
import { BiPlusCircle } from 'react-icons/bi';

export function CompanySwitcher() {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const state = useSelector((state: RootState) => state.companyUsers);

  const canUserAddCompany = isSelfHosted() || (isHosted() && !freePlan());

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const logo = useLogo();

  const companyName = useCompanyName();

  const currentCompany = useCurrentCompany();

  const [shouldShowAddCompany, setShouldShowAddCompany] =
    useState<boolean>(false);

  const [isCompanyCreateModalOpened, setIsCompanyCreateModalOpened] =
    useState<boolean>(false);

  const switchCompany = (index: number) => {
    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: state.api[index].user,
        token: state.api[index].token.token,
      })
    );

    localStorage.setItem('X-CURRENT-INDEX', index.toString());

    localStorage.setItem('COMPANY-EDIT-OPENED', 'false');

    sessionStorage.setItem('COMPANY-ACTIVITY-SHOWN', 'false');

    queryClient.invalidateQueries();

    window.location.href = route('/');
  };

  useEffect(() => {
    if (state.api.length < 10) {
      setShouldShowAddCompany(true);
    }

    if (isDemo()) {
      setShouldShowAddCompany(false);
    }
  }, [currentCompany]);

  return (
    <>
      <CompanyCreate
        isModalOpen={isCompanyCreateModalOpened}
        setIsModalOpen={setIsCompanyCreateModalOpened}
      />

      <Menu as="div" className="relative inline-block text-left w-full">
        <Menu.Button className="flex items-center justify-between w-full rounded font-medium pl-2">
          <div className="flex items-center justify-center space-x-3">
            <img className="w-8" src={logo} alt="Company logo" />
            <div className="flex flex-col items-between">
              <span className="text-white text-sm text-start w-28 truncate">
                {companyName}
              </span>
              {(user?.first_name || user?.last_name) && (
                <span className="text-white text-xs text-start w-28 truncate">
                  {user.first_name} {user.last_name}
                </span>
              )}
            </div>
          </div>
          <ChevronDown size={18} className="text-gray-300" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute left-0 mt-2 w-56 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                <DropdownElement>
                  <p className="text-sm">{t('signed_in_as')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                </DropdownElement>
              </Menu.Item>
            </div>

            <div className="py-1">
              {state?.api?.length >= 1 &&
                state?.api?.map((record: any, index: number) => (
                  <Menu.Item key={index}>
                    <DropdownElement onClick={() => switchCompany(index)}>
                      <div className="flex items-center space-x-3">
                        <span>
                          {record.company.settings.name ||
                            t('untitled_company')}
                        </span>

                        {state.currentIndex === index && <Check size={18} />}
                      </div>
                    </DropdownElement>
                  </Menu.Item>
                ))}
            </div>
            <div className="py-1">
              {shouldShowAddCompany && canUserAddCompany && (
                <Menu.Item>
                  <DropdownElement
                    className="flex items-center"
                    onClick={() => setIsCompanyCreateModalOpened(true)}
                    icon={<Icon element={BiPlusCircle} size={22} />}
                  >
                    <span>{t('add_company')}</span>
                  </DropdownElement>
                </Menu.Item>
              )}

              <Menu.Item>
                <DropdownElement
                  to="/settings/account_management"
                  icon={<Icon element={MdManageAccounts} size={22} />}
                >
                  {t('account_management')}
                </DropdownElement>
              </Menu.Item>

              <Menu.Item>
                <DropdownElement
                  to="/logout"
                  icon={<Icon element={MdLogout} size={22} />}
                >
                  {t('logout')}
                </DropdownElement>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}

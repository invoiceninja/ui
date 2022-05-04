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
import { AuthenticationTypes } from 'common/dtos/authentication';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { authenticate } from 'common/stores/slices/user';
import { RootState } from 'common/stores/store';
import { Fragment } from 'react';
import { Check, ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { DropdownElement } from './dropdown/DropdownElement';
import { useLogo } from 'common/hooks/useLogo';
import { useCompanyName } from 'common/hooks/useLogo';

export function CompanySwitcher() {
  const [t] = useTranslation();
  const user = useCurrentUser();
  const state = useSelector((state: RootState) => state.companyUsers);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const logo = useLogo();
  const companyName = useCompanyName();

  const switchCompany = (index: number) => {
    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: state.api[index].user,
        token: state.api[index].token.token,
      })
    );

    localStorage.setItem('X-CURRENT-INDEX', index.toString());

    queryClient.invalidateQueries();

    window.location.href = generatePath('/');
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center space-x-3 justify-center w-full rounded text-sm font-medium text-gray-700 border border-transparent">
          <img className="w-8" src={logo} alt="Company logo" />
          <span className="text-white text-sm">{companyName}</span>
          <ChevronDown size={18} color="white" />
        </Menu.Button>
      </div>

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
                        {record.company.settings.name || t('new_company')}
                      </span>

                      {state.currentIndex === index && <Check size={18} />}
                    </div>
                  </DropdownElement>
                </Menu.Item>
              ))}
          </div>
          <div className="py-1">
            <Menu.Item>
              <DropdownElement
                to={generatePath('/settings/account_management')}
              >
                {t('account_management')}
              </DropdownElement>
            </Menu.Item>

            <Menu.Item>
              <DropdownElement to={generatePath('/logout')}>
                {t('logout')}
              </DropdownElement>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

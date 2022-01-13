/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Menu, Transition } from '@headlessui/react';
import { AuthenticationTypes } from 'common/dtos/authentication';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { changeCurrentIndex } from 'common/stores/slices/company-users';
import { authenticate } from 'common/stores/slices/user';
import { RootState } from 'common/stores/store';
import { Fragment } from 'react';
import { Check, ChevronDown, User } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { DropdownElement } from './dropdown/DropdownElement';

export function CompanySwitcher() {
  const [t] = useTranslation();
  const user = useCurrentUser();
  const state = useSelector((state: RootState) => state.companyUsers);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const switchCompany = (index: number) => {
    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: state.api[index].user,
        token: state.api[index].token.token,
      })
    );

    dispatch(changeCurrentIndex(index));

    queryClient.invalidateQueries();

    location.reload();
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded px-4 py-1.5 bg-white text-sm font-medium text-gray-700 border border-transparent hover:border-gray-300 focus:outline-none focus:ring-q focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500">
          <User />
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm">{t('signed_as')}</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
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

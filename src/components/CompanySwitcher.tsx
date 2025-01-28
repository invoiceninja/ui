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
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useLogo } from '$app/common/hooks/useLogo';
import { useCompanyName } from '$app/common/hooks/useLogo';
import { CompanyCreate } from '$app/pages/settings/company/create/CompanyCreate';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { isDemo, isHosted, isSelfHosted } from '$app/common/helpers';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { useColorScheme } from '$app/common/colors';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ExpandCollapseChevron } from './icons/ExpandCollapseChevron';
import { CloseNavbarArrow } from './icons/CloseNavbarArrow';
import { styled } from 'styled-components';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { Check } from './icons/Check';
import Avatar from 'react-avatar';
import { Plus } from './icons/Plus';
import { Person } from './icons/Person';
import { Exit } from './icons/Exit';

const SwitcherDiv = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function CompanySwitcher() {
  const [t] = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const state = useSelector((state: RootState) => state.companyUsers);

  const { id } = useParams();
  const canUserAddCompany = isSelfHosted() || (isHosted() && !freePlan());

  const logo = useLogo();
  const user = useCurrentUser();
  const location = useLocation();
  const colors = useColorScheme();
  const companyName = useCompanyName();
  const queryClient = useQueryClient();
  const { isAdmin, isOwner } = useAdmin();

  const currentCompany = useCurrentCompany();
  const preventNavigation = usePreventNavigation();

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

    if (id) {
      const basePage =
        '/' +
        (location.pathname.includes('/settings/gateways')
          ? 'settings/online_payments'
          : location.pathname.split('/')[1] || 'dashboard');

      navigate(basePage);
    }

    window.location.reload();
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

      <Menu
        as="div"
        className="relative inline-block text-left w-full"
        data-cy="companyDropdown"
      >
        <div className="flex items-center">
          <Menu.Button className="flex items-center justify-start space-x-3 w-full">
            <SwitcherDiv
              className="flex items-center space-x-3 p-1.5 rounded-md"
              theme={{ hoverColor: `${colors.$1}1A` }}
            >
              <img
                className="rounded-full border overflow-hidden aspect-square"
                src={logo}
                alt="Company logo"
                style={{
                  borderColor: colors.$14,
                  width: '1.65rem',
                }}
              />

              <span
                className="text-sm text-start w-28 truncate"
                style={{ color: colors.$15 }}
              >
                {companyName}
              </span>

              <ExpandCollapseChevron />
            </SwitcherDiv>
          </Menu.Button>

          <div className="cursor-pointer">
            <CloseNavbarArrow />
          </div>
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
          <Menu.Items
            className="origin-top-right absolute left-0 mt-2 rounded shadow-lg"
            style={{
              backgroundColor: colors.$1,
              width: '14.5rem',
            }}
          >
            <div className="py-1 border-b" style={{ borderColor: '#09090B1A' }}>
              <Menu.Item>
                <div className="px-3 py-1">
                  <p style={{ fontSize: '0.6875rem' }}>{t('signed_in_as')}</p>

                  <p
                    className="font-medium truncate"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {user?.email}
                  </p>
                </div>
              </Menu.Item>
            </div>

            <div
              className="flex flex-col pb-1 pt-2 border-b"
              style={{ borderColor: '#09090B1A' }}
            >
              {state?.api?.length >= 1 &&
                state?.api?.map((record: any, index: number) => {
                  console.log(record);
                  return (
                    <Menu.Item key={index}>
                      <div className="px-1 space-y-0.5">
                        {index === 0 && (
                          <p
                            className="pl-2"
                            style={{ color: '#A1A1AA', fontSize: '0.6875rem' }}
                          >
                            {t('company')}
                          </p>
                        )}

                        <SwitcherDiv
                          className="flex items-center px-2 justify-between py-1.5 rounded-md cursor-pointer"
                          theme={{ hoverColor: `#09090B13` }}
                          onClick={() =>
                            preventNavigation({
                              fn: () => switchCompany(index),
                              actionKey: 'switchCompany',
                            })
                          }
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            {record.company.settings.company_logo ? (
                              <img
                                className="rounded-full border overflow-hidden aspect-square"
                                src={record.company.settings.company_logo}
                                alt="Company logo"
                                style={{
                                  borderColor: colors.$14,
                                  width: '1.5rem',
                                }}
                              />
                            ) : (
                              <Avatar
                                name={
                                  (record.company.settings.name ||
                                    t('untitled_company'))?.[0]
                                }
                                round={true}
                                size="1.5rem"
                              />
                            )}

                            <div
                              className="flex-1 truncate"
                              style={{ fontSize: '0.8125rem' }}
                            >
                              {record.company.settings.name ||
                                t('untitled_company')}
                            </div>
                          </div>

                          {state.currentIndex === index && <Check />}
                        </SwitcherDiv>
                      </div>
                    </Menu.Item>
                  );
                })}
            </div>

            <div className="py-1">
              {shouldShowAddCompany &&
                canUserAddCompany &&
                (isAdmin || isOwner) && (
                  <Menu.Item>
                    <div className="px-1">
                      <SwitcherDiv
                        className="flex items-center pl-3 space-x-3 py-2 rounded-md cursor-pointer"
                        theme={{ hoverColor: `#09090B13` }}
                        onClick={() => setIsCompanyCreateModalOpened(true)}
                      >
                        <Plus />

                        <span style={{ fontSize: '0.8125rem' }}>
                          {t('add_company')}
                        </span>
                      </SwitcherDiv>
                    </div>
                  </Menu.Item>
                )}

              {(isAdmin || isOwner) && (
                <Menu.Item>
                  <div className="px-1">
                    <SwitcherDiv
                      className="flex items-center space-x-3 pl-3 py-2 rounded-md cursor-pointer"
                      theme={{ hoverColor: `#09090B13` }}
                      onClick={() =>
                        preventNavigation({
                          url: '/settings/account_management',
                        })
                      }
                    >
                      <Person />

                      <span style={{ fontSize: '0.8125rem' }}>
                        {t('account_management')}
                      </span>
                    </SwitcherDiv>
                  </div>
                </Menu.Item>
              )}

              <Menu.Item>
                <div className="pl-1.5 pr-1">
                  <SwitcherDiv
                    className="flex items-center space-x-3 pl-3 py-2 rounded-md cursor-pointer"
                    theme={{ hoverColor: `#09090B13` }}
                    onClick={() =>
                      preventNavigation({
                        url: '/logout',
                      })
                    }
                  >
                    <Exit />

                    <span style={{ fontSize: '0.8125rem' }}>{t('logout')}</span>
                  </SwitcherDiv>
                </div>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}

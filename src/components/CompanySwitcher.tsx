/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Tippy from '@tippyjs/react/headless';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import companySettings from '$app/common/constants/company-settings';
import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { isDemo, isHosted, isSelfHosted } from '$app/common/helpers';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useDocuNinjaActions } from '$app/common/hooks/useDocuNinjaActions';
import { useCompanyName, useLogo } from '$app/common/hooks/useLogo';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { authenticate } from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { CompanyCreate } from '$app/pages/settings/company/create/CompanyCreate';
import { Check } from './icons/Check';
import { Exit } from './icons/Exit';
import { ExpandCollapseChevron } from './icons/ExpandCollapseChevron';
import { Person } from './icons/Person';
import { Plus } from './icons/Plus';

const SwitcherDiv = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const Panel = styled.div`
  transform-origin: left center;
  animation: companySwitcherIn 100ms ease-out;

  @keyframes companySwitcherIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const COMPANY_ROW_HEIGHT = '4rem';
const ACTION_ROW_HEIGHT = '2.75rem';

export function CompanySwitcher() {
  const [t] = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const state = useSelector((state: RootState) => state.companyUsers);

  const { id } = useParams();
  const canUserAddCompany = isSelfHosted() || (isHosted() && !freePlan());

  const logo = useLogo({ fallbackSmallLogo: true });
  const location = useLocation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const companyName = useCompanyName();
  const { isAdmin, isOwner } = useAdmin();
  const currentCompany = useCurrentCompany();
  const { flushData } = useDocuNinjaActions();

  const currentUser = useCurrentUser();
  const reactSettings = useReactSettings();

  const isMiniSidebar = Boolean(reactSettings.show_mini_sidebar);

  const isDarkMode = colors.$0 === 'dark';
  const panelBackground = isDarkMode
    ? 'rgba(30, 30, 33, 0.82)'
    : 'rgba(255, 255, 255, 0.82)';

  const preventNavigation = usePreventNavigation();

  const [visible, setVisible] = useState<boolean>(false);
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

    //queryClient.invalidateQueries();

    // Clear DocuNinja data and cache when switching companies
    flushData();

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

      <Tippy
        placement="right-start"
        visible={visible}
        onClickOutside={() => setVisible(false)}
        interactive
        appendTo={() => document.body}
        offset={[0, 24]}
        popperOptions={{
          modifiers: [
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['bottom-start', 'left-start'],
              },
            },
          ],
        }}
        render={(attrs) => (
          <Panel
            {...attrs}
            className="border text-left overflow-hidden"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              backgroundColor: panelBackground,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: colors.$3,
              borderColor: colors.$24,
              borderRadius: '0.85rem',
              boxShadow:
                '0 16px 40px -12px rgba(0, 0, 0, 0.4), 0 6px 16px -8px rgba(0, 0, 0, 0.3)',
              width: '20rem',
              zIndex: 50,
            }}
          >
            <div
              className="px-3 py-2.5 border-b"
              style={{ borderColor: colors.$21 }}
            >
              <p className="text-xs" style={{ color: colors.$17 }}>
                {t('signed_in_as')}
              </p>

              <p className="font-medium truncate text-sm">
                {currentUser?.email}
              </p>
            </div>

            <div className="border-b" style={{ borderColor: colors.$21 }}>
              <p className="px-3 pt-2 text-xs" style={{ color: colors.$17 }}>
                {t('company')}
              </p>

              <div
                className="flex flex-col gap-1 p-1.5 overflow-y-auto"
                style={{ maxHeight: '21rem' }}
              >
                {state?.api?.length >= 1 &&
                  state?.api?.map((record: any, index: number) => {
                    const isActive = state.currentIndex === index;

                    const name =
                      record.company.settings.name || t('untitled_company');

                    return (
                      <SwitcherDiv
                        key={index}
                        className="flex items-center justify-between px-2 rounded-lg cursor-pointer"
                        theme={{ hoverColor: colors.$20 }}
                        style={{
                          height: COMPANY_ROW_HEIGHT,
                          ...(isActive ? { backgroundColor: colors.$5 } : {}),
                        }}
                        onClick={() =>
                          preventNavigation({
                            fn: () => switchCompany(index),
                            actionKey: 'switchCompany',
                          })
                        }
                      >
                        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                          <img
                            className="rounded-full border overflow-hidden aspect-square object-cover flex-shrink-0"
                            src={
                              record.company.settings.company_logo ||
                              companySettings.smallLogo
                            }
                            alt="Company logo"
                            style={{
                              borderColor: colors.$5,
                              width: '2rem',
                            }}
                          />

                          <div className="flex flex-col min-w-0 leading-tight">
                            <span
                              className="block truncate text-sm"
                              style={{ color: colors.$3 }}
                            >
                              {name}
                            </span>

                            {isActive && (
                              <span
                                className="text-xs"
                                style={{ color: colors.$17 }}
                              >
                                {t('active')}
                              </span>
                            )}
                          </div>
                        </div>

                        {isActive && <Check color={accentColor} />}
                      </SwitcherDiv>
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-col gap-1 p-1.5">
              {shouldShowAddCompany && canUserAddCompany && isOwner && (
                <SwitcherDiv
                  className="flex items-center space-x-3 px-3 rounded-lg cursor-pointer"
                  theme={{ hoverColor: colors.$20 }}
                  style={{ height: ACTION_ROW_HEIGHT }}
                  onClick={() => {
                    setVisible(false);
                    setIsCompanyCreateModalOpened(true);
                  }}
                >
                  <Plus />

                  <span className="text-sm">{t('add_company')}</span>
                </SwitcherDiv>
              )}

              {(isAdmin || isOwner) && (
                <SwitcherDiv
                  className="flex items-center space-x-3 px-3 rounded-lg cursor-pointer"
                  theme={{ hoverColor: colors.$20 }}
                  style={{ height: ACTION_ROW_HEIGHT }}
                  onClick={() => {
                    setVisible(false);
                    preventNavigation({
                      url: '/settings/account_management',
                    });
                  }}
                >
                  <Person />

                  <span className="text-sm">{t('account_management')}</span>
                </SwitcherDiv>
              )}

              <SwitcherDiv
                className="flex items-center space-x-3 px-3 rounded-lg cursor-pointer"
                theme={{ hoverColor: colors.$20 }}
                style={{ height: ACTION_ROW_HEIGHT }}
                onClick={() => {
                  setVisible(false);
                  preventNavigation({
                    url: '/logout',
                  });
                }}
              >
                <Exit />

                <span className="text-sm">{t('logout')}</span>
              </SwitcherDiv>
            </div>
          </Panel>
        )}
      >
        <button
          type="button"
          data-cy="companyDropdown"
          onClick={() => setVisible((current) => !current)}
          className={
            isMiniSidebar
              ? 'flex items-center justify-center'
              : 'flex items-center justify-start w-full'
          }
        >
          {isMiniSidebar ? (
            <img
              className="rounded-full border overflow-hidden aspect-square object-cover"
              src={logo}
              alt="Company logo"
              style={{
                borderColor: '#e5e7eb',
                width: '1.66rem',
              }}
            />
          ) : (
            <div className="flex items-center space-x-3 p-1.5 rounded-md hover:bg-gray-700 w-full min-w-0">
              <img
                className="rounded-full border overflow-hidden aspect-square object-cover flex-shrink-0"
                src={logo}
                alt="Company logo"
                style={{
                  borderColor: '#e5e7eb',
                  width: '1.65rem',
                }}
              />

              <span className="flex-1 min-w-0 block text-sm text-start truncate text-gray-200">
                {companyName}
              </span>

              <ExpandCollapseChevron
                color="#e5e7eb"
                className="flex-shrink-0"
              />
            </div>
          )}
        </button>
      </Tippy>
    </>
  );
}

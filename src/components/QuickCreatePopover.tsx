import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BiPlus } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useQuickCreateSections } from '$app/common/hooks/entities/useQuickCreateSections';
import { useQuickCreateActions } from '$app/common/hooks/entities/useQuickCreateActions';
import { isHosted, isSelfHosted } from '$app/common/helpers';
import { useColorScheme } from '$app/common/colors';
import { styled } from 'styled-components';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { Icon } from './icons/Icon';

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
    font-weight: 500;
  }
`;

const StyledPopoverButton = styled(Popover.Button)`
  background-color: ${(props) => props.theme.backgroundColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
  }

  &:focus {
    background-color: ${(props) => props.theme.hoverBackgroundColor};
  }
`;

export function QuickCreatePopover() {
  const [t] = useTranslation();

  const preventNavigation = usePreventNavigation();

  const colors = useColorScheme();
  const actions = useQuickCreateActions();
  const sections = useQuickCreateSections();

  const user = useInjectUserChanges();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

  return (
    <Popover className="relative">
      {() => (
        <>
          <StyledPopoverButton
            data-cy="quickPopoverButton"
            className="flex items-center justify-center h-10 w-10 rounded-lg border shadow-sm focus:outline-none"
            style={{ height: '2.3rem', borderColor: colors.$5 }}
            theme={{
              hoverBackgroundColor: colors.$4,
              backgroundColor: colors.$1,
            }}
          >
            <Icon element={BiPlus} size={23} style={{ color: colors.$3 }} />
          </StyledPopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={classNames(
                'absolute z-10 mt-1.5 w-screen max-w-md -translate-x-1/2 transform px-2',
                {
                  'left-14 md:left-0 md:max-w-2xl lg:max-w-3xl lg:left-full':
                    isHosted() && !isMiniSidebar,
                  'left-14 md:left-56 md:max-w-2xl lg:max-w-3xl':
                    isHosted() && isMiniSidebar,
                  'left-14 md:left-8 lg:max-w-xl lg:left-full':
                    isSelfHosted() && !isMiniSidebar,
                  'left-14 md:left-8 lg:max-w-xl lg:left-28':
                    isSelfHosted() && isMiniSidebar,
                }
              )}
            >
              <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5">
                <div
                  style={{ backgroundColor: colors.$1 }}
                  className={classNames(
                    'relative grid gap-y-4 gap-x-2 md:gap-y-0 px-3 py-5 grid-cols-2',
                    {
                      'md:grid-cols-3': isHosted(),
                    }
                  )}
                >
                  {sections.map(
                    (section) =>
                      section.visible && (
                        <div
                          key={section.name}
                          className="flex flex-col items-start rounded-lg transition duration-150 ease-in-out"
                        >
                          <div className="flex items-center px-2">
                            <section.icon
                              color={section.iconColor}
                              size="1.3rem"
                            />

                            <p
                              style={{ color: colors.$3 }}
                              className="text-sm tracking-wide font-medium ml-1 md:ml-2"
                            >
                              {t(section.name)}
                            </p>
                          </div>

                          <div className="flex flex-col w-full mt-2 space-y-2">
                            {actions.map(
                              (action) =>
                                action.section === section.name &&
                                action.visible && (
                                  <Div
                                    theme={{
                                      hoverColor: colors.$4,
                                      textColor: colors.$3,
                                      hoverTextColor: colors.$3,
                                    }}
                                    key={action.key}
                                    className="flex items-center space-x-2 py-2 pl-2 cursor-pointer rounded"
                                    onClick={() =>
                                      preventNavigation({
                                        url: action.url,
                                        externalLink: action.externalLink,
                                      })
                                    }
                                  >
                                    <BiPlus
                                      className="hover:font-medium"
                                      size={21}
                                      style={{ color: colors.$3 }}
                                    />

                                    <span
                                      className="text-sm"
                                      style={{ color: colors.$3 }}
                                    >
                                      {t(action.key)}
                                    </span>
                                  </Div>
                                )
                            )}
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BiPlus } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useQuickCreateSections } from '$app/common/hooks/entities/useQuickCreateSections';
import { useQuickCreateActions } from '$app/common/hooks/entities/useQuickCreateActions';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { isHosted, isSelfHosted } from '$app/common/helpers';
import { MdArrowDropDown } from 'react-icons/md';

export function QuickCreatePopover() {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const accentColor = useAccentColor();
  const actions = useQuickCreateActions();
  const sections = useQuickCreateSections();

  return (
    <Popover className="relative mt-2">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              open ? 'text-gray-500' : 'text-gray-900',
              'group inline-flex items-center rounded bg-white text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:ring-offset-2'
            )}
          >
            <BiPlus className="cursor-pointer text-xl" />

            <MdArrowDropDown className="cursor-pointer text-xl" />
          </Popover.Button>

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
                'absolute left-5 lg:left-full z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2',
                {
                  'md:-left-20 md:max-w-2xl lg:max-w-3xl': isHosted(),
                  'md:left-8 lg:max-w-lg': isSelfHosted(),
                }
              )}
            >
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div
                  className={classNames(
                    'relative grid gap-y-4 md:gap-y-0 bg-white px-2 py-4 grid-cols-2',
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
                          <div className="flex items-center pl-3">
                            <section.icon
                              className="text-base"
                              color={accentColor}
                            />

                            <p className="uppercase text-sm tracking-wide font-medium text-gray-800 ml-1 md:ml-2">
                              {t(section.name)}
                            </p>
                          </div>

                          <div className="flex flex-col w-full mt-2 space-y-2">
                            {actions.map(
                              (action) =>
                                action.section === section.name &&
                                action.visible && (
                                  <div
                                    key={action.key}
                                    className="flex items-center pl-3 space-x-1 py-1 cursor-pointer hover:bg-gray-100 rounded"
                                    onClick={() => {
                                      !action.externalLink &&
                                        navigate(action.url);

                                      action.externalLink &&
                                        window.open(action.url, '_blank');
                                    }}
                                  >
                                    <BiPlus className="text-base text-gray-600" />

                                    <span className="text-sm text-gray-800">
                                      {t(action.key)}
                                    </span>
                                  </div>
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

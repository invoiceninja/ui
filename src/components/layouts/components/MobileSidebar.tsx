/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dialog, Transition } from '@headlessui/react';
import { CompanySwitcher } from '$app/components/CompanySwitcher';
import { Fragment } from 'react';
import { X } from 'react-feather';
import { NavigationItem } from './DesktopSidebar';
import { SidebarItem } from './SidebarItem';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useLogo } from '$app/common/hooks/useLogo';
import { HelpSidebarIcons } from '$app/components/HelpSidebarIcons';

interface Props {
  navigation: NavigationItem[];
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MobileSidebar(props: Props) {
  const logo = useLogo();
  const colors = useColorScheme();
  const user = useInjectUserChanges();

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

  return (
    <Transition.Root show={props.sidebarOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 flex z-40 md:hidden"
        onClose={props.setSidebarOpen}
        style={{ width: isMiniSidebar ? '4rem' : '19.4rem' }}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-ninja-gray dark:bg-gray-900">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => props.setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="text-white" />
                </button>
              </div>
            </Transition.Child>

            <div
              className="flex-shrink-0 flex items-center px-4 py-3 border-b h-16 justify-center border-gray-600"
              style={{ backgroundColor: colors.$1, color: colors.$3 }}
            >
              {isMiniSidebar ? (
                <img className="w-8" src={logo} alt="Company logo" />
              ) : (
                <CompanySwitcher />
              )}
            </div>

            <div className="flex flex-col flex-1 h-0 overflow-y-auto mt-4">
              <nav className="flex-1 space-y-1">
                {props.navigation.map((item, index) => (
                  <SidebarItem key={index} item={item} colors={colors} />
                ))}
              </nav>

              <HelpSidebarIcons mobileNavbar />
            </div>
          </div>
        </Transition.Child>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </Dialog>
    </Transition.Root>
  );
}

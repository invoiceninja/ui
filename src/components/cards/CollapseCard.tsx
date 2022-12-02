/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, Fragment, ReactNode, SetStateAction } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import CommonProps from 'common/interfaces/common-props.interface';
import { MdClose } from 'react-icons/md';
import classNames from 'classnames';

interface Props extends CommonProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  title?: string;
  actionChildren?: ReactNode;
  size: 'extraSmall' | 'small' | 'regular' | 'large' | 'extraLarge';
}

export function CollapseCard(props: Props) {
  return (
    <Transition.Root show={props.visible} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => props.setVisible(false)}
      >
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel
                  className={classNames('pointer-events-auto', 'w-screen', {
                    'max-w-xl': props.size === 'large',
                    'max-w-sm': props.size === 'small',
                    'max-w-md': props.size === 'regular',
                    'max-w-xs': props.size === 'extraSmall',
                    'max-w-4xl': props.size === 'extraLarge',
                  })}
                >
                  <form
                    onSubmit={(event) => event.preventDefault()}
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium text-gray-900">
                            {props.title}
                          </span>
                          <MdClose
                            fontSize={24}
                            className="cursor-pointer"
                            onClick={() => props.setVisible(false)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between items-center">
                        <div className="divide-y divide-gray-200 w-full">
                          {props.children}
                        </div>
                      </div>
                    </div>
                    {props.actionChildren && (
                      <div className="flex justify-center px-4 py-4">
                        {props.actionChildren}
                      </div>
                    )}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

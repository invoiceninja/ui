/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import CommonProps from 'common/interfaces/common-props.interface';
import { MdClose } from 'react-icons/md';
import classNames from 'classnames';

interface Props extends CommonProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actionChildren?: ReactNode;
  size: 'extraSmall' | 'small' | 'regular' | 'large' | 'extraLarge';
  withContainer?: boolean;
}

export function Slider(props: Props) {
  return (
    <Transition.Root show={props.visible} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={props.onClose}>
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
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
                <div className="flex flex-col flex-1 h-0 overflow-y-auto">
                  <div className="py-6 px-4 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">
                        {props.title}
                      </span>
                      <MdClose
                        fontSize={24}
                        className="cursor-pointer"
                        onClick={() => props.onClose()}
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between items-center">
                    <div
                      className={classNames(
                        'flex flex-col flex-1 divide-y divide-gray-200 w-full',
                        {
                          'p-4': props.withContainer,
                        }
                      )}
                    >
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
      </Dialog>
    </Transition.Root>
  );
}

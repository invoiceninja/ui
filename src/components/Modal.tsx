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
import classNames from 'classnames';
import { Fragment, useState, useEffect, ReactNode } from 'react';
import { X } from 'react-feather';

interface Props {
  visible: boolean;
  onClose: (status: boolean) => any;
  title: string;
  text?: string | null;
  children?: ReactNode;
  centerContent?: boolean;
  size?: 'small' | 'regular' | 'large';
  backgroundColor?: 'white' | 'gray';
  disableClosing?: boolean;
  withoutPadding?: boolean;
}

export function Modal(props: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(props.visible);
  }, [props.visible]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={(value) => {
          !props.disableClosing && setOpen(value);
          !props.disableClosing && props.onClose(value);
        }}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={classNames(
                'inline-block align-bottom rounded text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full',
                {
                  'max-w-sm':
                    props.size === 'small' || typeof props.size === 'undefined',
                  'max-w-7xl': props.size === 'large',
                  'max-w-2xl': props.size === 'regular',
                  'bg-white':
                    props.backgroundColor === 'white' ||
                    typeof props.backgroundColor === 'undefined',
                  'bg-gray-50': props.backgroundColor === 'gray',
                  'px-4 pt-5 pb-4 sm:p-6': !props.withoutPadding,
                }
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    {props.title}
                  </Dialog.Title>
                  <div className="mt-2">
                    {props.text && (
                      <p className="text-sm text-gray-500">{props.text}</p>
                    )}
                  </div>
                </div>

                {!props.disableClosing && (
                  <X
                    className="cursor-pointer"
                    onClick={() => props.onClose(false)}
                  />
                )}
              </div>

              {props.children && (
                <div
                  className={classNames(
                    'text-sm text-gray-500 flex flex-col space-y-4',
                    {
                      'justify-center items-center': props.centerContent,
                      'mt-5 sm:mt-6': !props.disableClosing,
                    }
                  )}
                >
                  {props.children}
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Fragment, useState, useEffect, ReactNode, RefObject } from 'react';
import { XMark } from './icons/XMark';

interface Props {
  visible: boolean;
  onClose: (status: boolean) => any;
  title?: string | ReactNode | null;
  text?: string | null;
  children?: ReactNode;
  centerContent?: boolean;
  size?: 'extraSmall' | 'small' | 'regular' | 'large' | 'micro';
  backgroundColor?: 'white' | 'gray';
  disableClosing?: boolean;
  overflowVisible?: boolean;
  closeButtonCypressRef?: string;
  stopPropagationInHeader?: boolean;
  renderTransitionChildAsFragment?: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  enableCloseOnClickAway?: boolean;
  withoutPadding?: boolean;
  withoutBorderLine?: boolean;
  withoutVerticalMargin?: boolean;
  withoutHorizontalPadding?: boolean;
}

interface TransitionChildProps {
  renderFragmentOnly: boolean;
  children: ReactNode;
}
function TransitionChild(props: TransitionChildProps) {
  const { renderFragmentOnly, children } = props;

  return renderFragmentOnly ? (
    <>{children}</>
  ) : (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enterTo="opacity-100 translate-y-0 sm:scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      {children}
    </Transition.Child>
  );
}

export function Modal(props: Props) {
  const [open, setOpen] = useState(false);

  const { enableCloseOnClickAway, disableClosing } = props;

  useEffect(() => {
    setOpen(props.visible);
  }, [props.visible]);

  const colors = useColorScheme();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={(value) => {
          (!disableClosing || enableCloseOnClickAway) && setOpen(value);
          (!disableClosing || enableCloseOnClickAway) && props.onClose(value);
        }}
        initialFocus={props.initialFocusRef}
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
          <TransitionChild
            renderFragmentOnly={
              Boolean(props.renderTransitionChildAsFragment) && open
            }
          >
            <div
              style={{
                backgroundColor: colors.$1,
                color: colors.$3,
                colorScheme: colors.$0,
              }}
              className={classNames(
                'inline-block align-bottom rounded-md text-left shadow-xl transform transition-all sm:my-8 sm:align-middle w-full',
                {
                  'max-w-xs': props.size === 'micro',
                  'max-w-sm':
                    props.size === 'extraSmall' ||
                    typeof props.size === 'undefined',
                  'max-w-lg': props.size === 'small',
                  'max-w-7xl': props.size === 'large',
                  'max-w-2xl': props.size === 'regular',
                  'bg-white': props.backgroundColor === 'white',
                  'bg-gray-50': props.backgroundColor === 'gray',
                  'overflow-hidden': !props.overflowVisible,
                  'pt-5 pb-5': !props.withoutPadding,
                }
              )}
              onClick={(event) =>
                props.stopPropagationInHeader && event.stopPropagation()
              }
            >
              {props.title && (
                <div
                  className={classNames(
                    'flex flex-col justify-between items-start pb-5',
                    {
                      'px-5': !props.withoutPadding,
                      'border-b': !props.withoutBorderLine,
                    }
                  )}
                  style={{
                    backgroundColor: colors.$1,
                    color: colors.$3,
                    colorScheme: colors.$0,
                    borderColor: colors.$20,
                  }}
                >
                  <div className="flex w-full justify-between isolate">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-semibold"
                      style={{
                        backgroundColor: colors.$1,
                        color: colors.$3,
                        colorScheme: colors.$0,
                      }}
                    >
                      {props.title}
                    </Dialog.Title>

                    {!props.disableClosing && (
                      <div
                        className="cursor-pointer"
                        onClick={() => props.onClose(false)}
                        data-cy={props.closeButtonCypressRef}
                      >
                        <XMark color={colors.$3} size="1rem" />
                      </div>
                    )}
                  </div>

                  {props.text && (
                    <div className="mt-2">
                      <p
                        style={{
                          backgroundColor: colors.$1,
                          color: colors.$3,
                          colorScheme: colors.$0,
                        }}
                        className="text-sm"
                      >
                        {props.text}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {props.children && (
                <div
                  style={{
                    backgroundColor: colors.$1,
                    color: colors.$3,
                    colorScheme: colors.$0,
                  }}
                  className={classNames('text-sm flex flex-col space-y-4', {
                    'justify-center items-center': props.centerContent,
                    'mt-5 sm:mt-6':
                      !props.disableClosing && !props.withoutVerticalMargin,
                    'px-5':
                      !props.withoutPadding && !props.withoutHorizontalPadding,
                  })}
                >
                  {props.children}
                </div>
              )}
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

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
import classNames from 'classnames';
import { ReactNode } from 'react';

interface Props {
  leftSide?: ReactNode;
  leftSideHelp?: ReactNode;
  pushContentToRight?: boolean;
  required?: boolean;
  children?: ReactNode;
  className?: any;
  onClick?: () => unknown;
  noExternalPadding?: boolean;
  withoutItemsCenter?: boolean;
  withoutWrappingLeftSide?: boolean;
  disabledLabels?: boolean;
  noVerticalPadding?: boolean;
}

export function Element(props: Props) {
  const colors = useColorScheme();

  return (
    <div
      className={classNames(
        `sm:grid sm:grid-cols-3 sm:gap-10 flex flex-col lg:flex-row ${props.className}`,
        {
          'px-5 sm:px-6': !props.noExternalPadding,
          'py-4 sm:py-3': !props.noVerticalPadding,
          'lg:items-center': !props.withoutItemsCenter,
        }
      )}
      onClick={props.onClick}
    >
      <dt
        className={classNames('text-sm flex flex-col', {
          'opacity-75': props.disabledLabels,
        })}
        style={{ color: colors.$3 }}
      >
        <span
          className={classNames('font-medium', {
            'whitespace-nowrap': props.withoutWrappingLeftSide,
          })}
          style={{ color: colors.$3 }}
        >
          {props.leftSide}
          {props.required && <span className="ml-1 text-red-600">*</span>}
        </span>
        {props.leftSideHelp &&
          (typeof props.leftSideHelp === 'object' ? (
            props.leftSideHelp
          ) : (
            <span
              className="text-xs"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              dangerouslySetInnerHTML={{ __html: props.leftSideHelp }}
              style={{ color: colors.$3, opacity: 0.8 }}
            ></span>
          ))}
      </dt>
      <dd
        className={classNames('mt-4 text-sm sm:mt-0 sm:col-span-2', {
          'flex flex-col sm:flex-row sm:justify-end': props.pushContentToRight,
        })}
        style={{ color: colors.$3 }}
      >
        {props.children}
      </dd>
    </div>
  );
}

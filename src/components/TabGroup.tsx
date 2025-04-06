/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';

interface Props {
  children: ReactElement[];
  tabs: string[];
  className?: string;
  defaultTabIndex?: number;
  height?: 'full';
  width?: 'full';
  childrenClassName?: string;
  withScrollableContent?: boolean;
  onTabChange?: (index: number) => void;
  formatTabLabel?: (index: number) => ReactNode | undefined;
  withoutVerticalMargin?: boolean;
  withHorizontalPadding?: boolean;
}

const StyledButton = styled.button`
  border-color: ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.textColor};

  &:hover {
    color: ${({ theme }) => theme.hoverTextColor};
  }
`;

export function TabGroup(props: Props) {
  const colors = useColorScheme();

  const { withoutVerticalMargin, withHorizontalPadding = false } = props;

  const [currentIndex, setCurrentIndex] = useState(props.defaultTabIndex || 0);

  const handleTabChange = (index: number) => {
    setCurrentIndex(index);

    props.onTabChange?.(index);
  };

  useEffect(() => {
    setCurrentIndex(props.defaultTabIndex || 0);
  }, [props.defaultTabIndex]);

  return (
    <div className={props.className} data-cy="tabs">
      <div className="-mb-px flex overflow-x-auto">
        {withHorizontalPadding && (
          <div
            style={{ borderBottom: `2px solid ${colors.$20}`, width: '7rem' }}
          />
        )}

        {props.tabs.map((tab, index) => (
          <div
            key={index}
            className={classNames({ 'w-full': props.width === 'full' })}
          >
            <StyledButton
              className={classNames(
                'whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm',
                { 'w-full': props.width === 'full' }
              )}
              type="button"
              onClick={() => handleTabChange(index)}
              theme={{
                borderColor: currentIndex === index ? colors.$3 : colors.$20,
                textColor: currentIndex === index ? colors.$3 : colors.$17,
                hoverTextColor: colors.$3,
              }}
            >
              {props.formatTabLabel?.(index) || tab}
            </StyledButton>
          </div>
        ))}

        {withHorizontalPadding && (
          <div
            style={{ borderBottom: `2px solid ${colors.$20}`, width: '7rem' }}
          />
        )}
      </div>

      <div
        className={classNames(props.childrenClassName, {
          'flex flex-1': props.height === 'full',
          'my-4': props.height !== 'full' && !withoutVerticalMargin,
          'overflow-y-scroll px-[5px]': props.withScrollableContent,
        })}
      >
        {[...props.children].map(
          (element, index) =>
            React.isValidElement(element) &&
            React.cloneElement(element, {
              key: index,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className: classNames(element.props?.className, {
                'flex flex-col flex-1': props.height === 'full',
                'block my-4': props.height !== 'full' && !withoutVerticalMargin,
                hidden: currentIndex !== index,
              }),
            })
        )}
      </div>
    </div>
  );
}

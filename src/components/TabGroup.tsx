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
import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
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
  horizontalPaddingWidth?: string;
  fullRightPadding?: boolean;
  style?: CSSProperties;
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

  const {
    withoutVerticalMargin,
    withHorizontalPadding = false,
    horizontalPaddingWidth = '7rem',
    fullRightPadding = false,
    style,
  } = props;

  const [currentIndex, setCurrentIndex] = useState(props.defaultTabIndex || 0);

  const handleTabChange = (index: number) => {
    setCurrentIndex(index);

    props.onTabChange?.(index);
  };

  useEffect(() => {
    setCurrentIndex(props.defaultTabIndex || 0);
  }, [props.defaultTabIndex]);

  return (
    <div
      className={classNames(props.className, {
        'w-full': props.width === 'full',
      })}
      data-cy="tabs"
      style={style}
    >
      <div className="flex justify-between relative">
        <div className="flex flex-1 overflow-x-auto relative">
          {withHorizontalPadding && (
            <div
              style={{
                width: horizontalPaddingWidth,
                height: '100%',
                borderBottom: `1px solid ${colors.$20}`,
              }}
            />
          )}

          {props.tabs.map((tab, index) => (
            <div
              key={index}
              className={classNames({
                'flex-1': props.width === 'full',
              })}
            >
              <StyledButton
                className={classNames(
                  'whitespace-nowrap font-medium text-sm py-3 px-4',
                  {
                    'w-full': props.width === 'full',
                  }
                )}
                type="button"
                onClick={() => handleTabChange(index)}
                theme={{
                  textColor: currentIndex === index ? colors.$3 : colors.$17,
                  hoverTextColor: colors.$3,
                }}
                style={{
                  borderBottom:
                    currentIndex === index
                      ? `1px solid ${colors.$3}`
                      : `1px solid ${colors.$20}`,
                }}
              >
                {props.formatTabLabel?.(index) || tab}
              </StyledButton>
            </div>
          ))}

          <div
            className={classNames({
              'flex-1': !withHorizontalPadding || fullRightPadding,
            })}
            style={{
              ...(Boolean(withHorizontalPadding && !fullRightPadding) && {
                width: horizontalPaddingWidth,
              }),
              height: '100%',
              borderBottom: `1px solid ${colors.$20}`,
            }}
          />
        </div>
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

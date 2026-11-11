/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { detectOverflow } from '@popperjs/core';
import Tippy, { TippyProps } from '@tippyjs/react/headless';
import classNames from 'classnames';
import {
  Children,
  cloneElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown } from 'react-feather';
import { useClickAway } from 'react-use';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import CommonProps from '../../common/interfaces/common-props.interface';
import { DropdownElement } from './DropdownElement';

interface Props extends CommonProps {
  label?: string | null;
  cardActions?: boolean;
  cypressRef?: string;
  /** When set, applied to the trigger control as data-cy (defaults to chevronDownButton). */
  triggerCypressRef?: string;
  customLabel?: ReactNode;
  minWidth?: string;
  maxWidth?: string;
  labelButtonBorderColor?: string;
}

const LabelButton = styled.button`
  color: ${(props) => props.theme.color} !important;
  background-color: ${(props) => props.theme.backgroundColor} !important;
  border-color: ${(props) => props.theme.borderColor} !important;
`;

const DropdownElements = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const DROPDOWN_OFFSET = 10;
const VIEWPORT_PADDING = 5;

const popperOptions: TippyProps['popperOptions'] = {
  modifiers: [
    { name: 'flip', enabled: false },
    {
      name: 'openTowardsSpace',
      enabled: true,
      phase: 'beforeRead',
      fn: ({ state }) => {
        const overflow = detectOverflow(state, {
          elementContext: 'reference',
          altBoundary: true,
        });

        const spaceAbove = -overflow.top;
        const spaceBelow = -overflow.bottom;

        state.placement = spaceAbove > spaceBelow ? 'top' : 'bottom';

        const availableHeight = Math.floor(
          Math.max(spaceAbove, spaceBelow) - DROPDOWN_OFFSET - VIEWPORT_PADDING
        );

        state.modifiersData.openTowardsSpace = { availableHeight };

        const content = state.elements.popper.firstElementChild;

        if (content instanceof HTMLElement && availableHeight > 0) {
          const contentHeight =
            content.scrollHeight + content.offsetHeight - content.clientHeight;

          state.rects.popper.height = Math.min(contentHeight, availableHeight);
        }
      },
    },
    {
      name: 'applyAvailableHeight',
      enabled: true,
      phase: 'write',
      fn: ({ state }) => {
        const content = state.elements.popper.firstElementChild;
        const { availableHeight } = state.modifiersData.openTowardsSpace ?? {};

        if (content instanceof HTMLElement && availableHeight > 0) {
          content.style.maxHeight = `${availableHeight}px`;
        }
      },
    },
  ],
};

export function Dropdown(props: Props) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const [children, setChildren] = useState<ReactNode>();

  const getPropsWithChildType = (
    childType: string | typeof DropdownElement,
    index: number
  ) => {
    if (childType === 'div') {
      return {
        onClick: () => setVisible(false),
        key: index,
      };
    } else {
      return { setVisible, key: index };
    }
  };

  useClickAway(ref, () => {
    visible && setVisible(false);
  });

  useEffect(() => {
    setChildren(Children.toArray(props.children));
  }, [props.children]);

  return (
    <div ref={ref}>
      <Tippy
        disabled={props.disabled}
        placement="bottom"
        interactive={true}
        popperOptions={popperOptions}
        render={() => (
          <DropdownElements
            theme={{ hoverColor: colors.$2 }}
            className={`border box rounded-md shadow-lg py-1 focus:outline-none whitespace-normal overflow-y-auto overscroll-contain ${props.className}`}
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$19,
              minWidth: props.minWidth ?? '12rem',
              maxWidth: props.maxWidth ?? '14.7rem',
            }}
            data-cy={props.cypressRef}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            {children?.map((child, index: number) =>
              child &&
              (child['type'] == DropdownElement || child['type'] == 'div')
                ? cloneElement(
                    child,
                    getPropsWithChildType(child['type'], index)
                  )
                : child
            )}
          </DropdownElements>
        )}
        visible={visible}
      >
        {props.customLabel ? (
          <div
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setVisible(!visible);
            }}
          >
            {props.customLabel}
          </div>
        ) : (
          <LabelButton
            theme={{
              backgroundColor: colors.$18,
              color: colors.$1,
              borderColor: props.labelButtonBorderColor || colors.$24,
            }}
            type="button"
            disabled={props.disabled}
            onClick={() => setVisible(!visible)}
            className={classNames(
              `border inline-flex items-center space-x-2 px-4 justify-center rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-75 py-2 ${props.className}`,
              {
                'hover:bg-white hover:border-gray-300': !props.cardActions,
                'hover:opacity-90': props.cardActions,
              }
            )}
            style={{
              backgroundColor: props.cardActions ? accentColor : '',
              color: props.cardActions ? 'white' : '',
            }}
            data-cy={props.triggerCypressRef ?? 'chevronDownButton'}
          >
            {!props.cardActions && <span>{props.label}</span>}
            <ChevronDown size={props.cardActions ? 18 : 14} />
          </LabelButton>
        )}
      </Tippy>
    </div>
  );
}

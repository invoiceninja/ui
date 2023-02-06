/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Tippy from '@tippyjs/react/headless';
import CommonProps from '../../common/interfaces/common-props.interface';
import { ChevronDown } from 'react-feather';
import {
  Children,
  cloneElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DropdownElement } from './DropdownElement';
import { useClickAway } from 'react-use';
import classNames from 'classnames';
import { useAccentColor } from 'common/hooks/useAccentColor';

interface Props extends CommonProps {
  label?: string | null;
  cardActions?: boolean;
}

export function Dropdown(props: Props) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

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
        render={() => (
          <div
            className={`box rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none ${props.className}`}
            style={{ minWidth: '12rem', maxWidth: '14.7rem' }}
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
          </div>
        )}
        visible={visible}
      >
        <button
          type="button"
          disabled={props.disabled}
          onClick={() => setVisible(!visible)}
          className={classNames(
            `inline-flex text-gray-900 border border-transparent dark:border-transparent items-center space-x-2 justify-center py-1.5 px-3 rounded text-sm  dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-75 ${props.className}`,
            {
              'hover:bg-white hover:border-gray-300': !props.cardActions,
              'hover:opacity-90': props.cardActions,
            }
          )}
          style={{
            backgroundColor: props.cardActions && accentColor,
            color: props.cardActions ? 'white' : '',
          }}
        >
          {!props.cardActions && <span>{props.label}</span>}
          <ChevronDown size={props.cardActions ? 18 : 14} />
        </button>
      </Tippy>
    </div>
  );
}

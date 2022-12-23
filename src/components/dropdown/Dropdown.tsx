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
import { cloneElement, useRef, useState } from 'react';
import { DropdownElement } from './DropdownElement';
import { useClickAway } from 'react-use';

interface Props extends CommonProps {
  label?: string | null;
}

export function Dropdown(props: Props) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useClickAway(ref, () => {
    visible && setVisible(false);
  });

  return (
    <div ref={ref}>
      <Tippy
        disabled={props.disabled}
        placement="bottom"
        interactive={true}
        render={() => (
          <div
            className={`box rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none ${props.className}`}
            style={{ minWidth: 192, maxWidth: 235 }}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            {props.children?.map((child, index: number) =>
              child && child['type'] == DropdownElement
                ? cloneElement(child, { setVisible, key: index })
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
          className="hover:bg-white inline-flex text-gray-900 border border-transparent hover:border-gray-300 dark:border-transparent items-center space-x-2 justify-center py-1.5 px-3 rounded text-sm  dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed"
        >
          <span>{props.label}</span>
          <ChevronDown size={14} />
        </button>
      </Tippy>
    </div>
  );
}

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
import { cloneElement, useState } from 'react';
import { DropdownElement } from './DropdownElement';

interface Props extends CommonProps {
  label?: string;
}

export function Dropdown(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Tippy
        disabled={props.disabled}
        placement="bottom"
        interactive={true}
        render={() => (
          <div
            className={`box w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none ${props.className}`}
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

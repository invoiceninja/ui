/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import Tippy from '@tippyjs/react/headless';
import CommonProps from '../../common/interfaces/common-props.interface';
import { ChevronDown, Divide } from 'react-feather';

interface Props extends CommonProps {
  label?: string;
}

export function Dropdown(props: Props) {
  return (
    <div>
      <Tippy
        placement="bottom"
        trigger="click"
        interactive={true}
        render={(attrs) => (
          <div
            className={`box mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${props.className}`}
          >
            {props.children}
          </div>
        )}
      >
        <button className="inline-flex text-gray-900 border border-gray-300 bg-white items-center space-x-2 justify-center py-2 px-4 rounded text-sm undefined text-white">
          <span>{props.label}</span>
          <ChevronDown size={14} />
        </button>
      </Tippy>
    </div>
  );
}

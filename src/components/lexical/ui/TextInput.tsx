/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';

import './Input.css';

import { HTMLInputTypeAttribute } from 'react';
import classNames from 'classnames';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useColorScheme } from '$app/common/colors';

type Props = Readonly<{
  'data-test-id'?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
  type?: HTMLInputTypeAttribute;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  'data-test-id': dataTestId,
  type = 'text',
}: Props): JSX.Element {
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  return (
    <div className="Input__wrapper">
      <label className="Input__label" style={{ color: colors.$3 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        data-test-id={dataTestId}
        className={classNames(
          'Input__input w-full py-2 px-3 rounded-md text-sm disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-0 border',
          {
            'border-[#09090B26] focus:border-black': !reactSettings.dark_mode,
            'border-[#1f2e41] focus:border-white': reactSettings.dark_mode,
          }
        )}
        style={{
          color: colors.$3,
          borderColor: colors.$24,
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}

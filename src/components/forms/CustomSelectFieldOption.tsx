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
import React from 'react';
import { OptionProps } from 'react-select';
import styled from 'styled-components';

const Option = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function CustomSelectFieldOption({
  children,
  isSelected,
  isFocused,
  innerProps,
}: OptionProps<any>) {
  const colors = useColorScheme();

  console.log(innerProps);

  return (
    <Option
      {...innerProps}
      className="flex items-center px-6 py-2 cursor-pointer"
      theme={{ hoverColor: colors.$7 }}
      style={{
        color: colors.$3,
        backgroundColor: isSelected || isFocused ? colors.$7 : colors.$1,
      }}
    >
      {React.Children.toArray(children).map((element, index) =>
        element ? (
          React.isValidElement(element) ? (
            React.cloneElement(element)
          ) : (
            element
          )
        ) : (
          <div key={index}>{element}</div>
        )
      )}
    </Option>
  );
}

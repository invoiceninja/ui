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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { ReactNode } from 'react';
import styled from 'styled-components';

const ChoiceButton = styled.button`
  transition: border-color 150ms ease, background-color 150ms ease;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hover};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.focus};
    outline-offset: 2px;
  }
`;

interface Props {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
}

export function Choice({ selected, onSelect, title, detail, trailing }: Props) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();

  return (
    <ChoiceButton
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      theme={{ hover: colors.$25, focus: accentColor }}
      className="w-full flex items-center gap-3 text-left px-3.5 py-2.5 border"
      style={{
        borderRadius: '0.375rem',
        borderColor: selected ? colors.$3 : colors.$24,
        backgroundColor: colors.$1,
      }}
    >
      <span
        aria-hidden
        className="shrink-0 grid place-items-center"
        style={{
          width: '1rem',
          height: '1rem',
          borderRadius: '999px',
          border: `1px solid ${selected ? colors.$3 : colors.$5}`,
        }}
      >
        {selected ? (
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '999px',
              backgroundColor: colors.$3,
            }}
          />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="block text-sm"
          style={{ color: colors.$3, fontWeight: 500 }}
        >
          {title}
        </span>
        {detail ? (
          <span className="block text-xs mt-0.5" style={{ color: colors.$17 }}>
            {detail}
          </span>
        ) : null}
      </span>

      {trailing ? (
        <span className="shrink-0 text-xs" style={{ color: colors.$17 }}>
          {trailing}
        </span>
      ) : null}
    </ChoiceButton>
  );
}

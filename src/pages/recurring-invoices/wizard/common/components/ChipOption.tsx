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
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  muted?: boolean;
  selected?: boolean;
}

export function ChipOption({ children, onClick, muted, selected }: Props) {
  const colors = useColorScheme();

  return (
    <button
      type="button"
      role={typeof selected === 'boolean' ? 'option' : undefined}
      aria-selected={typeof selected === 'boolean' ? selected : undefined}
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-xs"
      style={{
        color: muted ? colors.$17 : colors.$3,
        backgroundColor: selected ? colors.$25 : 'transparent',
        fontWeight: selected ? 500 : 400,
      }}
      onMouseEnter={(event) =>
        (event.currentTarget.style.backgroundColor = colors.$25)
      }
      onMouseLeave={(event) =>
        (event.currentTarget.style.backgroundColor = selected
          ? colors.$25
          : 'transparent')
      }
    >
      {children}
    </button>
  );
}

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
import { useTranslation } from 'react-i18next';

interface Props {
  onClick: () => void;
}

export function RemoveItemButton({ onClick }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${t('remove')} ${t('item').toLowerCase()}`}
      className="absolute grid place-items-center leading-none"
      style={{
        top: '0.375rem',
        right: '0.375rem',
        width: '1.5rem',
        height: '1.5rem',
        fontSize: '0.9375rem',
        color: colors.$17,
        borderRadius: '0.375rem',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = colors.$25;
        event.currentTarget.style.color = colors.$3;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = 'transparent';
        event.currentTarget.style.color = colors.$17;
      }}
    >
      ✕
    </button>
  );
}

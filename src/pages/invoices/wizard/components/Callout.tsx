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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function Callout({ title, children, onDismiss, dismissLabel }: Props) {
  const reactSettings = useReactSettings();
  const colors = useColorScheme();
  const [t] = useTranslation();

  return (
    <div
      className="border px-4 py-3.5"
      style={{
        borderRadius: '0.375rem',
        borderColor: colors.$24,
        backgroundColor: reactSettings?.dark_mode ? colors.$25 : colors.$2,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm" style={{ color: colors.$3, fontWeight: 500 }}>
          {title}
        </p>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs"
            style={{ color: colors.$17, fontWeight: 500 }}
          >
            {dismissLabel ?? t('skip')}
          </button>
        ) : null}
      </div>

      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

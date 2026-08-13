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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const StepTransition = styled.div`
  animation: stepTransitionIn 240ms cubic-bezier(0.22, 1, 0.36, 1) both;

  @keyframes stepTransitionIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const PreviewFrame = styled.div`
  .flex.flex-col.w-full {
    height: 38rem !important;
  }
`;

export function Legend({ children }: { children: ReactNode }) {
  const colors = useColorScheme();

  return (
    <div
      className="text-sm mb-2"
      style={{ color: colors.$22, fontWeight: 500 }}
    >
      {children}
    </div>
  );
}

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

interface ChoiceProps {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
}

export function Choice({
  selected,
  onSelect,
  title,
  detail,
  trailing,
}: ChoiceProps) {
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

export function Footer({
  back,
  children,
}: {
  back?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">{back}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

const MAPPED_ERROR_KEYS = [
  'client_id',
  'date',
  'due_date',
  'amount',
  'contacts',
  'name',
];

export function ErrorBanner({ errors }: { errors?: ValidationBag }) {
  if (!errors?.errors) {
    return null;
  }

  const unmapped = Object.entries(errors.errors)
    .filter(
      ([key]) => !MAPPED_ERROR_KEYS.some((known) => key.startsWith(known))
    )
    .flatMap(([, messages]) => messages);

  if (!unmapped.length) {
    return null;
  }

  return (
    <div className="border-l-4 border-red-500 bg-red-50 py-2 mb-4">
      <div className="mx-4 space-y-1">
        {unmapped.map((message) => (
          <p key={message} className="text-sm text-red-700">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}

export function Callout({
  title,
  children,
  onDismiss,
  dismissLabel,
}: {
  title: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
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

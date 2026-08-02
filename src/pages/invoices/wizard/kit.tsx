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

export const radius = {
  panel: '0.375rem',
  control: '0.375rem',
  pill: '999px',
};

export function useTheme() {
  const colors = useColorScheme();
  const accent = useAccentColor();

  return {
    colors,
    accent,
    dark: colors.$0 === 'dark',
    surface: colors.$1,
    desk: colors.$23,
    text: colors.$3,
    muted: colors.$17,
    label: colors.$22,
    line: colors.$24,
    hairline: colors.$20,
    hover: colors.$25,
  };
}

export function Motion() {
  return (
    <style>{`
      @keyframes iw-enter {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: none; }
      }
      .iw-enter { animation: iw-enter 240ms cubic-bezier(0.22, 1, 0.36, 1) both; }
      @media (prefers-reduced-motion: reduce) {
        .iw-enter { animation: none !important; }
        * { transition-duration: 0.01ms !important; }
      }
    `}</style>
  );
}

export function Question({ children }: { children: ReactNode }) {
  const t = useTheme();

  return (
    <h2
      className="text-xl mb-6"
      style={{ color: t.text, fontWeight: 600, letterSpacing: '-0.01em' }}
    >
      {children}
    </h2>
  );
}

export function Legend({ children }: { children: ReactNode }) {
  const t = useTheme();

  return (
    <div className="text-sm mb-2" style={{ color: t.label, fontWeight: 500 }}>
      {children}
    </div>
  );
}

const ChoiceButton = styled.button`
  transition: border-color 150ms ease, background-color 150ms ease;

  &:hover:not(:disabled) {
    background-color: ${(p) => p.theme.hover};
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.focus};
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
  const t = useTheme();

  return (
    <ChoiceButton
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      theme={{ hover: t.hover, focus: t.accent }}
      className="w-full flex items-center gap-3 text-left px-3.5 py-2.5 border"
      style={{
        borderRadius: radius.control,
        borderColor: selected ? t.colors.$3 : t.line,
        backgroundColor: t.surface,
      }}
    >
      <span
        aria-hidden
        className="shrink-0 grid place-items-center"
        style={{
          width: '1rem',
          height: '1rem',
          borderRadius: '999px',
          border: `1px solid ${selected ? t.colors.$3 : t.colors.$5}`,
        }}
      >
        {selected ? (
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '999px',
              backgroundColor: t.colors.$3,
            }}
          />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="block text-sm"
          style={{ color: t.text, fontWeight: 500 }}
        >
          {title}
        </span>
        {detail ? (
          <span className="block text-xs mt-0.5" style={{ color: t.muted }}>
            {detail}
          </span>
        ) : null}
      </span>

      {trailing ? (
        <span className="shrink-0 text-xs" style={{ color: t.muted }}>
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

export function Callout({
  title,
  children,
  onDismiss,
  dismissLabel = 'Skip',
}: {
  title: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  const t = useTheme();

  return (
    <div
      className="border px-4 py-3.5"
      style={{
        borderRadius: radius.panel,
        borderColor: t.line,
        backgroundColor: t.dark ? t.colors.$25 : t.colors.$2,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm" style={{ color: t.text, fontWeight: 500 }}>
          {title}
        </p>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs"
            style={{ color: t.muted, fontWeight: 500 }}
          >
            {dismissLabel}
          </button>
        ) : null}
      </div>

      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

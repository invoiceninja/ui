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
import {
  ButtonHTMLAttributes,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  useEffect,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

export const radius = {
  panel: '0.625rem',
  control: '0.5rem',
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
    solid: colors.$18,
    onSolid: colors.$1,
  };
}

export function Motion() {
  return (
    <style>{`
      @keyframes iw-enter {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes iw-settle {
        0%   { background-color: var(--iw-settle); }
        100% { background-color: transparent; }
      }
      @keyframes iw-spin { to { transform: rotate(360deg); } }
      @keyframes iw-pulse {
        0%, 100% { opacity: 0.45; }
        50%      { opacity: 0.9; }
      }
      .iw-enter { animation: iw-enter 240ms cubic-bezier(0.22, 1, 0.36, 1) both; }
      .iw-settle { animation: iw-settle 620ms ease-out both; }
      @media (prefers-reduced-motion: reduce) {
        .iw-enter, .iw-settle { animation: none !important; }
        * { transition-duration: 0.01ms !important; }
      }
    `}</style>
  );
}

interface QuestionProps {
  children: ReactNode;
  lede?: ReactNode;
}

export function Question({ children, lede }: QuestionProps) {
  const t = useTheme();

  return (
    <header className="mb-7">
      <h1
        className="text-[1.75rem] lg:text-[2rem] leading-[1.12]"
        style={{
          color: t.text,
          fontWeight: 600,
          letterSpacing: '-0.022em',
          textWrap: 'balance',
        }}
      >
        {children}
      </h1>

      {lede ? (
        <p
          className="mt-2.5 text-[0.9375rem] leading-6"
          style={{ color: t.muted, maxWidth: '34rem' }}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}

export function Legend({ children }: { children: ReactNode }) {
  const t = useTheme();

  return (
    <div
      className="text-[0.8125rem] mb-2.5"
      style={{ color: t.label, fontWeight: 500 }}
    >
      {children}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  const t = useTheme();

  return (
    <p className="text-xs mt-1.5 leading-5" style={{ color: t.muted }}>
      {children}
    </p>
  );
}

export function Danger({ children }: { children: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <p className="text-xs mt-1.5 leading-5" style={{ color: '#DC2626' }}>
      {children}
    </p>
  );
}

const Pressable = styled.button`
  transition: background-color 150ms ease, border-color 150ms ease,
    color 150ms ease, opacity 150ms ease;

  &:hover:not(:disabled) {
    background-color: ${(p) => p.theme.hoverBackground} !important;
    border-color: ${(p) => p.theme.hoverBorder} !important;
    color: ${(p) => p.theme.hoverColor} !important;
  }

  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

type Tone = 'solid' | 'outline' | 'ghost' | 'quiet';

interface ActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  busy?: boolean;
  block?: boolean;
  children: ReactNode;
}

export function Action({
  tone = 'outline',
  busy = false,
  block = false,
  children,
  className,
  disabled,
  ...rest
}: ActionProps) {
  const t = useTheme();

  const palette = {
    solid: {
      background: t.solid,
      color: t.onSolid,
      border: 'transparent',
      hoverBackground: t.solid,
      hoverBorder: 'transparent',
      hoverColor: t.onSolid,
    },
    outline: {
      background: t.surface,
      color: t.text,
      border: t.line,
      hoverBackground: t.hover,
      hoverBorder: t.line,
      hoverColor: t.text,
    },
    ghost: {
      background: 'transparent',
      color: t.text,
      border: 'transparent',
      hoverBackground: t.hover,
      hoverBorder: 'transparent',
      hoverColor: t.text,
    },
    quiet: {
      background: 'transparent',
      color: t.muted,
      border: 'transparent',
      hoverBackground: 'transparent',
      hoverBorder: 'transparent',
      hoverColor: t.text,
    },
  }[tone];

  return (
    <Pressable
      {...rest}
      disabled={disabled || busy}
      theme={{
        hoverBackground: palette.hoverBackground,
        hoverBorder: palette.hoverBorder,
        hoverColor: palette.hoverColor,
        focus: t.accent,
      }}
      className={`inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 border ${
        block ? 'w-full' : ''
      } ${className ?? ''}`}
      style={{
        backgroundColor: palette.background,
        color: palette.color,
        borderColor: palette.border,
        borderRadius: radius.control,
        fontWeight: 500,
        lineHeight: 1.25,
      }}
    >
      {busy ? <Spinner tone={tone === 'solid' ? t.onSolid : t.muted} /> : null}
      {children}
    </Pressable>
  );
}

export function Spinner({ tone }: { tone: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: '0.875rem',
        height: '0.875rem',
        borderRadius: '999px',
        border: `2px solid ${tone}`,
        borderTopColor: 'transparent',
        display: 'inline-block',
        animation: 'iw-spin 700ms linear infinite',
      }}
    />
  );
}

const Bordered = styled.div`
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus-within {
    border-color: ${(p) => p.theme.focusBorder} !important;
  }
`;

const Bare = styled.input`
  &::placeholder {
    color: ${(p) => p.theme.placeholder};
  }
  &:focus {
    outline: none;
  }
`;

const BareArea = styled.textarea`
  &::placeholder {
    color: ${(p) => p.theme.placeholder};
  }
  &:focus {
    outline: none;
  }
`;

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  align?: 'left' | 'right';
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      hint,
      error,
      prefix,
      suffix,
      align = 'left',
      className,
      ...rest
    }: TextFieldProps,
    ref
  ) {
    const t = useTheme();
    const id = useId();

    return (
      <div className={className}>
        {label ? (
          <label
            htmlFor={rest.id ?? id}
            className="block text-[0.8125rem] mb-1.5"
            style={{ color: t.label, fontWeight: 500 }}
          >
            {label}
          </label>
        ) : null}

        <Bordered
          theme={{ focusBorder: error ? '#DC2626' : t.text }}
          className="flex items-center border"
          style={{
            backgroundColor: t.surface,
            borderColor: error ? '#DC2626' : t.line,
            borderRadius: radius.control,
          }}
        >
          {prefix ? (
            <span
              className="pl-3 text-sm select-none"
              style={{ color: t.muted }}
              aria-hidden
            >
              {prefix}
            </span>
          ) : null}

          <Bare
            {...rest}
            ref={ref}
            id={rest.id ?? id}
            theme={{ placeholder: t.muted }}
            className="w-full bg-transparent text-sm px-3 py-2.5 border-0"
            style={{
              color: t.text,
              textAlign: align,
              fontVariantNumeric:
                align === 'right' ? 'tabular-nums' : undefined,
            }}
          />

          {suffix ? (
            <span
              className="pr-3 text-sm select-none"
              style={{ color: t.muted }}
              aria-hidden
            >
              {suffix}
            </span>
          ) : null}
        </Bordered>

        {error ? <Danger>{error}</Danger> : hint ? <Hint>{hint}</Hint> : null}
      </div>
    );
  }
);

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
}

export function TextArea({ label, hint, className, ...rest }: TextAreaProps) {
  const t = useTheme();
  const id = useId();

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={rest.id ?? id}
          className="block text-[0.8125rem] mb-1.5"
          style={{ color: t.label, fontWeight: 500 }}
        >
          {label}
        </label>
      ) : null}

      <Bordered
        theme={{ focusBorder: t.text }}
        className="border"
        style={{
          backgroundColor: t.surface,
          borderColor: t.line,
          borderRadius: radius.control,
        }}
      >
        <BareArea
          {...rest}
          id={rest.id ?? id}
          theme={{ placeholder: t.muted }}
          className="w-full bg-transparent text-sm px-3 py-2.5 border-0 resize-none"
          style={{ color: t.text, lineHeight: 1.55 }}
        />
      </Bordered>

      {hint ? <Hint>{hint}</Hint> : null}
    </div>
  );
}

const ChoiceButton = styled.button`
  transition: border-color 150ms ease, background-color 150ms ease;

  &:hover:not(:disabled) {
    border-color: ${(p) => p.theme.hoverBorder};
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
      theme={{ hoverBorder: selected ? t.text : t.muted, focus: t.accent }}
      className="w-full flex items-center gap-3 text-left px-3.5 py-3 border"
      style={{
        borderRadius: radius.control,
        borderColor: selected ? t.text : t.line,
        backgroundColor: selected ? t.hover : t.surface,
        boxShadow: selected ? `inset 0 0 0 1px ${t.text}` : 'none',
      }}
    >
      <span
        aria-hidden
        className="shrink-0 grid place-items-center"
        style={{
          width: '1.05rem',
          height: '1.05rem',
          borderRadius: '999px',
          border: `1.5px solid ${selected ? t.text : t.line}`,
        }}
      >
        {selected ? (
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '999px',
              backgroundColor: t.text,
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

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: ReactNode;
  detail?: ReactNode;
}

export function Toggle({ checked, onChange, label, detail }: ToggleProps) {
  const t = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 text-left w-full"
    >
      <span
        aria-hidden
        className="shrink-0 mt-0.5"
        style={{
          width: '2.25rem',
          height: '1.25rem',
          borderRadius: '999px',
          backgroundColor: checked ? t.text : t.colors.$5,
          position: 'relative',
          transition: 'background-color 150ms ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '0.1875rem',
            left: checked ? '1.1875rem' : '0.1875rem',
            width: '0.875rem',
            height: '0.875rem',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
            transition: 'left 150ms ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          }}
        />
      </span>

      <span className="min-w-0">
        <span className="block text-sm" style={{ color: t.text }}>
          {label}
        </span>
        {detail ? (
          <span className="block text-xs mt-0.5" style={{ color: t.muted }}>
            {detail}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  const t = useTheme();

  return (
    <div
      className={`border ${padded ? 'p-4' : ''} ${className ?? ''}`}
      style={{
        backgroundColor: t.surface,
        borderColor: t.line,
        borderRadius: radius.panel,
      }}
    >
      {children}
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
        <p
          className="text-sm leading-6"
          style={{ color: t.text, fontWeight: 500 }}
        >
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

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: string;
}

const FOCUSABLE =
  'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function Sheet({
  open,
  onClose,
  title,
  children,
  width = '30rem',
}: SheetProps) {
  const t = useTheme();
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();

        return;
      }

      if (event.key !== 'Tab' || !panel.current) {
        return;
      }

      const stops = Array.from(
        panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((node) => node.offsetParent !== null);

      if (!stops.length) {
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    const target =
      panel.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.current;
    target?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus?.();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(9, 9, 11, 0.45)' }}
        onClick={onClose}
      />

      <div
        ref={panel}
        tabIndex={-1}
        className="relative w-full iw-enter focus:outline-none"
        style={{
          maxWidth: width,
          backgroundColor: t.surface,
          borderRadius: radius.panel,
          border: `1px solid ${t.line}`,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.35)',
          maxHeight: '86vh',
          overflowY: 'auto',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0"
          style={{ borderColor: t.hairline, backgroundColor: t.surface }}
        >
          <h2
            id={titleId}
            className="text-base"
            style={{ color: t.text, fontWeight: 600 }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-sm leading-none p-1"
            style={{ color: t.muted }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function Pill({ children }: { children: ReactNode }) {
  const t = useTheme();

  return (
    <span
      className="inline-flex items-center text-[0.6875rem] px-2 py-0.5"
      style={{
        borderRadius: radius.pill,
        backgroundColor: t.dark ? t.colors.$25 : t.colors.$15,
        color: t.muted,
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </span>
  );
}

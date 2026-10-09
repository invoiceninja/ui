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
import { Plus } from '$app/components/icons/Plus';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { hexToRgba } from '../helpers/hex-to-rgba';

const PANEL_WIDTH = 288;
const PANEL_MARGIN = 12;
const PANEL_MAX_HEIGHT = 320;
const PANEL_MIN_HEIGHT = 160;

interface Placement {
  left: number;
  top: number;
  maxHeight: number;
  above: boolean;
}

interface Props {
  label: ReactNode;
  applied: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function ChipMenu({ label, applied, disabled, children }: Props) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [placement, setPlacement] = useState<Placement>();
  const chip = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const anchor = chip.current?.getBoundingClientRect();

    if (!anchor) {
      return;
    }

    const roomBelow = window.innerHeight - anchor.bottom - PANEL_MARGIN;
    const roomAbove = anchor.top - PANEL_MARGIN;
    const above = roomBelow < PANEL_MIN_HEIGHT && roomAbove > roomBelow;

    setPlacement({
      left: Math.max(
        PANEL_MARGIN,
        Math.min(anchor.left, window.innerWidth - PANEL_MARGIN - PANEL_WIDTH)
      ),
      top: above ? anchor.top - 6 : anchor.bottom + 6,
      maxHeight: Math.max(
        PANEL_MIN_HEIGHT,
        Math.min(PANEL_MAX_HEIGHT, above ? roomAbove : roomBelow)
      ),
      above,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    reposition();

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (chip.current?.contains(target) || panel.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        chip.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, reposition]);

  return (
    <div className="inline-block">
      <button
        ref={chip}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border"
        style={{
          borderRadius: '0.375rem',
          borderColor: applied ? colors.$24 : hexToRgba(accentColor, 0.35),
          color: applied ? colors.$3 : accentColor,
          backgroundColor: applied ? colors.$25 : hexToRgba(accentColor, 0.1),
          fontWeight: 500,
          opacity: disabled ? 0.6 : hovered ? 0.75 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {applied ? null : <Plus size="0.6875rem" color={accentColor} />}
        {label}
      </button>

      {open && placement
        ? createPortal(
            <div
              ref={panel}
              onClick={() => setOpen(false)}
              className="fixed flex flex-col border overflow-hidden"
              style={{
                left: placement.left,
                top: placement.top,
                width: PANEL_WIDTH,
                maxHeight: placement.maxHeight,
                transform: placement.above ? 'translateY(-100%)' : undefined,
                zIndex: 50,
                backgroundColor: colors.$1,
                borderColor: colors.$24,
                borderRadius: '0.375rem',
                boxShadow: '0 12px 32px -12px rgba(9,9,11,0.28)',
              }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

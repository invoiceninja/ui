/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Popover, Transition } from '@headlessui/react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Checkbox } from '$app/components/forms';
import { Message } from '$app/components/icons/Message';

export interface CellEdit {
  duration?: string;
  description?: string;
  billable?: boolean;
}

interface WeeklyCellProps {
  taskId: string;
  dayKey: string;
  durationText: string;
  isPending: boolean;
  disabled?: boolean;
  initialBillable: boolean;
  initialDescription: string;
  onEdit: (partial: CellEdit) => void;
}

export function WeeklyCell({
  durationText,
  isPending,
  disabled,
  initialBillable,
  initialDescription,
  onEdit,
}: WeeklyCellProps) {
  const colors = useColorScheme();
  const iconBtnRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const reposition = useCallback(() => {
    const rect = iconBtnRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanelPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right + window.scrollX,
    });
  }, []);

  useEffect(() => {
    if (!panelPos) return;
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [panelPos, reposition]);

  const hasNote = Boolean(initialDescription) || initialBillable === false;
  const cellRootRef = useRef<HTMLDivElement>(null);

  const moveFocusToAdjacentCell = (direction: 'next' | 'prev') => {
    const all = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[data-weekly-cell]')
    );
    const ownInput = cellRootRef.current?.querySelector<HTMLInputElement>(
      'input[data-weekly-cell]'
    );
    if (!ownInput) return;
    const idx = all.indexOf(ownInput);
    if (idx === -1) return;
    const target = direction === 'next' ? all[idx + 1] : all[idx - 1];
    target?.focus();
    target?.select?.();
  };

  return (
    <div className="relative" ref={cellRootRef}>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9:.]*"
        data-weekly-cell="1"
        value={durationText}
        readOnly={disabled}
        title={
          disabled
            ? 'Stop the running timer to edit'
            : 'Decimal hours (1.5) or h:m (1:30)'
        }
        onKeyDown={(event) => {
          if (disabled) return;
          if (
            event.key.length > 1 ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
          ) {
            return;
          }
          if (!/^[0-9:.]$/.test(event.key)) {
            event.preventDefault();
          }
        }}
        onPaste={(event) => {
          if (disabled) return;
          const pasted = event.clipboardData.getData('text');
          if (!/^[0-9:.]*$/.test(pasted)) {
            event.preventDefault();
          }
        }}
        onChange={(event) => {
          if (disabled) return;
          const cleaned = event.target.value.replace(/[^0-9:.]/g, '');
          onEdit({ duration: cleaned });
        }}
        placeholder="0"
        className="w-full text-center py-2 pl-2 pr-7 rounded-md text-sm border focus:outline-none focus:ring-2"
        style={{
          backgroundColor: colors.$1,
          color: isPending ? colors.$17 : colors.$3,
          borderColor: isPending ? colors.$17 : colors.$5,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
      <Popover className="absolute inset-y-0 right-0 flex items-center pr-1">
        {({ open, close }) => {
          if (open && !panelPos) reposition();
          if (!open && panelPos) setPanelPos(null);

          return (
            <>
              <Popover.Button
                ref={iconBtnRef}
                disabled={disabled}
                tabIndex={-1}
                className="p-1 rounded hover:opacity-80 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="note"
                title={
                  disabled
                    ? 'Stop the running timer to edit'
                    : 'Note & billable'
                }
              >
                <Message
                  size="0.95rem"
                  color={hasNote ? colors.$17 : colors.$5}
                />
              </Popover.Button>

              {open &&
                panelPos &&
                createPortal(
                  <Transition
                    show={open}
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Popover.Panel
                      static
                      className="fixed z-50 w-72 rounded-md border shadow-lg p-3 -translate-x-full"
                      style={{
                        top: panelPos.top - window.scrollY,
                        left: panelPos.left - window.scrollX,
                        backgroundColor: colors.$1,
                        borderColor: colors.$5,
                        color: colors.$3,
                      }}
                    >
                      <CellNotePanel
                        initialBillable={initialBillable}
                        initialDescription={initialDescription}
                        onEdit={onEdit}
                        onDone={() => close()}
                        onTabAway={(direction) => {
                          close();
                          setTimeout(
                            () => moveFocusToAdjacentCell(direction),
                            0
                          );
                        }}
                      />
                    </Popover.Panel>
                  </Transition>,
                  document.body
                )}
            </>
          );
        }}
      </Popover>
    </div>
  );
}

interface CellNotePanelProps {
  initialBillable: boolean;
  initialDescription: string;
  onEdit: (partial: CellEdit) => void;
  onDone: () => void;
  onTabAway: (direction: 'next' | 'prev') => void;
}

function CellNotePanel({
  initialBillable,
  initialDescription,
  onEdit,
  onDone,
  onTabAway,
}: CellNotePanelProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [billable, setBillable] = useState(initialBillable);
  const [description, setDescription] = useState(initialDescription);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const doneRef = useRef<HTMLButtonElement>(null);

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    onTabAway(event.shiftKey ? 'prev' : 'next');
  };

  return (
    <div className="space-y-3" onKeyDown={handlePanelKeyDown}>
      <div>
        <label className="block text-xs mb-1" style={{ color: colors.$17 }}>
          {t('description')}
        </label>
        <textarea
          ref={textareaRef}
          rows={3}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            onEdit({ description: event.target.value });
          }}
          className="w-full py-2 px-3 rounded-md text-sm border focus:outline-none focus:ring-0"
          style={{
            backgroundColor: colors.$1,
            color: colors.$3,
            borderColor: colors.$5,
          }}
        />
      </div>

      <Checkbox
        label={t('billable')}
        checked={billable}
        onValueChange={(_, checked) => {
          const next = Boolean(checked);
          setBillable(next);
          onEdit({ billable: next });
        }}
      />

      <div className="flex justify-end">
        <button
          ref={doneRef}
          type="button"
          onClick={onDone}
          className="text-sm px-3 py-1 rounded-md border"
          style={{ borderColor: colors.$5, color: colors.$3 }}
        >
          {t('done')}
        </button>
      </div>
    </div>
  );
}

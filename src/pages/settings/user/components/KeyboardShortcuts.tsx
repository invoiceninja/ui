/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  KeyboardShortcutOverride,
  useDraftOrCommittedReactSettings,
  useUpdateDraftOrReactSettings,
} from '$app/common/hooks/useReactSettings';
import {
  keyboardShortcutGroups,
  keyboardShortcuts,
  ShortcutDefinition,
} from '$app/common/constants/keyboard-shortcuts';
import {
  bindingFromEvent,
  formatBinding,
} from '$app/common/helpers/keyboard-shortcuts';
import { useState } from 'react';
import { Refresh } from '$app/components/icons/Refresh';
import { CircleXMark } from '$app/components/icons/CircleXMark';

type Overrides = Record<string, KeyboardShortcutOverride | null>;

export function KeyboardShortcuts() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const reactSettings = useDraftOrCommittedReactSettings();
  const updateSettings = useUpdateDraftOrReactSettings();

  const overrides = (reactSettings.preferences.keyboard_shortcuts ??
    {}) as Overrides;

  const [recordingId, setRecordingId] = useState<string | null>(null);

  const bindingFor = (definition: ShortcutDefinition): string | null => {
    if (Object.prototype.hasOwnProperty.call(overrides, definition.id)) {
      const override = overrides[definition.id];
      return override === null ? null : override.keys;
    }

    return definition.defaultBinding;
  };

  const isCustomized = (definition: ShortcutDefinition): boolean =>
    Object.prototype.hasOwnProperty.call(overrides, definition.id);

  const conflicts = (() => {
    const byBinding: Record<string, string[]> = {};

    for (const definition of keyboardShortcuts) {
      const binding = bindingFor(definition);
      if (!binding) {
        continue;
      }

      (byBinding[binding] ??= []).push(definition.id);
    }

    const conflicting = new Set<string>();
    for (const ids of Object.values(byBinding)) {
      if (ids.length > 1) {
        ids.forEach((id) => conflicting.add(id));
      }
    }

    return conflicting;
  })();

  const writeOverrides = (next: Overrides) => {
    updateSettings('preferences.keyboard_shortcuts', next);
  };

  const setBinding = (definition: ShortcutDefinition, keys: string) => {
    if (keys === definition.defaultBinding) {
      resetBinding(definition);
      return;
    }

    writeOverrides({ ...overrides, [definition.id]: { keys } });
  };

  const disableBinding = (definition: ShortcutDefinition) => {
    writeOverrides({ ...overrides, [definition.id]: null });
  };

  const resetBinding = (definition: ShortcutDefinition) => {
    if (!isCustomized(definition)) {
      return;
    }

    const next = { ...overrides };
    delete next[definition.id];
    writeOverrides(next);
  };

  const handleRecord = (
    definition: ShortcutDefinition,
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      setRecordingId(null);
      return;
    }

    const binding = bindingFromEvent(event);

    if (!binding) {
      return;
    }

    setBinding(definition, binding);
    setRecordingId(null);
  };

  return (
    <div className="px-4 sm:px-6 pt-4 space-y-6">
      <div>
        <div className="text-lg font-medium">{t('keyboard_shortcuts')}</div>
        <div className="text-sm" style={{ color: colors.$17 }}>
          {t('keyboard_shortcuts_help')}
        </div>
      </div>

      {keyboardShortcutGroups.map((group) => (
        <div key={group.labelKey} className="space-y-1">
          <div
            className="text-xs uppercase tracking-wide font-medium pb-1"
            style={{ color: colors.$17 }}
          >
            {t(group.labelKey)}
          </div>

          {group.shortcuts.map((definition) => {
            const binding = bindingFor(definition);
            const isRecording = recordingId === definition.id;
            const hasConflict = conflicts.has(definition.id);

            return (
              <div
                key={definition.id}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: colors.$20 }}
              >
                <div className="text-sm font-medium">
                  {t(definition.labelKey)}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    autoFocus={isRecording}
                    onClick={() =>
                      setRecordingId(isRecording ? null : definition.id)
                    }
                    onKeyDown={(event) =>
                      isRecording ? handleRecord(definition, event) : undefined
                    }
                    onBlur={() => isRecording && setRecordingId(null)}
                    className="min-w-[9rem] text-center text-sm rounded px-3 py-1.5 border transition-colors"
                    style={{
                      color: colors.$3,
                      borderColor: isRecording
                        ? colors.$8
                        : hasConflict
                        ? '#ef4444'
                        : colors.$5,
                      backgroundColor: colors.$1,
                    }}
                    title={
                      hasConflict
                        ? (t('shortcut_conflict') as string)
                        : undefined
                    }
                  >
                    {isRecording
                      ? t('press_keys')
                      : binding === null
                      ? t('disabled')
                      : formatBinding(binding)}
                  </button>

                  <ResetButton
                    visible={isCustomized(definition)}
                    onClick={() => resetBinding(definition)}
                    title={t('reset')}
                  />

                  <DisableButton
                    visible={binding !== null}
                    onClick={() => disableBinding(definition)}
                    title={t('disable')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface IconButtonProps {
  visible: boolean;
  onClick: () => void;
  title: string;
}

function ResetButton({ visible, onClick, title }: IconButtonProps) {
  const colors = useColorScheme();

  return (
    <span
      className="cursor-pointer hover:opacity-75"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      onClick={visible ? onClick : undefined}
      title={title}
    >
      <Refresh size="1.1rem" color={colors.$17} />
    </span>
  );
}

function DisableButton({ visible, onClick, title }: IconButtonProps) {
  const colors = useColorScheme();

  return (
    <span
      className="cursor-pointer hover:opacity-75"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      onClick={visible ? onClick : undefined}
      title={title}
    >
      <CircleXMark
        color={colors.$16}
        hoverColor={colors.$3}
        borderColor={colors.$5}
        hoverBorderColor={colors.$17}
        size="1.4rem"
      />
    </span>
  );
}

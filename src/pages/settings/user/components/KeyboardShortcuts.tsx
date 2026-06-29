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
  formatBinding,
  formatRecorderPreview,
} from '$app/common/helpers/keyboard-shortcuts';
import { useShortcutRecorder } from '$app/common/hooks/useShortcutRecorder';
import { useMemo, useState } from 'react';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { InputField } from '$app/components/forms';

type Overrides = Record<string, KeyboardShortcutOverride | null>;

const DEFAULT_SELECTED_ID = 'create_client';

export function KeyboardShortcuts() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const reactSettings = useDraftOrCommittedReactSettings();
  const updateSettings = useUpdateDraftOrReactSettings();

  const overrides = (reactSettings.preferences.keyboard_shortcuts ??
    {}) as Overrides;

  const [selectedId, setSelectedId] = useState<string>(DEFAULT_SELECTED_ID);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return keyboardShortcutGroups
      .map((group) => {
        return {
          ...group,
          shortcuts: group.shortcuts.filter((definition) => {
            return t(definition.labelKey).toLowerCase().includes(query);
          }),
        };
      })
      .filter((group) => {
        return group.shortcuts.length > 0;
      });
  }, [searchQuery]);

  const bindingFor = (definition: ShortcutDefinition) => {
    const override = overrides[definition.id];
    return override ? override.keys : null;
  };

  const conflictsByBinding = (() => {
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
        ids.forEach((id) => {
          conflicting.add(id);
        });
      }
    }

    return conflicting;
  })();

  const writeOverrides = (next: Overrides) => {
    updateSettings('preferences.keyboard_shortcuts', next);
  };

  const setBinding = (definition: ShortcutDefinition, keys: string) => {
    writeOverrides({ ...overrides, [definition.id]: { keys } });
  };

  const disableBinding = (definition: ShortcutDefinition) => {
    const next = { ...overrides };
    delete next[definition.id];
    writeOverrides(next);
  };

  const disableAllBindings = () => {
    writeOverrides({});
  };

  const hasAnyEnabled = keyboardShortcuts.some((definition) => {
    return bindingFor(definition) !== null;
  });

  const selectedDefinition =
    keyboardShortcuts.find((definition) => {
      return definition.id === selectedId;
    }) ?? keyboardShortcuts[0];

  return (
    <div className="px-4 sm:px-6 pt-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm" style={{ color: colors.$17 }}>
          {t('keyboard_shortcuts_help')}
        </div>

        {hasAnyEnabled && (
          <button
            type="button"
            onClick={disableAllBindings}
            className="shrink-0 text-sm rounded px-3 py-1.5 border hover:opacity-75 transition-colors"
            style={{ color: colors.$3, borderColor: colors.$5 }}
          >
            {t('disable_all')}
          </button>
        )}
      </div>

      <div
        className="flex h-96 rounded-md border overflow-hidden"
        style={{ borderColor: colors.$20 }}
      >
        <div
          className="w-1/2 flex flex-col border-r"
          style={{ borderColor: colors.$20 }}
        >
          <div
            className="p-3 border-b"
            style={{ borderColor: colors.$20, backgroundColor: colors.$2 }}
          >
            <InputField
              value={searchQuery}
              onValueChange={(value) => setSearchQuery(value)}
              placeholder={t('search')}
              changeOverride
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredGroups.map((group) => {
              return (
                <div key={group.labelKey}>
                  <div
                    className="text-xs uppercase tracking-wide font-medium px-4 py-2 sticky top-0"
                    style={{ color: colors.$17, backgroundColor: colors.$2 }}
                  >
                    {t(group.labelKey)}
                  </div>

                  {group.shortcuts.map((definition) => {
                    const isSelected = definition.id === selectedId;
                    const hasShortcut = bindingFor(definition) !== null;

                    return (
                      <button
                        key={definition.id}
                        type="button"
                        onClick={() => setSelectedId(definition.id)}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center transition-colors"
                        style={{
                          color: colors.$3,
                          backgroundColor: isSelected
                            ? colors.$5
                            : 'transparent',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <span
                          className="mr-2 h-2 w-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: hasShortcut
                              ? '#22c55e'
                              : '#ef4444',
                          }}
                          title={
                            hasShortcut
                              ? (t('shortcut_set') as string)
                              : (t('no_shortcut_set') as string)
                          }
                        />

                        <span className="truncate">
                          {t(definition.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div
                className="px-4 py-6 text-sm text-center"
                style={{ color: colors.$17 }}
              >
                {t('no_records_found')}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 p-6 flex items-center justify-center overflow-y-auto">
          <ShortcutDetail
            key={selectedDefinition.id}
            definition={selectedDefinition}
            binding={bindingFor(selectedDefinition)}
            hasConflict={conflictsByBinding.has(selectedDefinition.id)}
            onCommit={(keys) => setBinding(selectedDefinition, keys)}
            onDisable={() => disableBinding(selectedDefinition)}
          />
        </div>
      </div>
    </div>
  );
}

interface ShortcutDetailProps {
  definition: ShortcutDefinition;
  binding: string | null;
  hasConflict: boolean;
  onCommit: (keys: string) => void;
  onDisable: () => void;
}

function ShortcutDetail({
  definition,
  binding,
  hasConflict,
  onCommit,
  onDisable,
}: ShortcutDetailProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const recorder = useShortcutRecorder({ onCommit });

  const buttonLabel = useMemo(() => {
    if (recorder.isRecording) {
      return formatRecorderPreview(recorder.preview) || t('press_keys');
    }

    if (binding === null) {
      return t('enable');
    }

    return formatBinding(binding);
  }, [recorder.isRecording, recorder.preview, binding]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-sm font-medium" style={{ color: colors.$17 }}>
        {t(definition.labelKey)}
      </div>

      <button
        type="button"
        onClick={() =>
          recorder.isRecording ? recorder.stop() : recorder.start()
        }
        className="min-w-[12rem] text-center text-base rounded px-4 py-3 border transition-colors"
        style={{
          color: colors.$3,
          borderColor: recorder.isRecording
            ? colors.$8
            : hasConflict
            ? '#ef4444'
            : colors.$5,
          backgroundColor: colors.$1,
        }}
        title={hasConflict ? (t('shortcut_conflict') as string) : undefined}
      >
        {buttonLabel}
      </button>

      <div className="min-h-[1.5rem] flex items-center">
        {!recorder.isRecording &&
          (binding === null ? (
            <span
              className="text-xs flex items-center gap-1.5"
              style={{ color: colors.$17 }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: '#ef4444' }}
              />
              {t('disabled')}
            </span>
          ) : (
            <DetailAction visible onClick={onDisable} label={t('disable')}>
              <CircleXMark
                color={colors.$16}
                hoverColor={colors.$3}
                borderColor={colors.$5}
                hoverBorderColor={colors.$17}
                size="1.3rem"
              />
            </DetailAction>
          ))}
      </div>
    </div>
  );
}

interface DetailActionProps {
  visible: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function DetailAction({
  visible,
  onClick,
  label,
  children,
}: DetailActionProps) {
  const colors = useColorScheme();

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs hover:opacity-75"
      style={{ color: colors.$17 }}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

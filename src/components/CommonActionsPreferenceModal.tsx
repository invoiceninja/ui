/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Modal } from './Modal';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons/Icon';
import { MdClose } from 'react-icons/md';
import { SearchableSelect } from './SearchableSelect';

export interface CommonAction {
  value: string;
  label: string;
}

export type Entity = 'invoice';

interface Props {
  entity: Entity;
  defaultCommonActions: Record<Entity, CommonAction[]>;
  allCommonActions: Record<Entity, CommonAction[]>;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export const commonActionsPreferencesAtom = atomWithStorage<
  Record<Entity, CommonAction[]> | undefined
>('actionPreferences', undefined);

export function CommonActionsPreferenceModal(props: Props) {
  const [t] = useTranslation();

  const [commonActionsAtom, setCommonActionsAtom] = useAtom(
    commonActionsPreferencesAtom
  );

  const [commonActionsPreferences, setCommonActionsPreferences] = useState<
    Record<Entity, CommonAction[]> | undefined
  >(commonActionsAtom);

  const [availableActions, setAvailableActions] = useState<CommonAction[]>([]);

  const { entity, allCommonActions, visible, setVisible } = props;

  const [selectedAction, setSelectedAction] = useState<string>('');

  const isActionSelectable = (actionKey: string) => {
    if (!commonActionsPreferences) return true;

    return !commonActionsPreferences[entity].some(
      ({ value }) => value === actionKey
    );
  };

  const handleRemoveAction = (actionKey: string) => {
    const filteredCommonActions = commonActionsPreferences?.[entity].filter(
      ({ value }) => actionKey !== value
    );

    if (filteredCommonActions) {
      setCommonActionsPreferences(
        (current) =>
          current && {
            ...current,
            [entity]: filteredCommonActions,
          }
      );
    }
  };

  useEffect(() => {
    if (selectedAction) {
      const commonAction = allCommonActions[entity].find(
        ({ value }) => selectedAction === value
      );

      if (commonAction) {
        setCommonActionsPreferences((current) =>
          current
            ? {
                ...current,
                [entity]: [...current[entity], commonAction],
              }
            : {
                [entity]: [commonAction],
              }
        );
      }

      setSelectedAction('');
    }
  }, [selectedAction]);

  useEffect(() => {
    if (commonActionsPreferences && commonActionsPreferences[entity]) {
      setAvailableActions(
        allCommonActions[entity].filter(
          ({ value }) =>
            !commonActionsPreferences[entity].some(
              (action) => action.value === value
            )
        )
      );
    } else {
      setAvailableActions(allCommonActions[entity]);
    }
  }, [commonActionsPreferences]);

  return (
    <Modal
      title={`${t(entity)} ${t('actions')} ${t('preferences')}`}
      visible={visible}
      onClose={() => {
        setVisible(false);
        setCommonActionsPreferences(commonActionsAtom);
      }}
      overflowVisible
    >
      <div className="flex flex-col space-y-4">
        <SearchableSelect
          value={selectedAction}
          onValueChange={(value) => setSelectedAction(value)}
          label={t('actions')}
          disabled={commonActionsPreferences?.[entity].length === 3}
          clearAfterSelection
        >
          {availableActions.map(({ label, value }) => (
            <option
              key={value}
              value={value}
              disabled={!isActionSelectable(value)}
            >
              {label}
            </option>
          ))}
        </SearchableSelect>

        {Boolean(commonActionsPreferences?.[entity].length) && (
          <span className="font-medium">
            {t('selected')} {t('actions')}:
          </span>
        )}

        {Boolean(commonActionsPreferences?.[entity].length) && (
          <div className="flex flex-col space-y-3">
            {commonActionsPreferences?.[entity].map(({ value, label }) => (
              <div key={value} className="flex justify-between">
                <span className="font-medium">{label}</span>

                <div>
                  <Icon
                    className="cursor-pointer"
                    element={MdClose}
                    size={25}
                    onClick={() => handleRemoveAction(value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => {
            setCommonActionsAtom(commonActionsPreferences);
            setVisible(false);
          }}
        >
          {t('save')}
        </Button>
      </div>
    </Modal>
  );
}

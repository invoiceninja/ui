/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Modal } from './Modal';
import { Button, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useAllCommonActions } from '$app/common/hooks/useCommonActions';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { toast } from '$app/common/helpers/toast/toast';
import { isEqual } from 'lodash';
import {
  useReactSettings,
  useSaveReactSettings,
} from '$app/common/hooks/useReactSettings';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';
import { GridDotsVertical } from './icons/GridDotsVertical';
import { useColorScheme } from '$app/common/colors';
import { CircleXMark } from './icons/CircleXMark';

export interface CommonAction {
  value: string;
  label: string;
}

export type Entity =
  | 'invoice'
  | 'credit'
  | 'quote'
  | 'recurring_invoice'
  | 'purchase_order';

interface Props {
  entity: Entity;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function CommonActionsPreferenceModal(props: Props) {
  const [t] = useTranslation();

  const { entity, visible, setVisible } = props;

  const user = useCurrentUser();
  const colors = useColorScheme();
  const commonActions = useAllCommonActions();
  const reactSettings = useReactSettings();
  const saveSettings = useSaveReactSettings();

  const [commonActionsPreferences, setCommonActionsPreferences] = useState<
    Partial<Record<Entity, string[]>> | undefined
  >(reactSettings.common_actions);

  // Avoid re-seeding on atom reference churn from unrelated settings writes.
  const lastHydratedActionsRef = useRef(reactSettings.common_actions);
  useEffect(() => {
    if (!isEqual(reactSettings.common_actions, lastHydratedActionsRef.current)) {
      lastHydratedActionsRef.current = reactSettings.common_actions;
      setCommonActionsPreferences(reactSettings.common_actions);
    }
  }, [reactSettings.common_actions]);

  const [availableActions, setAvailableActions] = useState<CommonAction[]>([]);

  const allCommonActions = commonActions[entity];

  const [selectedAction, setSelectedAction] = useState<string>('');

  const disableSaveButton = () => {
    return isEqual(reactSettings.common_actions, commonActionsPreferences);
  };

  const getActionLabel = (actionKey: string) => {
    return (
      allCommonActions.find(({ value }) => value === actionKey)?.label || ''
    );
  };

  const handleUpdateUserDetails = () => {
    if (!user?.id) return;
    toast.processing();
    saveSettings('common_actions', commonActionsPreferences)
      .then(() => toast.success('updated_settings'))
      .catch(() => toast.dismiss());
  };

  const handleRemoveAction = (actionKey: string) => {
    const filteredCommonActions = (
      commonActionsPreferences?.[entity] || []
    ).filter((value) => actionKey !== value);

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

  const onDragEnd = (result: DropResult) => {
    const sortedActions: string[] = arrayMoveImmutable(
      commonActionsPreferences?.[entity] as string[],
      result.source.index,
      result.destination?.index as unknown as number
    );

    setCommonActionsPreferences(
      (current) =>
        current && {
          ...current,
          [entity]: sortedActions,
        }
    );
  };

  const handleReset = () => {
    setCommonActionsPreferences((current) =>
      current
        ? {
            ...current,
            [entity]: reactSettings.common_actions?.[entity] || [],
          }
        : {
            [entity]: [],
          }
    );
  };

  useEffect(() => {
    if (selectedAction) {
      const commonAction = allCommonActions.find(
        ({ value }) => selectedAction === value
      );

      if (commonAction) {
        setCommonActionsPreferences((current) =>
          current
            ? {
                ...current,
                [entity]: [...(current[entity] || []), commonAction.value],
              }
            : {
                [entity]: [commonAction.value],
              }
        );
      }

      setSelectedAction('');
    }
  }, [selectedAction]);

  useEffect(() => {
    if (commonActionsPreferences && commonActionsPreferences[entity]) {
      setAvailableActions(
        allCommonActions.filter(
          ({ value }) =>
            !(commonActionsPreferences[entity] || []).some(
              (actionKey) => actionKey === value
            )
        )
      );
    } else {
      setAvailableActions(allCommonActions);
    }
  }, [commonActionsPreferences]);

  return (
    <Modal
      title={`${t(`${entity}s`)} ${t('actions')} ${t('preferences')}`}
      visible={visible}
      onClose={() => {
        setVisible(false);
        setCommonActionsPreferences(reactSettings.common_actions);
      }}
      overflowVisible
    >
      <div className="flex flex-col space-y-4">
        <SelectField
          className="shadow-sm"
          label={t('actions')}
          value={selectedAction}
          onValueChange={(value) => setSelectedAction(value)}
          clearAfterSelection
          customSelector
        >
          {availableActions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>

        <div className="flex flex-col space-y-2">
          {Boolean((commonActionsPreferences?.[entity] || []).length) && (
            <span className="font-medium" style={{ color: colors.$16 }}>
              {t('selected')} {t('actions')}
            </span>
          )}

          {Boolean((commonActionsPreferences?.[entity] || []).length) && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="preference-actions"
                renderClone={(provided, _, rubric) => (
                  <div
                    className="flex items-center justify-between text-sm"
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    <div className="flex items-center space-x-2">
                      <GridDotsVertical size="1.2rem" color={colors.$17} />

                      <span className="font-medium">
                        {getActionLabel(
                          (commonActionsPreferences?.[entity] || [])[
                            rubric.source.index
                          ] as string
                        )}
                      </span>
                    </div>

                    <div>
                      <CircleXMark
                        color={colors.$16}
                        hoverColor={colors.$3}
                        borderColor={colors.$5}
                        hoverBorderColor={colors.$17}
                        size="1.6rem"
                      />
                    </div>
                  </div>
                )}
              >
                {(droppableProvided) => (
                  <div
                    className="flex flex-col"
                    {...droppableProvided.droppableProps}
                    ref={droppableProvided.innerRef}
                  >
                    {(commonActionsPreferences?.[entity] || []).map(
                      (actionKey, index) => (
                        <Draggable
                          key={index}
                          draggableId={index.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="flex items-center justify-between py-1.5"
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              key={index}
                            >
                              <div
                                className="flex flex-1 items-center space-x-2 cursor-pointer"
                                {...provided.dragHandleProps}
                              >
                                <div>
                                  <GridDotsVertical
                                    size="1.2rem"
                                    color={colors.$17}
                                  />
                                </div>

                                <span className="font-medium">
                                  {getActionLabel(actionKey)}
                                </span>
                              </div>

                              <div
                                className="cursor-pointer"
                                onClick={() => handleRemoveAction(actionKey)}
                              >
                                <CircleXMark
                                  color={colors.$16}
                                  hoverColor={colors.$3}
                                  borderColor={colors.$5}
                                  hoverBorderColor={colors.$17}
                                  size="1.6rem"
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    )}

                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="flex space-x-2 justify-end">
          <Button behavior="button" type="secondary" onClick={handleReset}>
            {t('reset')}
          </Button>

          <Button
            behavior="button"
            onClick={() => {
              handleUpdateUserDetails();
              setVisible(false);
            }}
            disabled={disableSaveButton()}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

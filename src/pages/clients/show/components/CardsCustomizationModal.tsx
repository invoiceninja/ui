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
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { User } from '$app/common/interfaces/user';
import { Button, SelectField } from '$app/components/forms';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { set } from 'lodash';
import { Gear } from '$app/components/icons/Gear';
import { Modal } from '$app/components/Modal';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { toast } from '$app/common/helpers/toast/toast';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';
import { GridDotsVertical } from '$app/components/icons/GridDotsVertical';

const Box = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  border-color: ${(props) => props.theme.borderColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export type ClientShowCard =
  | 'details'
  | 'address'
  | 'contacts'
  | 'standing'
  | 'email_history'
  | 'gateways'
  | 'public_notes'
  | 'private_notes';

const ALL_CARDS: ClientShowCard[] = [
  'details',
  'address',
  'contacts',
  'standing',
  'gateways',
  'public_notes',
  'private_notes',
];

export function CardsCustomizationModal() {
  const [t] = useTranslation();

  const user = useCurrentUser();
  const colors = useColorScheme();

  const dispatch = useDispatch();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [currentCards, setCurrentCards] = useState<ClientShowCard[]>([]);

  const handleDelete = (card: ClientShowCard) => {
    setCurrentCards((current) => current.filter((c) => c !== card));
  };

  const handleClose = () => {
    if (user?.company_user?.react_settings?.client_show_cards) {
      setCurrentCards(
        cloneDeep(user.company_user.react_settings.client_show_cards)
      );
    } else {
      setCurrentCards(['details', 'address', 'contacts', 'standing']);
    }

    setIsVisible(false);
  };

  const handleUpdateUserDetails = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      const updatedUser = cloneDeep(user) as User;

      set(
        updatedUser,
        'company_user.react_settings.client_show_cards',
        currentCards
      );

      request(
        'PUT',
        endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
        updatedUser
      )
        .then((response: GenericSingleResourceResponse<CompanyUser>) => {
          set(updatedUser, 'company_user', response.data.data);

          $refetch(['company_users']);

          dispatch(updateUser(updatedUser));
          dispatch(resetChanges());

          toast.success();

          setIsVisible(false);
        })
        .finally(() => {
          setIsFormBusy(false);
        });
    }
  };

  useEffect(() => {
    if (user?.company_user?.react_settings?.client_show_cards) {
      setCurrentCards(
        cloneDeep(
          user.company_user.react_settings.client_show_cards.filter(
            (card) => card !== 'email_history'
          )
        )
      );
    } else {
      setCurrentCards(['details', 'address', 'contacts', 'standing']);
    }
  }, [user?.company_user?.react_settings?.client_show_cards]);

  const onDragEnd = (result: DropResult) => {
    const filtered = arrayMoveImmutable(
      currentCards,
      result.source.index,
      result.destination?.index as unknown as number
    );

    setCurrentCards(filtered);
  };

  return (
    <>
      <Box
        className="p-1.5 sm:p-[0.6rem] border rounded-md shadow-sm cursor-pointer"
        theme={{
          hoverColor: colors.$4,
          backgroundColor: colors.$1,
          borderColor: colors.$24,
        }}
        onClick={() => setIsVisible(true)}
      >
        <Gear size="1.2rem" color={colors.$3} />
      </Box>

      <Modal
        title={t('customize_cards')}
        visible={isVisible}
        onClose={handleClose}
        overflowVisible
      >
        <div className="flex flex-col space-y-6">
          <SelectField
            label={t('cards')}
            value=""
            onValueChange={(value) =>
              setCurrentCards((current) => [
                ...current,
                value as ClientShowCard,
              ])
            }
            clearAfterSelection
            customSelector
          >
            {ALL_CARDS.filter((card) => !currentCards.includes(card)).map(
              (card) => (
                <option key={card} value={card}>
                  {t(card)}
                </option>
              )
            )}
          </SelectField>

          {currentCards.length ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="client-show-cards"
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
                        {t((currentCards || [])[rubric.source.index] as string)}
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
                    {(currentCards || []).map((card, index) => (
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

                              <span className="font-medium">{t(card)}</span>
                            </div>

                            <div
                              className="cursor-pointer"
                              onClick={() => handleDelete(card)}
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
                    ))}

                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <span className="text-sm font-medium" style={{ color: colors.$3 }}>
              {t('no_cards_selected')}.
            </span>
          )}

          <Button
            behavior="button"
            disableWithoutIcon
            disabled={isFormBusy}
            onClick={handleUpdateUserDetails}
          >
            {t('save')}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default CardsCustomizationModal;

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
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { User } from '$app/common/interfaces/user';
import { set } from 'lodash';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdRefresh, MdRestorePage } from 'react-icons/md';
import styled from 'styled-components';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useDispatch } from 'react-redux';
import { updateUser } from '$app/common/stores/slices/user';
import { DashboardGridLayouts } from './DashboardGrid.types';

const StyledDiv = styled.div`
  &:hover {
    &:hover {
      background-color: ${(props) => props.theme.hoverBgColor};
    }
  }
`;

interface Props {
  layoutBreakpoint: string | undefined;
  setLayouts: Dispatch<SetStateAction<DashboardGridLayouts>>;
  setAreCardsRestored: Dispatch<SetStateAction<boolean>>;
}

export function RestoreCardsModal(props: Props) {
  const [t] = useTranslation();

  const { layoutBreakpoint, setAreCardsRestored } = props;

  const dispatch = useDispatch();

  const user = useCurrentUser();
  const colors = useColorScheme();
  const settings = useReactSettings();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentCards, setCurrentCards] = useState<string[]>();

  const handleOnClose = () => {
    setIsModalOpen(false);
    setCurrentCards(undefined);
  };

  const handleRestoreCards = () => {
    if (!isFormBusy && currentCards) {
      toast.processing();
      setIsFormBusy(true);

      const updatedUser = cloneDeep(user) as User;

      set(
        updatedUser,
        `company_user.react_settings.removed_dashboard_cards.${layoutBreakpoint}`,
        [...currentCards]
      );

      request(
        'PUT',
        endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
        updatedUser
      )
        .then((response: GenericSingleResourceResponse<CompanyUser>) => {
          setAreCardsRestored(true);

          setTimeout(() => {
            set(updatedUser, 'company_user', response.data.data);

            toast.success('restored');

            $refetch(['company_users']);

            dispatch(updateUser(updatedUser));

            props.setLayouts(
              cloneDeep(
                response.data.data.react_settings
                  .dashboard_cards_configuration as DashboardGridLayouts
              )
            );

            handleOnClose();
          }, 50);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (
      settings?.removed_dashboard_cards &&
      isModalOpen &&
      !currentCards &&
      layoutBreakpoint
    ) {
      setCurrentCards(settings?.removed_dashboard_cards[layoutBreakpoint]);
    }
  }, [settings?.removed_dashboard_cards, isModalOpen, layoutBreakpoint]);

  return (
    <>
      <Modal
        title={t('restore')}
        visible={isModalOpen}
        onClose={() => handleOnClose()}
        disableClosing={isFormBusy}
      >
        {Boolean(!currentCards?.length) && (
          <span className="font-medium">{t('no_records_found')}</span>
        )}

        {Boolean(currentCards?.length) && (
          <div className="flex flex-col space-y-2">
            {currentCards?.map((card) => (
              <StyledDiv
                key={card}
                className="flex cursor-pointer justify-between items-center px-2 py-1.5"
                theme={{ hoverBgColor: colors.$5 }}
                onClick={() =>
                  setCurrentCards((current) =>
                    current?.filter((c) => c !== card)
                  )
                }
              >
                <span>{t(card)}</span>

                <div>
                  <Icon element={MdRefresh} size={23} />
                </div>
              </StyledDiv>
            ))}
          </div>
        )}

        <Button
          behavior="button"
          onClick={handleRestoreCards}
          disabled={
            isFormBusy ||
            settings?.removed_dashboard_cards?.[layoutBreakpoint || '']?.every(
              (card) => currentCards?.includes(card)
            )
          }
          disableWithoutIcon
        >
          {t('done')}
        </Button>
      </Modal>

      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <Icon element={MdRestorePage} size={23} />
      </div>
    </>
  );
}

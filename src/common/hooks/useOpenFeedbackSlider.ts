import { isFeedbackSliderVisible } from '$app/components/Feedback';
import { useSetAtom } from 'jotai';
import { useCurrentUser } from './useCurrentUser';
import { useReactSettings } from './useReactSettings';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { request } from '../helpers/request';
import { $refetch } from './useRefetch';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { CompanyUser } from '../interfaces/company-user';
import { endpoint, isHosted } from '../helpers';
import { cloneDeep, set } from 'lodash';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';

dayjs.extend(utc);

export function useOpenFeedbackSlider() {
  const dispatch = useDispatch();

  const currentUser = useCurrentUser();
  const reactSettings = useReactSettings();

  const setIsFeedbackSliderVisible = useSetAtom(isFeedbackSliderVisible);

  const handleUpdateReactSettings = () => {
    const currentUnixTime = dayjs().utc().unix();

    const updatedReactSettings = cloneDeep(reactSettings);

    set(
      updatedReactSettings,
      'preferences.feedback_slider_displayed_at',
      currentUnixTime
    );

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id/preferences?include=company_user', {
        id: currentUser?.id,
      }),
      {
        react_settings: updatedReactSettings,
      }
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      $refetch(['company_users']);

      dispatch(updateUser(response.data.data));
      dispatch(resetChanges());
    });
  };

  return () => {
    if (isHosted()) {
      const isUserAccountOlderThan7Days =
        currentUser &&
        dayjs().diff(dayjs.unix(currentUser.created_at), 'days') > 7;

      const isHiddenByDoNotAskAgain =
        reactSettings?.preferences.feedback_slider_displayed_at === -1;

      const canShowSliderAgain =
        !reactSettings?.preferences.feedback_slider_displayed_at ||
        dayjs().diff(
          dayjs.unix(reactSettings.preferences.feedback_slider_displayed_at),
          'hours'
        ) > 48;

      if (
        !isHiddenByDoNotAskAgain &&
        reactSettings &&
        !reactSettings.preferences.feedback_given_at &&
        canShowSliderAgain &&
        isUserAccountOlderThan7Days
      ) {
        setTimeout(() => {
          handleUpdateReactSettings();

          setIsFeedbackSliderVisible(true);
        }, 1000);
      }
    }
  };
}

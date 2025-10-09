import { isFeedbackSliderVisible } from '$app/components/Feedback';
import { useSetAtom } from 'jotai';
import { useCurrentUser } from './useCurrentUser';
import { useReactSettings } from './useReactSettings';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function useOpenFeedbackSlider() {
  const currentUser = useCurrentUser();
  const reactSettings = useReactSettings();

  const setIsFeedbackSliderVisible = useSetAtom(isFeedbackSliderVisible);

  return () => {
    const isUserAccountOlderThan7Days =
      currentUser &&
      dayjs().diff(dayjs.unix(currentUser.created_at), 'days') > 7;

    const canShowSliderAgain =
      !reactSettings?.preferences.feedback_slider_displayed_at ||
      dayjs().diff(
        dayjs.unix(reactSettings.preferences.feedback_slider_displayed_at),
        'hours'
      ) > 48;

    if (
      reactSettings &&
      !reactSettings.preferences.feedback_given_at &&
      canShowSliderAgain &&
      isUserAccountOlderThan7Days
    ) {
      setTimeout(() => {
        setIsFeedbackSliderVisible(true);
      }, 1000);
    }
  };
}

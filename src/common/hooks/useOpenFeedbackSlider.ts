import { isFeedbackSliderVisible } from '$app/components/Feedback';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { reactSettingsAtom, useSaveReactSettings } from './useReactSettings';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isHosted } from '../helpers';

dayjs.extend(utc);

export function useOpenFeedbackSlider() {
  const currentUser = useCurrentUser();
  // Subscribe to the raw atom so we can distinguish "not yet hydrated" from
  // "hydrated with default-zero timestamps". Reading through
  // `useReactSettings` would coalesce the null and bypass the
  // do-not-ask-again opt-out for users whose preferences haven't loaded yet.
  const reactSettings = useAtomValue(reactSettingsAtom);
  const save = useSaveReactSettings();

  const setIsFeedbackSliderVisible = useSetAtom(isFeedbackSliderVisible);

  const reactSettingsRef = useRef(reactSettings);
  reactSettingsRef.current = reactSettings;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // Track the pending setTimeout so it can be cancelled on unmount or on
  // identity change. Without this, navigating away within the 1s window
  // could flash the slider on a non-dashboard page and persist
  // `feedback_slider_displayed_at` for a slider the user never saw.
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current !== null) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
    };
  }, []);

  return useCallback(() => {
    const isFeedbackFeatureDisabled =
      import.meta.env.VITE_DISABLE_FEEDBACK_FEATURE === 'true';

    if (!isHosted() || isFeedbackFeatureDisabled) return;

    // Bail until hydration. Anything else risks showing the slider to a
    // user who already opted out.
    if (reactSettingsRef.current === null) return;
    if (!currentUserRef.current) return;

    const isUserAccountOlderThan7Days =
      dayjs().diff(dayjs.unix(currentUserRef.current.created_at), 'days') > 7;

    const isHiddenByDoNotAskAgain =
      reactSettingsRef.current.preferences?.feedback_slider_displayed_at === -1;

    const canShowSliderAgain =
      !reactSettingsRef.current.preferences?.feedback_slider_displayed_at ||
      dayjs().diff(
        dayjs.unix(
          reactSettingsRef.current.preferences.feedback_slider_displayed_at
        ),
        'hours'
      ) > 48;

    if (
      !isHiddenByDoNotAskAgain &&
      !reactSettingsRef.current.preferences?.feedback_given_at &&
      canShowSliderAgain &&
      isUserAccountOlderThan7Days
    ) {
      // Cancel any prior pending schedule so we don't double-fire.
      if (pendingTimeoutRef.current !== null) {
        clearTimeout(pendingTimeoutRef.current);
      }
      pendingTimeoutRef.current = setTimeout(() => {
        pendingTimeoutRef.current = null;
        save('preferences.feedback_slider_displayed_at', dayjs().utc().unix());
        setIsFeedbackSliderVisible(true);
      }, 1000);
    }
  }, [save, setIsFeedbackSliderVisible]);
}

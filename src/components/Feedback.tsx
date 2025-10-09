import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';
import { atom, useAtom } from 'jotai';
import { useState } from 'react';
import { X } from 'react-feather';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from './forms';
import { Icon } from './icons/Icon';
import { MdCheck } from 'react-icons/md';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { cloneDeep, set } from 'lodash';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useDispatch } from 'react-redux';

dayjs.extend(utc);

export const isFeedbackSliderVisible = atom<boolean>(false);

export function Feedback() {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const colors = useColorScheme();
  const currentUser = useCurrentUser();

  const reactSettings = useReactSettings();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useAtom(isFeedbackSliderVisible);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);

    if (rating < 6) {
      setIsVisible(false);

      setTimeout(() => {
        setShowFeedbackModal(true);
      }, 200);
    } else {
      handleFeedbackSubmit(rating, '');
    }
  };

  const handleUpdateReactSettings = () => {
    const currentUnixTime = dayjs().utc().unix();

    const updatedReactSettings = cloneDeep(reactSettings);

    set(updatedReactSettings, 'preferences.feedback_given_at', currentUnixTime);
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

  const handleFeedbackSubmit = (
    currentRating: number,
    currentFeedback: string
  ) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/feedback'), {
        rating: currentRating,
        notes: currentFeedback,
      })
        .then(() => {
          handleUpdateReactSettings();

          toast.success('feedback_submitted');

          setIsSubmitted(true);

          setTimeout(() => {
            setIsVisible(false);
            setShowFeedbackModal(false);
          }, 2000);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={classNames(
          'fixed bottom-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-2xl transform transition-all duration-500 ease-in-out p-6 flex items-center justify-center h-44',
          {
            'translate-y-0': isVisible,
            'translate-y-full': !isVisible,
          }
        )}
        style={{
          borderColor: colors.$20,
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <Icon element={MdCheck} size={55} color="white" />

          <h3 className="text-xl font-semibold text-white">
            {t('thank_you_for_feedback')}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal
        title={t('feedback')}
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        size="regular"
        disableClosing={isFormBusy}
      >
        <div className="flex flex-col space-y-4">
          <span className="text-xs" style={{ color: colors.$17 }}>
            {t('feedback_modal_description')}
          </span>

          <InputField
            element="textarea"
            label={t('feedback')}
            value={feedbackValue}
            onValueChange={(value) => setFeedbackValue(value)}
          />

          <Button
            behavior="button"
            onClick={() =>
              handleFeedbackSubmit(selectedRating || 0, feedbackValue)
            }
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('submit')}
          </Button>
        </div>
      </Modal>
      <div
        className={classNames(
          'fixed bottom-0 left-0 right-0 z-50 w-full shadow-lg transform transition-all duration-500 ease-in-out border-t',
          {
            'translate-y-0': isVisible,
            'translate-y-full': !isVisible,
          }
        )}
        style={{
          borderColor: colors.$20,
          backgroundColor: colors.$1,
        }}
      >
        <button
          type="button"
          className="absolute top-4 right-4 transition-colors duration-200 hover:opacity-75"
          onClick={() => setIsVisible(false)}
        >
          <X size={24} color={colors.$3} />
        </button>

        <div className="flex flex-col items-center space-y-6 py-6 px-4 max-w-5xl mx-auto">
          <h3 className="text-lg font-medium" style={{ color: colors.$3 }}>
            {t('feedback_slider_title')}
          </h3>

          <div className="flex items-center justify-center w-full gap-3">
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 11 }, (_, i) => i).map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
                  className={classNames(
                    `w-12 h-12 rounded-full font-medium transition-all duration-200 focus:outline-none ${
                      selectedRating === rating
                        ? 'bg-blue-500 text-white scale-105'
                        : selectedRating !== null && selectedRating >= rating
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between w-full max-w-3xl px-2">
            <span className="text-xs" style={{ color: colors.$17 }}>
              {t('not_likely')}
            </span>
            <span className="text-xs" style={{ color: colors.$17 }}>
              {t('extremely_likely')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

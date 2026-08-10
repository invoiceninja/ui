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
import {
  useSaveReactSettings,
  useUpdateReactSettings,
} from '$app/common/hooks/useReactSettings';

dayjs.extend(utc);

export const isFeedbackSliderVisible = atom<boolean>(false);

export function Feedback() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const updateSettings = useUpdateReactSettings();
  const saveSettings = useSaveReactSettings();

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

  const handleUpdateReactSettings = (isDoNotAskAgain: boolean = false) => {
    const currentUnixTime = dayjs().utc().unix();

    updateSettings('preferences.feedback_given_at', currentUnixTime);
    saveSettings(
      'preferences.feedback_slider_displayed_at',
      isDoNotAskAgain ? -1 : currentUnixTime
    ).catch(() => undefined);
  };

  const handleFeedbackSubmit = (
    currentRating: number,
    currentFeedback: string,
    isDoNotAskAgain: boolean = false
  ) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/feedback'), {
        rating: currentRating,
        notes: currentFeedback,
      })
        .then(() => {
          handleUpdateReactSettings(isDoNotAskAgain);

          toast.success('thank_you_for_feedback');

          setIsSubmitted(true);

          setTimeout(() => {
            setIsVisible(false);
            setShowFeedbackModal(false);
          }, 2000);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const handleDoNotAskAgain = () => {
    setIsVisible(false);
    setShowFeedbackModal(false);
    saveSettings('preferences.feedback_slider_displayed_at', -1).catch(
      () => undefined
    );
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

          <div className="flex justify-between">
            <Button
              type="secondary"
              behavior="button"
              onClick={() =>
                handleFeedbackSubmit(selectedRating || 0, feedbackValue, true)
              }
              disabled={isFormBusy}
              disableWithoutIcon
            >
              {t('do_not_ask_again')}
            </Button>

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
        </div>
      </Modal>

      {isVisible ? (
        <div
          className={classNames(
            'fixed bottom-0 left-0 right-0 z-50 w-full transform transition-all duration-500 ease-in-out border-t translate-y-0'
          )}
          style={{
            borderColor: colors.$20,
            backgroundColor: colors.$1,
            boxShadow:
              '0 -4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
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
            <div className="flex flex-col items-center space-y-1">
              <h3 className="text-lg font-medium" style={{ color: colors.$3 }}>
                {t('feedback_slider_title')}
              </h3>

              <button
                type="button"
                onClick={handleDoNotAskAgain}
                className="text-xs underline hover:opacity-75 transition-colors duration-200"
                style={{ color: colors.$17 }}
              >
                {t('do_not_ask_again')}
              </button>
            </div>

            <div className="flex items-center justify-center w-full gap-3">
              <div className="flex items-center justify-center space-x-2">
                {Array.from({ length: 11 }, (_, i) => i).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={classNames(
                      'w-12 h-12 rounded-full font-semibold transition-all duration-200 focus:outline-none border-2',
                      {
                        'bg-blue-600 text-white border-blue-800 shadow-md scale-105':
                          selectedRating === rating,
                        'bg-blue-500 text-white border-blue-700':
                          selectedRating !== null &&
                          selectedRating >= rating &&
                          selectedRating !== rating,
                        'bg-gray-100 text-gray-800 border-gray-400 hover:bg-gray-200 hover:border-gray-500':
                          selectedRating === null || selectedRating < rating,
                      }
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
      ) : null}
    </>
  );
}

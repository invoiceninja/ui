/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import Tippy from '@tippyjs/react';
import axios, { AxiosError } from 'axios';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Mail } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { FaSlack } from 'react-icons/fa';
import {
  MdOutlineAddPhotoAlternate,
  MdOutlineScreenshotMonitor,
} from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useColorScheme } from '$app/common/colors';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import {
  captureScreenshot,
  isScreenshotSupported,
} from '$app/common/helpers/screenshot';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useHandleCollapseExpandSidebar } from '$app/common/hooks/useHandleCollapseExpandSidebar';
import { useHandleDarkLightMode } from '$app/common/hooks/useHandleDarkLightMode';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { AboutModal } from './AboutModal';
import { Button, InputField } from './forms';
import Toggle from './forms/Toggle';
import { CircleInfo } from './icons/CircleInfo';
import { CircleQuestion } from './icons/CircleQuestion';
import { CircleWarning } from './icons/CircleWarning';
import { CloseNavbarArrow } from './icons/CloseNavbarArrow';
import { Icon } from './icons/Icon';
import { Message } from './icons/Message';
import { MoonStars } from './icons/MoonStars';
import { OpenNavbarArrow } from './icons/OpenNavbarArrow';
import { Sun } from './icons/Sun';
import { TriangleWarning } from './icons/TriangleWarning';
import { Modal } from './Modal';
import { SupportAttachments } from './SupportAttachments';
import { UpdateAppModal } from './UpdateAppModal';

interface Props {
  docsLink?: string;
  mobileNavbar?: boolean;
}

export function HelpSidebarIcons(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const user = useCurrentUser();
  const account = useCurrentAccount();

  const reactSettings = useReactSettings();

  const { mobileNavbar } = props;

  const dispatch = useDispatch();
  const handleDarkLightMode = useHandleDarkLightMode();
  const handleCollapseExpandSidebar = useHandleCollapseExpandSidebar();

  const { data: latestVersion } = useQuery({
    queryKey: ['/pdf.invoicing.co/api/version'],
    queryFn: () =>
      axios
        .get('https://pdf.invoicing.co/api/version')
        .then((response) => response.data),
    staleTime: Infinity,
    enabled: isSelfHosted(),
  });

  const { data: currentSystemInfo } = useQuery({
    queryKey: ['/api/v1/health_check'],
    queryFn: () =>
      request('GET', endpoint('/api/v1/health_check')).then(
        (response) => response.data
      ),
    staleTime: Infinity,
    enabled: isSelfHosted(),
  });

  const [isContactVisible, setIsContactVisible] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isAboutVisible, setIsAboutVisible] = useState<boolean>(false);
  const [cronsNotEnabledModal, setCronsNotEnabledModal] =
    useState<boolean>(false);
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] =
    useState<boolean>(false);

  const attachmentsInput = useRef<HTMLInputElement>(null);

  const isMiniSidebar = Boolean(reactSettings.show_mini_sidebar);

  const isUpdateAvailable =
    isSelfHosted() &&
    latestVersion &&
    currentSystemInfo?.api_version &&
    currentSystemInfo.api_version !== latestVersion &&
    !currentSystemInfo?.is_docker;

  const formik = useFormik({
    initialValues: {
      message: '',
      platform: 'R',
      send_logs: false,
    },
    onSubmit: (values) => {
      toast.processing();
      setErrors(undefined);

      const formData = new FormData();

      formData.append('message', values.message);
      formData.append('platform', values.platform);

      if (values.send_logs) {
        formData.append('send_logs', 'true');
      }

      attachments.forEach((attachment) =>
        formData.append('attachments[]', attachment)
      );

      request('POST', endpoint('/api/v1/support/messages/send'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(() => {
          toast.success('your_message_has_been_received');
          handleCloseContact();
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  const handleCloseContact = () => {
    setIsContactVisible(false);
    setAttachments([]);
    setErrors(undefined);
    formik.resetForm();
  };

  const handleTakeScreenshot = () => {
    setIsContactVisible(false);

    captureScreenshot()
      .then((screenshot) =>
        setAttachments((current) => [...current, screenshot])
      )
      .catch(() => undefined)
      .finally(() => setIsContactVisible(true));
  };

  const handleAddImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    setAttachments((current) => [...current, ...files]);

    event.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((current) =>
      current.filter((_, attachmentIndex) => attachmentIndex !== index)
    );
  };

  const refreshData = () => {
    setDisabledButton(true);

    request(
      'POST',
      endpoint('/api/v1/refresh?updated_at=:updatedAt', {
        updatedAt: dayjs().unix(),
      })
    ).then((data) => {
      dispatch(updateCompanyUsers(data.data.data));
      dispatch(resetChanges('company'));
      setDisabledButton(false);
      setCronsNotEnabledModal(false);
    });
  };

  useEffect(() => {
    const handler = () => setIsContactVisible(true);
    window.addEventListener('open-contact-modal', handler);
    return () => window.removeEventListener('open-contact-modal', handler);
  }, []);

  return (
    <>
      <Modal
        title={t('contact_us')}
        visible={isContactVisible}
        onClose={handleCloseContact}
        disableClosing
        enableClosingOnXMark
      >
        <InputField
          label={t('from')}
          id="from"
          value={`${user?.first_name} - ${user?.email}`}
          disabled
        />

        <InputField
          element="textarea"
          label={t('message')}
          id="message"
          value={formik.values.message}
          onChange={formik.handleChange}
          errorMessage={errors?.errors.message}
        />

        {isSelfHosted() && (
          <Toggle
            id="send_errors"
            label={t('include_recent_errors')}
            checked={formik.values.send_logs}
            onChange={(value) => formik.setFieldValue('send_logs', value)}
          />
        )}

        <SupportAttachments
          attachments={attachments}
          errors={errors}
          onRemove={handleRemoveAttachment}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            {isScreenshotSupported() && (
              <Tippy
                duration={0}
                content={t('take_screenshot')}
                className="rounded-md text-xs p-2 bg-[#F2F2F2]"
              >
                <button
                  type="button"
                  onClick={handleTakeScreenshot}
                  disabled={formik.isSubmitting}
                >
                  <Icon
                    element={MdOutlineScreenshotMonitor}
                    size={22}
                    color={colors.$3}
                  />
                </button>
              </Tippy>
            )}

            <Tippy
              duration={0}
              content={t('add_image')}
              className="rounded-md text-xs p-2 bg-[#F2F2F2]"
            >
              <button
                type="button"
                onClick={() => attachmentsInput.current?.click()}
                disabled={formik.isSubmitting}
              >
                <Icon
                  element={MdOutlineAddPhotoAlternate}
                  size={22}
                  color={colors.$3}
                />
              </button>
            </Tippy>

            <input
              ref={attachmentsInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddImages}
              multiple
            />
          </div>

          <div className="flex gap-x-4">
            <Button
              type="secondary"
              onClick={handleCloseContact}
              disabled={formik.isSubmitting}
            >
              {t('cancel')}
            </Button>

            <Button
              onClick={() => formik.submitForm()}
              disabled={formik.isSubmitting}
            >
              {t('send')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={t('crons_not_enabled')}
        visible={cronsNotEnabledModal}
        onClose={setCronsNotEnabledModal}
      >
        <Button
          onClick={() => {
            window.open(
              'https://invoiceninja.github.io/docs/self-host/self-host-troubleshooting/#cron-not-running-queue-not-running',
              '_blank'
            );
          }}
        >
          {t('learn_more')}
        </Button>
        <Button disabled={disabledButton} onClick={refreshData}>
          {t('refresh_data')}
        </Button>
        <Button
          onClick={() => {
            setCronsNotEnabledModal(false);
          }}
        >
          {t('dismiss')}
        </Button>
      </Modal>

      <UpdateAppModal
        isVisible={isUpdateModalVisible}
        setIsVisible={setIsUpdateModalVisible}
        installedVersion={currentSystemInfo?.api_version}
        latestVersion={latestVersion}
      />

      <AboutModal
        isAboutVisible={isAboutVisible}
        setIsAboutVisible={setIsAboutVisible}
        currentSystemInfo={currentSystemInfo}
        latestVersion={latestVersion}
      />

      <nav
        style={{ borderColor: colors.$5 }}
        className={classNames('flex space-x-2.5 py-4 text-white border-t', {
          'justify-end': mobileNavbar,
          'justify-around': !mobileNavbar,
          'px-2': !isUpdateAvailable,
        })}
      >
        {!isMiniSidebar && !mobileNavbar && (
          <>
            {isUpdateAvailable && (
              <Tippy
                duration={0}
                content={t('update_available')}
                className="rounded-md text-xs p-2 bg-[#F2F2F2]"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setIsUpdateModalVisible(true)}
                >
                  <TriangleWarning color="white" size="1.3rem" />
                </div>
              </Tippy>
            )}

            {isSelfHosted() && account && !account.is_scheduler_running && (
              <Tippy
                duration={0}
                content={t('error')}
                className="rounded-md text-xs p-2 bg-[#F2F2F2]"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setCronsNotEnabledModal(true)}
                >
                  <CircleWarning color="white" size="1.3rem" />
                </div>
              </Tippy>
            )}

            <Tippy
              duration={0}
              content={t('contact_us')}
              className="rounded-md text-xs p-2 bg-[#F2F2F2]"
            >
              {isHosted() ? (
                <div
                  className="cursor-pointer"
                  onClick={() => setIsContactVisible(true)}
                >
                  <Mail size={21.5} />
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    window.open('https://slack.invoiceninja.com', '_blank')
                  }
                >
                  <Icon element={FaSlack} color="white" size={21.5} />
                </div>
              )}
            </Tippy>

            {!isUpdateAvailable && (
              <Tippy
                duration={0}
                content={t('support_forum')}
                className="rounded-md text-xs p-2 bg-[#F2F2F2]"
              >
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    window.open('https://forum.invoiceninja.com', '_blank')
                  }
                >
                  <Message color="white" size="1.3rem" />
                </div>
              </Tippy>
            )}

            {Boolean(
              !(isSelfHosted() && account && !account.is_scheduler_running)
            ) && (
              <Tippy
                duration={0}
                content={t('user_guide')}
                className="rounded-md text-xs p-2 bg-[#F2F2F2]"
              >
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    window.open(
                      props.docsLink
                        ? `https://invoiceninja.github.io/${props.docsLink}`
                        : 'https://invoiceninja.github.io',
                      '_blank'
                    )
                  }
                >
                  <CircleQuestion color="white" size="1.3rem" />
                </div>
              </Tippy>
            )}

            <Tippy
              duration={0}
              content={t('about')}
              className="rounded-md text-xs p-2 bg-[#F2F2F2]"
            >
              <div
                className="cursor-pointer"
                onClick={() => setIsAboutVisible(true)}
              >
                <CircleInfo color="white" size="1.3rem" />
              </div>
            </Tippy>

            <Tippy
              duration={0}
              content={t('dark_mode')}
              className="rounded-md text-xs p-2 bg-[#F2F2F2]"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleDarkLightMode(!reactSettings?.dark_mode)}
              >
                {reactSettings?.dark_mode ? (
                  <Sun color="white" size="1.3rem" />
                ) : (
                  <MoonStars color="white" size="1.3rem" />
                )}
              </div>
            </Tippy>
          </>
        )}

        <Tippy
          duration={0}
          content={
            <span style={{ fontSize: isMiniSidebar ? '0.6rem' : '0.75rem' }}>
              {isMiniSidebar ? t('show_menu') : t('hide_menu')}
            </span>
          }
          className="rounded-md text-xs p-2 bg-[#F2F2F2]"
        >
          <div
            className="cursor-pointer"
            onClick={() => handleCollapseExpandSidebar(!isMiniSidebar)}
          >
            {isMiniSidebar ? (
              <OpenNavbarArrow color="#e5e7eb" size="1.5rem" />
            ) : (
              <CloseNavbarArrow color="#e5e7eb" size="1.35rem" />
            )}
          </div>
        </Tippy>
      </nav>
    </>
  );
}

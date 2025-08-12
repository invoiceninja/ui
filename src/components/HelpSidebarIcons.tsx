/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Tippy from '@tippyjs/react';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import {
  updateCompanyUsers,
  resetChanges,
} from '$app/common/stores/slices/company-users';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Mail } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField } from './forms';
import Toggle from './forms/Toggle';
import { Modal } from './Modal';
import { toast } from '$app/common/helpers/toast/toast';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import classNames from 'classnames';
import { AboutModal } from './AboutModal';
import { Icon } from './icons/Icon';
import { FaSlack } from 'react-icons/fa';
import { useQuery } from 'react-query';
import axios from 'axios';
import { UpdateAppModal } from './UpdateAppModal';
import { OpenNavbarArrow } from './icons/OpenNavbarArrow';
import { useHandleCollapseExpandSidebar } from '$app/common/hooks/useHandleCollapseExpandSidebar';
import { CloseNavbarArrow } from './icons/CloseNavbarArrow';
import { MoonStars } from './icons/MoonStars';
import { useHandleDarkLightMode } from '$app/common/hooks/useHandleDarkLightMode';
import { Sun } from './icons/Sun';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { TriangleWarning } from './icons/TriangleWarning';
import { CircleWarning } from './icons/CircleWarning';
import { Message } from './icons/Message';
import { CircleQuestion } from './icons/CircleQuestion';
import { CircleInfo } from './icons/CircleInfo';
import dayjs from 'dayjs';

interface Props {
  docsLink?: string;
  mobileNavbar?: boolean;
}

export function HelpSidebarIcons(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const user = useInjectUserChanges();
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
  const [isAboutVisible, setIsAboutVisible] = useState<boolean>(false);
  const [cronsNotEnabledModal, setCronsNotEnabledModal] =
    useState<boolean>(false);
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] =
    useState<boolean>(false);

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

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

      request('POST', endpoint('/api/v1/support/messages/send'), values)
        .then(() => toast.success('your_message_has_been_received'))
        .finally(() => {
          formik.setSubmitting(false);
          setIsContactVisible(false);
        });
    },
  });

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

  return (
    <>
      <Modal
        title={t('contact_us')}
        visible={isContactVisible}
        onClose={setIsContactVisible}
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
          onChange={formik.handleChange}
        />

        <Toggle
          id="send_errors"
          label={t('include_recent_errors')}
          onChange={(value) => formik.setFieldValue('send_logs', value)}
        />

        <Button
          onClick={() => formik.submitForm()}
          disabled={formik.isSubmitting}
        >
          {t('send')}
        </Button>
      </Modal>

      <Modal
        title={t('crons_not_enabled')}
        visible={cronsNotEnabledModal}
        onClose={setCronsNotEnabledModal}
      >
        <Button
          onClick={() => {
            window.open(
              'https://invoiceninja.github.io/en/self-host-troubleshooting/#cron-not-running-queue-not-running',
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

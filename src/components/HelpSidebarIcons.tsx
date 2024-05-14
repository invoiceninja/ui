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
import { endpoint, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { updateCompanyUsers } from '$app/common/stores/slices/company-users';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import {
  HelpCircle,
  Info,
  Mail,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, InputField } from './forms';
import Toggle from './forms/Toggle';
import { Modal } from './Modal';
import { toast } from '$app/common/helpers/toast/toast';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useHandleCurrentUserChangeProperty } from '$app/common/hooks/useHandleCurrentUserChange';
import { useUpdateCompanyUser } from '$app/pages/settings/user/common/hooks/useUpdateCompanyUser';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import classNames from 'classnames';
import { AboutModal } from './AboutModal';

interface Props {
  docsLink?: string;
  mobileNavbar?: boolean;
}

export function HelpSidebarIcons(props: Props) {
  const [t] = useTranslation();
  const user = useInjectUserChanges();
  const currentUser = useCurrentUser();
  const account = useCurrentAccount();

  const colors = useColorScheme();

  const { mobileNavbar } = props;

  const dispatch = useDispatch();
  const updateCompanyUser = useUpdateCompanyUser();
  const handleUserChange = useHandleCurrentUserChangeProperty();

  const [isContactVisible, setIsContactVisible] = useState<boolean>(false);
  const [isAboutVisible, setIsAboutVisible] = useState<boolean>(false);
  const [cronsNotEnabledModal, setCronsNotEnabledModal] =
    useState<boolean>(false);
  const [disabledButton, setDisabledButton] = useState<boolean>(false);

  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );

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

    request('POST', endpoint('/api/v1/refresh')).then((data) => {
      dispatch(updateCompanyUsers(data.data.data));
      setDisabledButton(false);
      setCronsNotEnabledModal(false);
    });
  };

  useEffect(() => {
    const showMiniSidebar =
      user?.company_user?.react_settings?.show_mini_sidebar;

    if (
      user &&
      typeof showMiniSidebar !== 'undefined' &&
      currentUser?.company_user?.react_settings?.show_mini_sidebar !==
        showMiniSidebar
    ) {
      updateCompanyUser(user);
    }
  }, [user?.company_user?.react_settings.show_mini_sidebar]);

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

      <AboutModal
        isAboutVisible={isAboutVisible}
        setIsAboutVisible={setIsAboutVisible}
      />

      <nav
        style={{ borderColor: colors.$5 }}
        className={classNames('flex p-2 text-white border-t', {
          'justify-end': mobileNavbar,
          'justify-around': !mobileNavbar,
        })}
      >
        {!isMiniSidebar && !mobileNavbar && (
          <>
            {isSelfHosted() && account && !account.is_scheduler_running && (
              <button
                className="p-2 hover:bg-ninja-gray-darker rounded-full"
                onClick={() => setCronsNotEnabledModal(true)}
              >
                <Tippy
                  duration={0}
                  content={t('error')}
                  className="text-white rounded text-xs mb-2"
                >
                  <AlertCircle />
                </Tippy>
              </button>
            )}

            <button
              className="p-2 hover:bg-ninja-gray-darker rounded-full"
              onClick={() => setIsContactVisible(true)}
            >
              <Tippy
                duration={0}
                content={t('contact_us')}
                className="text-white rounded text-xs mb-2"
              >
                <Mail />
              </Tippy>
            </button>

            <a
              href="https://forum.invoiceninja.com"
              target="_blank"
              className="p-2 hover:bg-ninja-gray-darker rounded-full"
              rel="noreferrer"
            >
              <Tippy
                duration={0}
                content={t('support_forum')}
                className="text-white rounded text-xs mb-2"
              >
                <MessageSquare />
              </Tippy>
            </a>

            <a
              href={
                (props.docsLink &&
                  `https://invoiceninja.github.io/${props.docsLink}`) ||
                'https://invoiceninja.github.io'
              }
              target="_blank"
              className="p-2 hover:bg-ninja-gray-darker rounded-full"
              rel="noreferrer"
            >
              <Tippy
                duration={0}
                content={t('user_guide')}
                className="text-white rounded text-xs mb-2"
              >
                <HelpCircle />
              </Tippy>
            </a>

            <button
              className="p-2 hover:bg-ninja-gray-darker rounded-full overflow-visible"
              onClick={() => setIsAboutVisible(true)}
            >
              <Tippy
                duration={0}
                content={t('about')}
                className="text-white rounded text-xs mb-2"
              >
                <Info />
              </Tippy>
            </button>
          </>
        )}

        <button
          className="p-2 rounded-full"
          onClick={() =>
            handleUserChange(
              'company_user.react_settings.show_mini_sidebar',
              !isMiniSidebar
            )
          }
        >
          <Tippy
            duration={0}
            content={
              <span style={{ fontSize: isMiniSidebar ? '0.6rem' : '0.75rem' }}>
                {isMiniSidebar ? t('show_menu') : t('hide_menu')}
              </span>
            }
            className="text-white rounded mb-1.5"
          >
            {isMiniSidebar ? <ChevronRight /> : <ChevronLeft />}
          </Tippy>
        </button>
      </nav>
    </>
  );
}

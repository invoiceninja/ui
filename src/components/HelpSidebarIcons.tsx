/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Tippy from '@tippyjs/react';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { defaultHeaders } from 'common/queries/common/headers';
import { useFormik } from 'formik';
import { useState } from 'react';
import { HelpCircle, Info, Mail, MessageSquare } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from './forms';
import Toggle from './forms/Toggle';
import { Modal } from './Modal';

interface Props {
  docsLink?: string;
}

export function HelpSidebarIcons(props: Props) {
  const [t] = useTranslation();
  const user = useCurrentUser();

  const [isContactVisible, setIsContactVisible] = useState(false);

  const formik = useFormik({
    initialValues: {
      message: '',
      platform: 'R',
      send_logs: false,
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));

      axios
        .post(endpoint('/api/v1/support/messages/send'), values, {
          headers: defaultHeaders,
        })
        .then(() =>
          toast.success(t('your_message_has_been_received'), { id: toastId })
        )
        .catch((error: AxiosError) => {
          console.error(error);

          toast.error(t('error_title'), { id: toastId });
        })
        .finally(() => {
          formik.setSubmitting(false);
          setIsContactVisible(false);
        });
    },
  });

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
          value={`${user.first_name} - ${user.email}`}
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

      <nav className="flex p-2 justify-around text-white">
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
          href={props.docsLink || 'https://invoiceninja.github.io'}
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

        <button className="p-2 hover:bg-ninja-gray-darker rounded-full">
          <Tippy
            duration={0}
            content={t('about')}
            className="text-white rounded text-xs mb-2"
          >
            <Info />
          </Tippy>
        </button>
      </nav>
    </>
  );
}

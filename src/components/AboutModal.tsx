/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Facebook, GitHub, Slack, Twitter, Youtube } from 'react-feather';
import { Modal } from './Modal';
import { version } from '$app/common/helpers/version';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { Button } from './forms';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';

interface Props {
  isAboutVisible: boolean;
  setIsAboutVisible: Dispatch<SetStateAction<boolean>>;
}
export function AboutModal(props: Props) {
  const [t] = useTranslation();
  const user = useCurrentUser();

  const { isAboutVisible, setIsAboutVisible } = props;

  const handleHealthCheck = () => {
    toast.processing();

    request('GET', endpoint('/api/v1/health_check')).then((response) => {
      console.log(response);
      toast.success('');
    });
  };

  return (
    <Modal
      title={t('about')}
      visible={isAboutVisible}
      onClose={() => setIsAboutVisible(false)}
    >
      <div className="flex flex-col text-center">
        <div className="flex flex-col">
          <span className="text-gray-800">
            {user?.first_name} {user?.last_name}
          </span>
          <span>{user?.email}</span>
        </div>

        <span className="mt-4">{version}</span>
      </div>

      <Button behavior="button" onClick={handleHealthCheck}>
        {t('health_check')}
      </Button>

      <Button behavior="button">{t('force_update')}</Button>

      <div className="flex flex-wrap justify-center items-center space-x-4 pt-6">
        <a
          href="https://twitter.com/invoiceninja"
          target="_blank"
          rel="noreferrer"
        >
          <Twitter />
        </a>

        <a
          href="https://www.facebook.com/invoiceninja"
          target="_blank"
          rel="noreferrer"
        >
          <Facebook />
        </a>

        <a
          href="https://github.com/invoiceninja"
          target="_blank"
          rel="noreferrer"
        >
          <GitHub />
        </a>

        <a
          href="https://www.youtube.com/channel/UCXAHcBvhW05PDtWYIq7WDFA/videos"
          target="_blank"
          rel="noreferrer"
        >
          <Youtube />
        </a>

        <a
          href="http://slack.invoiceninja.com/"
          target="_blank"
          rel="noreferrer"
        >
          <Slack />
        </a>
      </div>
    </Modal>
  );
}

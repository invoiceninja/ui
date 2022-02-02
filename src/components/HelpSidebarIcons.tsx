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
import { HelpCircle, Info, Mail, MessageSquare } from 'react-feather';
import { useTranslation } from 'react-i18next';

export function HelpSidebarIcons() {
  const [t] = useTranslation();

  return (
    <>
      <nav className="flex p-2 justify-around text-white">
        <button className="p-2 hover:bg-ninja-gray-darker rounded-full">
          <Tippy
            duration={0}
            content={t('contact_us')}
            className="text-white rounded text-xs mb-2"
          >
            <Mail />
          </Tippy>
        </button>

        <button className="p-2 hover:bg-ninja-gray-darker rounded-full">
          <Tippy
            duration={0}
            content={t('support_forum')}
            className="text-white rounded text-xs mb-2"
          >
            <MessageSquare />
          </Tippy>
        </button>

        <button className="p-2 hover:bg-ninja-gray-darker rounded-full">
          <Tippy
            duration={0}
            content={t('user_guide')}
            className="text-white rounded text-xs mb-2"
          >
            <HelpCircle />
          </Tippy>
        </button>

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

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useDetectBrowser } from '$app/common/hooks/useDetectBrowser';
import { Banner } from '$app/components/Banner';
import { Icon } from '$app/components/icons/Icon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChrome } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

export function ExtensionBanner() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { isChrome } = useDetectBrowser();

  const [displayChromeExtensionBanner, setDisplayChromeExtensionBanner] =
    useState<string | null>(
      localStorage.getItem('displayChromeExtensionBanner')
    );

  useEffect(() => {
    if (displayChromeExtensionBanner === 'false') {
      localStorage.setItem('displayChromeExtensionBanner', 'false');
    }
  }, [displayChromeExtensionBanner]);

  if (displayChromeExtensionBanner === 'false' || !isChrome) {
    return <></>;
  }

  return (
    <Banner variant="orange">
      <div className="flex items-center w-full justify-between py-1.5">
        <div className="flex justify-start items-center w-full space-x-3">
          <Icon element={FaChrome} color={colors.$1} size={25} />

          <span style={{ color: colors.$1 }}>
            {t('task_extension_banner')}.
          </span>
        </div>

        <div className="flex items-center space-x-5 whitespace-nowrap">
          <span
            className="cursor-pointer"
            onClick={() =>
              window.open('https://www.youtube.com/watch?v=UL0OklMJTEA')
            }
            style={{ color: colors.$1 }}
          >
            {t('watch_video')}
          </span>

          <span
            className="cursor-pointer"
            onClick={() =>
              window.open(
                'https://chromewebstore.google.com/detail/invoice-ninja-tasks/dlfcbfdpemfnjbjlladogijcchfmmaaf?pli=1'
              )
            }
            style={{ color: colors.$1 }}
          >
            {t('view_extension')}
          </span>

          <Icon
            className="cursor-pointer"
            element={MdClose}
            onClick={() => setDisplayChromeExtensionBanner('false')}
            size={25}
            color={colors.$1}
          />
        </div>
      </div>
    </Banner>
  );
}

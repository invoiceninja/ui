/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { darkBuilderTheme, Sign, SignContext } from '@docuninja/builder2.0';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export default function Index() {
  const params = useParams();
  const sig = new URLSearchParams(window.location.search).get('sig') ?? '';
  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const [t, i18n] = useTranslation();

  return (
    <div className="max-w-[90rem] mx-auto">
      <SignContext.Provider
        value={{
          endpoint: import.meta.env.VITE_DOCUNINJA_API_URL,
          document: params.document as string,
          invitation: params.invitation as string,
          theme: reactSettings?.dark_mode ? darkBuilderTheme : undefined,
          sig,
          styles: {
            border: colors.$24,
            frame: {
              background: colors.$1,
              color: colors.$3,
            },
            general: {
              backgroundColor: colors.$1,
              textColor: colors.$3,
              foregroundColor: colors.$4,
            },
          },
          translations: {
            ...(i18n.getResourceBundle(i18n.language, 'translation') as Record<
              string,
              string | object
            >),
            sign_the_document: String(t('sign_the_document')),
          },
        }}
      >
        <Sign />
      </SignContext.Provider>
    </div>
  );
}

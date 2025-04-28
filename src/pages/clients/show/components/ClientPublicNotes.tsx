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
import { sanitizeHTML } from '$app/common/helpers/html-string';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Client } from '$app/common/interfaces/client';
import { Card } from '$app/components/cards';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
}

export function ClientPublicNotes(props: Props) {
  const [t] = useTranslation();

  const { client } = props;

  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  return (
    <>
      {Boolean(client && client.public_notes) && (
        <Card
          title={t('public_notes')}
          className="col-span-12 shadow-sm h-max"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
          withoutBodyPadding
        >
          <div className="flex justify-center items-center whitespace-normal max-h-56 overflow-y-auto py-6">
            <article
              className={classNames('prose prose-sm', {
                'prose-invert': reactSettings?.dark_mode,
              })}
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(client.public_notes),
              }}
            />
          </div>
        </Card>
      )}
    </>
  );
}

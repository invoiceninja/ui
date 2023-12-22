/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Turnstile from 'react-turnstile';

interface Props {
  visible: boolean;
  onVerified: () => void;
}
export function TurnstileWidget(props: Props) {
  const { onVerified, visible } = props;

  const siteKey = import.meta.env.VITE_CLOUDFLARE_SITE_ID;

  return (
    <Turnstile
      execution={visible ? 'execute' : undefined}
      sitekey={siteKey}
      onVerify={onVerified}
    />
  );
}

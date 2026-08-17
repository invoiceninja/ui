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

const TurnstileComponent =
  (Turnstile as { default?: typeof Turnstile }).default ?? Turnstile;

interface Props {
  onVerified: (token: string) => void;
}
export function TurnstileWidget(props: Props) {
  const { onVerified } = props;

  const siteKey = import.meta.env.VITE_CLOUDFLARE_SITE_ID;

  return (
    <TurnstileComponent
      appearance="interaction-only"
      sitekey={siteKey}
      onVerify={(token) => onVerified(token)}
    />
  );
}

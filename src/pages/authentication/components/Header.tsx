/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';
import { Link } from '../../../components/forms/Link';
import Logo from '../../../resources/images/invoiceninja-logo@dark.png';

export function Header() {
  const accentColor = useAccentColor();

  const css: React.CSSProperties = {
    backgroundColor: accentColor,
  };

  return (
    <>
      <div className="py-1" style={css}></div>
      <div className="flex justify-center py-8">
        <Link to="/">
          <img src={Logo} alt="Invoice Ninja Logo" className="h-12" />
        </Link>
      </div>
    </>
  );
}

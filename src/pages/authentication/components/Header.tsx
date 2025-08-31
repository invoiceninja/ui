/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '../../../components/forms/Link';
import Logo from '../../../resources/images/invoiceninja-logo@dark.png';

export function Header() {
  return (
    <>
      <div className="flex justify-center py-8">
        <Link to="/">
          <img src={Logo} alt="Invoice Ninja Logo" className="h-12" />
        </Link>
      </div>
    </>
  );
}

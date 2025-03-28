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
import { Link } from './forms';
import { House } from './icons/House';

export type Page = { name: string; href: string };

export function Breadcrumbs(props: { pages: Page[] }) {
  const colors = useColorScheme();

  if (props.pages.length === 0) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <Link to="/dashboard" withoutDefaultStyling>
            <House size="1.3rem" color={colors.$17} />
          </Link>
        </li>

        {props.pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <span style={{ color: colors.$17 }}>/</span>

              <Link
                to={page.href}
                className="ml-4 text-sm font-medium"
                style={{ color: colors.$17 }}
                disableHoverUnderline
              >
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

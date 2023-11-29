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
import { ChevronRight, Home } from 'react-feather';
import { Link } from 'react-router-dom';

export type Page = { name: string; href: string };

export function Breadcrumbs(props: { pages: Page[] }) {
  const colors = useColorScheme();

  return (
    <nav className="flex" aria-label="Breadcrumb" style={{ color: colors.$3, opacity: colors.$10}}>
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link to="/dashboard">
              <Home className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>

        {props.pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight
                className="flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              <Link to={page.href} className="ml-4 text-sm font-medium">
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

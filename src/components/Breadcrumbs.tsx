/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChevronRight, Home } from 'react-feather';
import { Link } from 'react-router-dom';

export type Page = { name: string; href: string };

export function Breadcrumbs(props: { pages: Page[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-500">
              <Home className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {props.pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight
                className="flex-shrink-0 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <Link
                to={page.href}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
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

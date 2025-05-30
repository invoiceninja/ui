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
import { ReactNode } from 'react';
import { Link } from './forms';
import { House } from './icons/House';
import classNames from 'classnames';

export type Page = { name: string; href: string; afterName?: ReactNode };

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
            <House size="1.3rem" color={colors.$22} />
          </Link>
        </li>

        {props.pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <span style={{ color: colors.$22 }}>/</span>

              <div
                className={classNames('flex items-center', {
                  'space-x-2': page.afterName,
                })}
              >
                <Link
                  to={page.href}
                  className="ml-4 text-sm font-medium"
                  style={{ color: colors.$22 }}
                  disableHoverUnderline
                >
                  {page.name}
                </Link>

                {page.afterName && <div>{page.afterName}</div>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

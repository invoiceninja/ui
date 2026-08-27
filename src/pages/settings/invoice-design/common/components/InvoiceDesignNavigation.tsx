/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { Tab } from '$app/components/Tabs';
import { InvoiceDesignRouteKind } from '../routes';

interface Props {
  primaryTabs: Tab[];
  settingsTabs: Tab[];
  routeKind: InvoiceDesignRouteKind;
  rightSide?: ReactNode;
}

export function InvoiceDesignNavigation({
  primaryTabs,
  settingsTabs,
  routeKind,
  rightSide,
}: Props) {
  const colors = useColorScheme();
  const location = useLocation();

  const isPrimaryTabActive = (index: number) =>
    index === 0 ? routeKind === 'settings' : routeKind === 'designs';

  return (
    <div className="flex flex-col" data-cy="invoice-design-navigation">
      <div className="flex items-stretch">
        <nav
          className="flex flex-1 min-w-0 overflow-x-auto"
          aria-label="Invoice design sections"
          data-cy="invoice-design-primary-navigation"
        >
          {primaryTabs.map(
            (tab, index) =>
              (typeof tab.enabled === 'undefined' || tab.enabled) && (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className="whitespace-nowrap font-medium text-sm py-3 px-4 transition-colors duration-150"
                  aria-current={isPrimaryTabActive(index) ? 'page' : undefined}
                  style={{
                    color: isPrimaryTabActive(index) ? colors.$3 : colors.$17,
                    borderBottom: isPrimaryTabActive(index)
                      ? `1.5px solid ${colors.$3}`
                      : `1.5px solid ${colors.$20}`,
                  }}
                >
                  {tab.formatName?.() || tab.name}
                </Link>
              )
          )}

          <div
            className="flex-1 min-w-6"
            style={{ borderBottom: `1.5px solid ${colors.$20}` }}
          />
        </nav>

        {rightSide && (
          <div
            className="flex flex-shrink-0 items-center border-b py-1 pl-3"
            style={{ borderColor: colors.$20 }}
          >
            {rightSide}
          </div>
        )}
      </div>

      {routeKind === 'settings' && (
        <nav
          className="flex flex-wrap gap-1.5 pt-3"
          aria-label="General settings sections"
          data-cy="invoice-design-settings-navigation"
        >
          {settingsTabs.map(
            (tab) =>
              (typeof tab.enabled === 'undefined' || tab.enabled) && (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className="px-3 py-1 rounded-md text-xs select-none border transition-colors duration-150"
                  aria-current={
                    location.pathname === tab.href ? 'page' : undefined
                  }
                  style={{
                    backgroundColor:
                      location.pathname === tab.href ? colors.$25 : colors.$1,
                    color:
                      location.pathname === tab.href ? colors.$3 : colors.$17,
                    borderColor:
                      location.pathname === tab.href ? colors.$3 : colors.$24,
                    fontWeight: location.pathname === tab.href ? 500 : 400,
                  }}
                >
                  {tab.formatName?.() || tab.name}
                </Link>
              )
          )}
        </nav>
      )}
    </div>
  );
}

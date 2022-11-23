/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';

interface Props {
  className?: string;
  tabs: Tab[];
}

export interface Tab {
  name: string;
}

export function Tabs(props: Props) {
  const accentColor = useAccentColor();

  const op = false;

  return (
    <div className={props.className}>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav
            className="-mb-px flex space-x-8 relative scroll-smooth overflow-x-auto"
            aria-label="Tabs"
          >
            {props.tabs.map((tab) => (
              <div
                key={tab.name}
                style={{
                  borderColor: op ? accentColor : 'transparent',
                  color: op ? accentColor : '#6B7280',
                }}
                className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                {tab.name}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

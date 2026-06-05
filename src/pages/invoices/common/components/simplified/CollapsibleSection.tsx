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
import { ChevronDown } from '$app/components/icons/ChevronDown';
import classNames from 'classnames';
import { ReactNode } from 'react';
import {
  InvoiceEditorSection,
  useInvoiceEditorPreferences,
} from '../../hooks/useInvoiceEditorPreferences';

interface Props {
  section: InvoiceEditorSection;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered inside the header when collapsed; useful to surface state without opening. */
  collapsedHint?: ReactNode;
  /** If true and no stored preference exists, the section opens by default. */
  autoOpen?: boolean;
  children: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  section,
  title,
  subtitle,
  collapsedHint,
  autoOpen,
  children,
  rightSlot,
  className,
}: Props) {
  const colors = useColorScheme();
  const { isExpanded, setExpanded } = useInvoiceEditorPreferences();

  const expanded = isExpanded(section, autoOpen);

  return (
    <div
      className={classNames(
        'border rounded-md overflow-hidden flex flex-col h-full',
        className
      )}
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$24,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(section, !expanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ color: colors.$3 }}
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{title}</span>

          {subtitle && (
            <span className="text-xs mt-0.5" style={{ color: colors.$22 }}>
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-x-3">
          {rightSlot}

          <span
            className="transition-transform duration-150"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: colors.$22,
            }}
          >
            <ChevronDown color={colors.$22} size="1.1rem" />
          </span>
        </div>
      </button>

      {expanded ? (
        <div
          className="border-t px-6 py-4 flex-1"
          style={{ borderColor: colors.$24 }}
        >
          {children}
        </div>
      ) : (
        collapsedHint && (
          <div
            className="border-t px-6 py-3 flex-1 flex items-center"
            style={{ borderColor: colors.$24, color: colors.$22 }}
          >
            <span className="text-xs">{collapsedHint}</span>
          </div>
        )
      )}
    </div>
  );
}

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Block } from '../types';

interface PageBreakGuidesProps {
  blocks: Block[];
  pageSize?: string;
}

function getPageHeightPixels(pageSize: string = 'A4'): number {
  switch (pageSize) {
    case 'letter':
      return 1056;
    case 'A4':
    default:
      return 1122;
  }
}

export function PageBreakGuides({ blocks, pageSize }: PageBreakGuidesProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const pageHeight = getPageHeightPixels(pageSize);
  const padY = 30;
  const rowH = 60;
  const gapY = 16;

  const maxBottom =
    blocks.length > 0
      ? Math.max(
          ...blocks.map((b) => {
            const { y, h } = b.gridPosition;
            return padY + (y + h) * rowH + (y + h - 1) * gapY;
          })
        )
      : 0;

  const pagesNeeded = Math.max(1, Math.ceil(maxBottom / pageHeight));
  const guideCount = Math.max(0, pagesNeeded - 1);

  if (guideCount === 0) {
    return null;
  }

  return (
    <>
      {Array.from({ length: guideCount }).map((_, i) => {
        const top = (i + 1) * pageHeight;
        return (
          <div
            key={`page-break-${i}`}
            className="absolute left-0 right-0 flex items-center pointer-events-none select-none"
            style={{ top: `${top}px` }}
          >
            <div
              className="flex-1 border-t border-dashed"
              style={{ borderColor: colors.$24 }}
            />
            <span
              className="px-2 text-xs font-medium"
              style={{ color: colors.$17 }}
            >
              {t('page')} {i + 2}
            </span>
            <div
              className="flex-1 border-t border-dashed"
              style={{ borderColor: colors.$24 }}
            />
          </div>
        );
      })}
    </>
  );
}

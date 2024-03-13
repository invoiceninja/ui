/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Icon } from '$app/components/icons/Icon';
import { Maximize2 } from 'react-feather';
import { PanelResizeHandle as PanelResizeHandleBase } from 'react-resizable-panels';
import { useMediaQuery } from 'react-responsive';

export function PanelResizeHandle() {
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });

  return isLargeScreen ? (
    <PanelResizeHandleBase className="flex items-center">
      <Icon
        element={Maximize2}
        style={{ rotate: '45deg', width: '2rem', height: '1.75rem' }}
      />
    </PanelResizeHandleBase>
  ) : (
    <></>
  );
}

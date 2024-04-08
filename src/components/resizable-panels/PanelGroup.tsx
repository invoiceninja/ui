/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';
import { PanelGroup as PanelGroupBase } from 'react-resizable-panels';

interface Props {
  children: ReactNode;
  renderBasePanelGroup: boolean;
}
export function PanelGroup(props: Props) {
  const { children, renderBasePanelGroup } = props;

  return renderBasePanelGroup ? (
    <PanelGroupBase direction="horizontal" className="gap-4 mt-4">
      {children}
    </PanelGroupBase>
  ) : (
    <div className="flex flex-col gap-4">{children}</div>
  );
}

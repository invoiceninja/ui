/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { memo } from 'react';
import { Block } from '../types';
import { CanvasBlockContent } from '../block-renderers/react/CanvasBlockContent';

interface BlockRendererProps {
  block: Block;
}

export const BlockRenderer = memo(function BlockRenderer({
  block,
}: BlockRendererProps) {
  return <CanvasBlockContent block={block} />;
});

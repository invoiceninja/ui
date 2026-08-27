/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Design } from '$app/common/interfaces/design';

type VisualDesignParts = Design['design'] & {
  builderGridVersion?: number;
};

export function isVisualBuilderDesign(design: Design): boolean {
  const designParts = design.design as VisualDesignParts | undefined;

  return Boolean(
    typeof designParts?.builderGridVersion === 'number' ||
      (Array.isArray(designParts?.blocks) && designParts.blocks.length > 0)
  );
}

export function getDesignEditRoute(design: Design): string {
  return isVisualBuilderDesign(design)
    ? route('/settings/invoice_design/builder/:id', { id: design.id })
    : route('/settings/invoice_design/custom_designs/:id/edit', {
        id: design.id,
      });
}

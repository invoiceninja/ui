/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDesignsQuery } from '../queries/designs';

export const useResolveDesign = () => {
  const { data: designs } = useDesignsQuery();

  return (id: string) => designs?.find((design) => design.id === id);
};

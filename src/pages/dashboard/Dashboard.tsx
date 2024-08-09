/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Totals } from '$app/pages/dashboard/components/Totals';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import { useEnabled } from '$app/common/guards/guards/enabled';
import GridLayoutComponent from './components/ResizableContent';

interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
}

export default function Dashboard() {
  const [t] = useTranslation();
  useTitle('dashboard');

  const enabled = useEnabled();

  return (
    <Default title={t('dashboard')} breadcrumbs={[]}>
      <Totals />

      <GridLayoutComponent />
    </Default>
  );
}

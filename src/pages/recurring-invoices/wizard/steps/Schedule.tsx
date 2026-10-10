/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useOutletContext } from 'react-router-dom';
import { StepSchedule } from '../common/components/StepSchedule';
import { WizardContext } from '../common/hooks/useWizard';

export default function Schedule() {
  const { wizard } = useOutletContext<WizardContext>();

  return <StepSchedule wizard={wizard} />;
}

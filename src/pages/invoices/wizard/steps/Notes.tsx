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
import { StepNotes } from '../components/StepNotes';
import { WizardContext } from '../useWizard';

export default function Notes() {
  const { wizard } = useOutletContext<WizardContext>();

  return <StepNotes wizard={wizard} />;
}

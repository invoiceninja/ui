/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Button, SelectField } from '../../../../components/forms';

export function CustomLabels() {
  const [t] = useTranslation();

  return (
    <Card title={t('custom_labels')}>
      <Element
        leftSide={
          <SelectField>
            <option value="amount">Amount</option>
          </SelectField>
        }
      >
        <Button behavior="button" type="minimal">
          {t('add_custom')}
        </Button>
      </Element>
    </Card>
  );
}

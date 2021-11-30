/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useSelector } from 'react-redux';
import CommonProps from '../../common/interfaces/common-props.interface';
import { RootState } from '../../common/stores/store';

interface Props extends CommonProps {}

export function Thead(props: Props) {
  const colors = useSelector((state: RootState) => state.settings.colors);

  return (
    <thead style={{ backgroundColor: colors.primary }}>
      <tr>{props.children}</tr>
    </thead>
  );
}

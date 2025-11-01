/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { ComboboxAsync } from '$app/components/forms/Combobox';
import { endpoint } from '$app/common/helpers';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { Design } from '$app/common/interfaces/design';

export interface TemplateSelectorProps extends GenericSelectorProps<Design> {
  initiallyVisible?: boolean;
  entity: string;
  staleTime?: number;
  disableWithSpinner?: boolean;
  clearInputAfterSelection?: boolean;
}

export function TemplateSelector(props: TemplateSelectorProps) {

  return (
    <>

      <ComboboxAsync<Design>
        inputOptions={{
          label: props.inputLabel?.toString(),
          value: props.value || null,
        }}
        endpoint={endpoint(`/api/v1/designs?is_template=true&entities=${props.entity}`)}
        readonly={props.readonly}
        onDismiss={props.onClearButtonClick}
        querySpecificEntry="/api/v1/designs/:id"
        initiallyVisible={props.initiallyVisible}
        entryOptions={{
          id: 'id',
          label: 'name',
          value: 'id'
        }}
        onChange={(value) => value.resource && props.onChange(value.resource)}
        staleTime={props.staleTime || Infinity}
        sortBy="name|asc"
        key="template_selector"
        clearInputAfterSelection={props.clearInputAfterSelection}
      />

      <ErrorMessage className="mt-2">{props.errorMessage}</ErrorMessage>
    </>
  );
}

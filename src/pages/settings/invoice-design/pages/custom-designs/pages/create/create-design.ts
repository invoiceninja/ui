/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design } from '$app/common/interfaces/design';

export type CustomDesignCreationType = 'design' | 'template';

const blankTwigTemplate =
  '<html>\n\t<head>\n\t</head>\n\t<body>\n\t\t<ninja>\n\n\t\t</ninja>\n\t</body>\n</html>\n';

export function getCustomDesignCreationType(
  searchParams: URLSearchParams
): CustomDesignCreationType {
  return searchParams.get('type') === 'template' ? 'template' : 'design';
}

export function prepareDesignForCreation(
  design: Design,
  type: CustomDesignCreationType
): Design {
  if (type === 'template') {
    return {
      ...design,
      is_template: true,
      design: {
        ...design.design,
        header: ' ',
        body: design.design.body.length
          ? design.design.body
          : blankTwigTemplate,
        footer: ' ',
        includes: ' ',
      },
    };
  }

  return {
    ...design,
    is_template: false,
    design: {
      ...design.design,
      header: '',
      body: '',
      footer: '',
      includes: '',
    },
    entities: '',
  };
}

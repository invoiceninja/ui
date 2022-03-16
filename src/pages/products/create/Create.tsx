/**
* Invoice Ninja (https://invoiceninja.com).
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @license https://www.elastic.co/licensing/elastic-license
*/

import { Container } from "components/Container";
import { Default } from "components/layouts/Default";
import { useTranslation } from "react-i18next";
import { CreateComponent } from "./CreateComponent";


export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('products'), href: '/products' },
    { name: t('new_product'), href: '/products/create' },
  ];
  return (
   <Default breadcrumbs={pages}>
<Container>
  <CreateComponent/>
</Container>
   </Default>
  )
}

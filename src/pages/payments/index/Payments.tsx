import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default'
import React from 'react'
import { useTranslation } from 'react-i18next';

type Props = {test?:string}

export function Payments(props: Props) {
    const [t] = useTranslation();

    const pages: BreadcrumRecord[] = [{ name: t('payments'), href: '/payments' }];

  return (
   <Default
   breadcrumbs={pages}
   docsLink='docs/payments/'
   ></Default>
  )
}


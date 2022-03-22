import axios from 'axios';
import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { defaultHeaders } from 'common/queries/common/headers';
import { useEffect, useState } from 'react';

export function useAllInvoicesQuery(params:{id:string}) {
  const [page, setpage] = useState(1);
  const [invocesdata, setinvocesdata] = useState<Invoice[]>([])
  useEffect(() => {
    axios
      .get(endpoint('/api/v1/invoices?client_id=:id&page=:page_id', { page_id: page,id:params.id }), {
        headers: defaultHeaders,
      })
      .then((data) => {
        if (data.data.data.length>0) {
              setinvocesdata([...invocesdata,...data.data.data])
            

         setpage(page+1)
        }
      });
  }, [page]);
  return invocesdata;
}

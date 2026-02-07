import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Document } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import type { AxiosError } from 'axios';
import { useState } from 'react';

interface Params {
  doc: Document | undefined;
}

export function useDownloadDocument({ doc }: Params) {
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const downloadDocument = () => {
    if (!doc) return;

    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      request(
        'POST',
        docuNinjaEndpoint(`/api/documents/${doc.id}/download`),
        {},
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then((response) => {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const contentDisposition = response.headers['content-disposition'];
          let filename = 'document.pdf';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
            if (filenameMatch?.[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '');
            }
          }

          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.error(error.response.data.message || 'something_went_wrong');
          } else if (error.response?.status === 400) {
            toast.error('document_not_ready_for_download');
          } else {
            toast.error('something_went_wrong');
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return { isFormBusy, downloadDocument };
}

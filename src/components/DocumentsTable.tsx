/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { Document } from 'common/interfaces/document.interface';
import prettyBytes from 'pretty-bytes';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDelete, MdDownload, MdPageview } from 'react-icons/md';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
import { FileIcon } from './FileIcon';
import { Icon } from './icons/Icon';
import { PasswordConfirmation } from './PasswordConfirmation';
import { Table, Tbody, Td, Th, Thead, Tr } from './tables';

interface Props {
  documents: Document[];
  onDocumentDelete?: () => unknown;
}

export function DocumentsTable(props: Props) {
  const [t] = useTranslation();

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);

  const [documentId, setDocumentId] = useState<string>();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const destroy = (password: string) => {
    toast.processing();

    request(
      'delete',
      endpoint('/api/v1/documents/:id', { id: documentId }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('deleted_document');
        props.onDocumentDelete?.();
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  return (
    <>
      <Table>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('date')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('size')}</Th>
          <Th>{/* Placeholder for actions */}</Th>
        </Thead>

        <Tbody>
          {!props.documents.length && (
            <Tr>
              <Td colSpan={5}>{t('no_records_found')}</Td>
            </Tr>
          )}

          {props.documents.map((document, index) => (
            <Tr key={index}>
              <Td className="truncate">
                <div className="flex items-center space-x-2">
                  <FileIcon type={document.type} />
                  <span>{document.name}</span>
                </div>
              </Td>
              <Td>{date(document.updated_at, dateFormat)}</Td>
              <Td>{document.type}</Td>
              <Td>{prettyBytes(document.size)}</Td>
              <Td>
                <Dropdown label={t('more_actions')}>
                  <DropdownElement icon={<Icon element={MdPageview} />}>
                    <a
                      target="_blank"
                      className="block w-full"
                      href={endpoint('/documents/:hash?inline=true', {
                        hash: document.hash,
                      })}
                      rel="noreferrer"
                    >
                      {t('view')}
                    </a>
                  </DropdownElement>

                  <DropdownElement icon={<Icon element={MdDownload} />}>
                    <a
                      target="_blank"
                      className="block w-full"
                      rel="noreferrer"
                      href={endpoint('/documents/:hash', {
                        hash: document.hash,
                      })}
                    >
                      {t('download')}
                    </a>
                  </DropdownElement>

                  <DropdownElement
                    onClick={() => {
                      setDocumentId(document.id);
                      setIsPasswordConfirmModalOpen(true);
                    }}
                    icon={<Icon element={MdDelete} />}
                  >
                    {t('delete')}
                  </DropdownElement>
                </Dropdown>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={destroy}
      />
    </>
  );
}

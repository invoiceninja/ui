/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { Project } from 'common/interfaces/project';
import { useProjectQuery } from 'common/queries/projects';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function Edit() {
  const { documentTitle } = useTitle('edit_project');
  const { id } = useParams();
  const { data } = useProjectQuery({ id });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [project, setProject] = useState<Project>();

  useEffect(() => {
    if (data) {
      setProject({ ...data });
    }
  }, [data]);

  return <Card title={documentTitle}>{/*  */}</Card>;
}

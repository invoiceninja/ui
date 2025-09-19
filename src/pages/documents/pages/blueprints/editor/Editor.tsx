import { useLocation } from 'react-router-dom';
import { Default } from '$app/components/layouts/Default';
import { GrapeJSEditor } from '../create/components/GrapeJSEditor';

export default function BlueprintEditor() {
  const location = useLocation();
  const { templateHtml } = location.state || {};

  const handleSave = (html: string) => {
    console.log('Saving blueprint:', html);
    // TODO: Implement save functionality
  };

  const handleCancel = () => {
    console.log('Canceling blueprint edit');
    // TODO: Implement cancel functionality
  };

  return (
    <Default breadcrumbs={[]}>
      <div className="h-[calc(100vh-200px)]">
        <GrapeJSEditor 
          initialHtml={templateHtml || ''} 
          onSave={handleSave}
          onCancel={handleCancel}
          blueprintId="template"
        />
      </div>
    </Default>
  );
}

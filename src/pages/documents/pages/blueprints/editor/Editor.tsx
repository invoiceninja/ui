import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Default } from '$app/components/layouts/Default';
import { GrapeJSEditor } from '../create/components/GrapeJSEditor';
import { useCreateBlueprint, useUpdateBlueprint } from '$app/common/queries/docuninja/blueprints';
import { route } from '$app/common/helpers/route';

export default function BlueprintEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { templateHtml, blueprintName } = location.state || {};
  
  const createBlueprint = useCreateBlueprint();
  const updateBlueprint = useUpdateBlueprint();

  // Determine if this is a new template or editing existing
  const isNewTemplate = id === 'create';

  const handleSave = async (html: string) => {
    try {
      // Base64 encode the HTML content
      const base64Html = btoa(html);
      
      if (isNewTemplate) {
        // Create new blueprint
        const response = await createBlueprint({
          name: blueprintName || 'New Blueprint',
          base64_file: base64Html,
          is_template: true
        });
        
        // Navigate to the editor for the newly created blueprint
        navigate(route('/documents/blueprint/:id/editor', { id: response.data.data.id }));
      } else if (id) {
        // Update existing blueprint
        await updateBlueprint({
          id: id,
          base64_file: base64Html,
          name: blueprintName || 'Updated Blueprint',
          is_template: true
        });
        
      }

      
    } catch (error) {
      console.error('Error saving blueprint:', error);
    }
  };

  const handleCancel = () => {
    // Navigate back to blueprints list
    navigate('/documents/blueprints');
  };

  return (
    <Default breadcrumbs={[]}>
      <div className="h-[calc(100vh-200px)]">
        <GrapeJSEditor 
          initialHtml={templateHtml || ''} 
          onSave={handleSave}
          onCancel={handleCancel}
          blueprintName={blueprintName || 'New Blueprint'}
        />
      </div>
    </Default>
  );
}

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Default } from '$app/components/layouts/Default';
import { GrapeJSEditor } from '../create/components/GrapeJSEditor';
import { useCreateBlueprint, useUpdateBlueprint, useBlueprintQuery } from '$app/common/queries/docuninja/blueprints';
import { route } from '$app/common/helpers/route';
import { useState, useEffect } from 'react';

export default function BlueprintEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { templateHtml: stateTemplateHtml, blueprintName: stateBlueprintName } = location.state || {};
  
  console.log('BlueprintEditor - Component loaded');
  console.log('BlueprintEditor - location.state:', location.state);
  console.log('BlueprintEditor - stateTemplateHtml:', stateTemplateHtml);
  console.log('BlueprintEditor - stateTemplateHtml type:', typeof stateTemplateHtml);
  console.log('BlueprintEditor - stateTemplateHtml length:', stateTemplateHtml?.length);
  console.log('BlueprintEditor - stateBlueprintName:', stateBlueprintName);
  console.log('BlueprintEditor - id:', id);
  
  const createBlueprint = useCreateBlueprint();
  const updateBlueprint = useUpdateBlueprint();
  
  // Fallback: fetch blueprint data if state is not available
  const { data: blueprintResponse, isLoading } = useBlueprintQuery({ id: id || '' });
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [blueprintName, setBlueprintName] = useState<string>('');
  
  useEffect(() => {
    console.log('BlueprintEditor - useEffect triggered');
    console.log('BlueprintEditor - stateTemplateHtml:', stateTemplateHtml);
    console.log('BlueprintEditor - blueprintResponse:', blueprintResponse);
    
    // Use state data if available, otherwise use fetched data
    if (stateTemplateHtml) {
      console.log('BlueprintEditor - Using state template HTML');
      setTemplateHtml(stateTemplateHtml);
    } else if (blueprintResponse?.data?.data?.template) {
      console.log('BlueprintEditor - Using fetched template HTML');
      console.log('BlueprintEditor - Fetched template type:', typeof blueprintResponse.data.data.template);
      console.log('BlueprintEditor - Fetched template length:', blueprintResponse.data.data.template.length);
      setTemplateHtml(blueprintResponse.data.data.template);
    }
    
    if (stateBlueprintName) {
      console.log('BlueprintEditor - Using state blueprint name');
      setBlueprintName(stateBlueprintName);
    } else if (blueprintResponse?.data?.data?.name) {
      console.log('BlueprintEditor - Using fetched blueprint name');
      setBlueprintName(blueprintResponse.data.data.name);
    }
  }, [stateTemplateHtml, stateBlueprintName, blueprintResponse]);
  
  console.log('BlueprintEditor - Final templateHtml:', templateHtml);
  console.log('BlueprintEditor - Final templateHtml length:', templateHtml.length);
  console.log('BlueprintEditor - Final blueprintName:', blueprintName);

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
        navigate(route('/documents/blueprints/:id/template_editor', { id: response.data.data.id }));
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

  // Show loading state while we're fetching data
  if (!templateHtml && !isLoading) {
    return (
      <Default breadcrumbs={[]}>
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading template editor...</p>
          </div>
        </div>
      </Default>
    );
  }

  return (
    <Default breadcrumbs={[]}>
      <div className="h-[calc(100vh-200px)]">
        <GrapeJSEditor 
          key={`${id}-${templateHtml.length}`}
          initialHtml={templateHtml} 
          onSave={handleSave}
          onCancel={handleCancel}
          blueprintName={blueprintName || 'New Blueprint'}
        />
      </div>
    </Default>
  );
}

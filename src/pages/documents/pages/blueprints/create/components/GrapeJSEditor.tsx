import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import * as beautify from 'js-beautify';
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import './grapejs-styles.css';
import { grapejsConfig } from './grapejs-config';
interface GrapeJSEditorProps {
  initialHtml: string;
  onSave: (html: string, projectData: string) => void;
  onCancel: () => void;
  blueprintName: string;
  initialProjectData?: any; // GrapeJS project data object
}
declare global {
  interface Window {
    grapesjs: any;
  }
}

export function GrapeJSEditor({ initialHtml, onSave, onCancel, blueprintName, initialProjectData }: GrapeJSEditorProps) {
  
  const [t] = useTranslation();
  const colors = useColorScheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);
  
  // Monaco editor state
  const [showMonacoEditor, setShowMonacoEditor] = useState(false);
  const [monacoHtml, setMonacoHtml] = useState('');
  const [monacoCss, setMonacoCss] = useState('');
  const [,setMonacoHtmlEditor] = useState<any>(null);
  const [,setMonacoCssEditor] = useState<any>(null);

  
  useEffect(() => {
    // Clean up any existing editor first
    if ((window as any).grapesEditor) {
      (window as any).grapesEditor.destroy();
      (window as any).grapesEditor = null;
    }

    isInitialized.current = false;

    const initializeEditor = () => {
      if (!editorRef.current) {
        return;
      }

      if (!editorRef.current.parentNode) {
        return;
      }

      if ((window as any).grapesEditor) {
        return;
      }
    try {
        const editor = grapesjs.init({
          container: editorRef.current,
          ...grapejsConfig,
        });

      const originalGetCss = editor.getCss;
            
      editor.getCss = function() {
        const css = originalGetCss.call(this);

        return css ? css
          .replace(/\*\s*\{\s*\}/g, '')
          .replace(/\*\s*\{\s*box-sizing:\s*border-box;\s*\}/g, '')
          .replace(/body\s*\{\s*margin:\s*0;\s*\}/g, '')
          .replace(/\n\s*\n/g, '\n') : '';
      };

      editor.I18n.addMessages({
        en: {
          styleManager: {
            properties: {
              'background-repeat': 'Repeat',
              'background-position': 'Position',
              'background-attachment': 'Attachment',
              'background-size': 'Size',
            }
          },
        }
      });

      const pn = editor.Panels;
      const cmdm = editor.Commands;

      // Update canvas-clear command
      cmdm.add('canvas-clear', function() {
        if(confirm('Are you sure to clean the canvas?')) {
          editor.runCommand('core:canvas-clear')
          setTimeout(function(){ localStorage.clear()}, 0)
        }
      });

      // Add and beautify tooltips
      [['sw-visibility', 'Show Borders'], ['preview', 'Preview'], ['fullscreen', 'Fullscreen'],
       ['export-template', 'Export'], ['undo', 'Undo'], ['redo', 'Redo'],
       ['gjs-open-import-webpage', 'Import'], ['canvas-clear', 'Clear canvas']]
      .forEach(function(item) {
        pn.getButton('options', item[0])?.set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
      });
      [['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']]
      .forEach(function(item) {
        pn.getButton('views', item[0])?.set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
      });

        // Do stuff on load
        editor.on('load', function() {
          const $ = grapesjs.$;
          
          // Remove unwanted blocks
          const blockManager = editor.BlockManager;
          const unwantedBlocks = ['link', 'link-block', 'quote', 'text-basic', 'map', 'video', 'column3-7'];
          unwantedBlocks.forEach(blockId => {
            if (blockManager.get(blockId)) {
              blockManager.remove(blockId);
            }
          });
          
        
        // Add a small delay to ensure DOM is fully ready
        setTimeout(function() {

        // Add Monaco editor button
        pn.addButton('views', {
          attributes: {
            title: 'Monaco Code Editor'
          },
          className: 'fas fa-code',
          command: function(editor: any) {
            // Get current content
            const html = editor.getHtml();
            const css = editor.getCss();
            
            let cleanHtml = html;
            if (cleanHtml.includes('<body')) {
              const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              if (bodyMatch && bodyMatch[1]) {
                cleanHtml = bodyMatch[1].trim();
              }
            }
            
            // Remove head elements (meta, title, etc.) that shouldn't be in body content
            cleanHtml = cleanHtml
              .replace(/<meta[^>]*>/gi, '')
              .replace(/<title[^>]*>.*?<\/title>/gi, '')
              .replace(/<link[^>]*>/gi, '')
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<style[^>]*>.*?<\/style>/gi, '')
              .replace(/<head[^>]*>.*?<\/head>/gi, '')
              .trim();
            
            const formattedHtml = beautify.html(cleanHtml, {
              indent_size: 2,
              indent_char: ' ',
              max_preserve_newlines: 2,
              preserve_newlines: true,
              indent_scripts: 'normal',
              end_with_newline: true,
              wrap_line_length: 120,
              indent_inner_html: true,
              indent_empty_lines: false
            });
            
            const formattedCss = beautify.css(css || '', {
              indent_size: 2,
              indent_char: ' ',
              max_preserve_newlines: 2,
              preserve_newlines: true,
              end_with_newline: true,
              wrap_line_length: 120,
              indent_empty_lines: false
            });
            
            // Set the formatted code and show Monaco editor
            setMonacoHtml(formattedHtml);
            setMonacoCss(formattedCss);
            setShowMonacoEditor(true);
          },
          togglable: false,
          id: 'monaco-editor'
        });

        // Show borders by default
        pn.getButton('options', 'sw-visibility')?.set('active', 1);

        // Load and show settings and style manager
        const openTmBtn = pn.getButton('views', 'open-tm');
        openTmBtn && openTmBtn.set('active', 1);
        const openSm = pn.getButton('views', 'open-sm');
        openSm && openSm.set('active', 1);

        // Remove trait view
        pn.removeButton('views', 'open-tm');
        
        // Make blocks panel the default active panel
        const openBlocksBtn = pn.getButton('views', 'open-blocks');
        if (openBlocksBtn) {
          openBlocksBtn.set('active', 1);
          // Trigger the command to open the blocks panel
          editor.runCommand('open-blocks');
        }

        // Add Settings Sector
        const traitsSector = $('<div class="gjs-sm-sector no-select">'+
          '<div class="gjs-sm-sector-title"><span class="icon-settings fas fa-cog"></span> <span class="gjs-sm-sector-label">Settings</span></div>' +
          '<div class="gjs-sm-properties" style="display: none;"></div>');
        const traitsProps = traitsSector.find('.gjs-sm-properties');
        
        // Check if traits container exists before appending
        const traitsContainer = $('.gjs-trt-traits');
        if (traitsContainer.length > 0) {
          traitsProps.append(traitsContainer);
        }
        $('.gjs-sm-sectors').before(traitsSector);
        traitsSector.find('.gjs-sm-sector-title').on('click', function(){
          const traitStyle = traitsProps.get(0).style;
          const hidden = traitStyle.display == 'none';
          if (hidden) {
            traitStyle.display = 'block';
          } else {
            traitStyle.display = 'none';
          }
        });

        }, 100); // Close setTimeout with 100ms delay

      });
        // Add only custom placeholder blocks - let GrapeJS handle default blocks
        const blockManager = editor.BlockManager;

        const domc = editor.DomComponents;

        // Register signature placeholder component type
        domc.addType('signature-placeholder', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['signature-placeholder'],
              style: {
                border: '2px dashed #007bff',
                padding: '10px',
                'text-align': 'center',
                background: '#f8f9fa',
                color: '#007bff',
                'font-weight': 'bold',
                display: 'flex !important',
                'align-items': 'center !important',
                'justify-content': 'center !important',
                width: '100%',
                'min-height': '80px',
                opacity: 0.1,
                cursor: 'pointer',
                fontSize: '20px'
              },
              content: '',
              traits: [
                {
                  type: 'text',
                  name: 'placeholder-text',
                  label: '',
                  default: ''
                }
              ]
            }
          }
        });

        // Register date placeholder component type
        domc.addType('date-placeholder', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['date-placeholder'],
              style: {
                border: '2px dashed #28a745',
                padding: '10px',
                'text-align': 'center',
                background: '#f8f9fa',
                color: '#28a745',
                'font-weight': 'bold',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                width: '100%',
                'min-height': '80px',
                opacity: 0.1,
                cursor: 'pointer'
              },
              content: '',
              traits: [
                {
                  type: 'text',
                  name: 'placeholder-text',
                  label: '',
                  default: ''
                }
              ]
            }
          }
        });

        // Check if blocks already exist to prevent duplicates
        if (!blockManager.get('signature-placeholder')) {
          // Add signature placeholder block
          blockManager.add('signature-placeholder', {
            label: '<div class="gjs-block-label"><i class="fas fa-signature gjs-block__media"></i><div class="gjs-block-label">Signature</div>',
            content: {
              type: 'signature-placeholder'
            },
            category: 'Signatory Placeholders',
            attributes: {
              'data-block': 'signature-placeholder',
              'class': 'signatory-block',
            }
          });

          // Add date placeholder block
          blockManager.add('date-placeholder', {
            label: '<div class="gjs-block-label"><i class="fas fa-calendar gjs-block__media"></i><div class="gjs-block-label">Date</div>',
            content: {
              type: 'date-placeholder'
            },
            category: 'Signatory Placeholders',
            attributes: {
              'data-block': 'date-placeholder',
              'class': 'signatory-block',
            }
          });


          blockManager.add('client-name-placeholder', {
            label: '<div class="gjs-block-label">Name</div>',
            content: {
              type: 'text',
              content: '{{client.name}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });

          blockManager.add('client-first-name-placeholder', {
            label: '<div class="gjs-block-label">First Name</div>',
            content: {
              type: 'text',
              content: '{{client.first_name}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });

          blockManager.add('client-last-name-placeholder', {
            label: '<div class="gjs-block-label">Last Name</div>',
            content: {
              type: 'text',
              content: '{{client.last_name}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });


          blockManager.add('client-email-placeholder', {
            label: '<div class="gjs-block-label">Email</div>',
            content: {
              type: 'text',
              content: '{{client.email}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });


          blockManager.add('client-phone-placeholder', {
            label: '<div class="gjs-block-label">Phone</div>',
            content: {
              type: 'text',
              content: '{{client.phone}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });


          blockManager.add('client-address-placeholder', {
            label: '<div class="gjs-block-label">Address</div>',
            content: {
              type: 'text',
              content: '{{client.address}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });

          blockManager.add('client-city-placeholder', {
            label: '<div class="gjs-block-label">City</div>',
            content: {
              type: 'text',
              content: '{{client.city}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });

          blockManager.add('client-state-placeholder', {
            label: '<div class="gjs-block-label">State</div>',
            content: {
              type: 'text',
              content: '{{client.state}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });


          blockManager.add('client-postal-code-placeholder', {
            label: '<div class="gjs-block-label">Postal Code</div>',
            content: {
              type: 'text',
              content: '{{client.postal_code}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });
          


          blockManager.add('client-country-placeholder', {
            label: '<div class="gjs-block-label">Country</div>',
            content: {
              type: 'text',
              content: '{{client.country}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });
          

          blockManager.add('client-vat-number-placeholder', {
            label: '<div class="gjs-block-label">VAT/TAX Number</div>',
            content: {
              type: 'text',
              content: '{{client.vat_number}}'
            },
            category: 'Client Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'client-block',
            }
          });

///////////////////////////////////////////////////////////
          blockManager.add('user-name-placeholder', {
            label: '<div class="gjs-block-label">Name</div>',
            content: {
              type: 'text',
              content: '{{user.name}}'
            },
            category: 'User Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'user-block',
            }
          });

          blockManager.add('user-first-name-placeholder', {
            label: '<div class="gjs-block-label">First Name</div>',
            content: {
              type: 'text',
              content: '{{user.first_name}}'
            },
            category: 'User Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'user-block',
            }
          });


          blockManager.add('user-last-name-placeholder', {
            label: '<div class="gjs-block-label">Last Name</div>',
            content: {
              type: 'text',
              content: '{{user.last_name}}'
            },
            category: 'User Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'user-block',
            }
          });


          blockManager.add('user-email-placeholder', {
            label: '<div class="gjs-block-label">Email</div>',
            content: {
              type: 'text',
              content: '{{user.email}}'
            },
            category: 'User Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'user-block',
            }
          });


          blockManager.add('user-phone-placeholder', {
            label: '<div class="gjs-block-label">Phone</div>',
            content: {
              type: 'text',
              content: '{{user.phone}}'
            },
            category: 'User Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'user-block',
            }
          });

          blockManager.add('company-name-placeholder', {
            label: '<div class="gjs-block-label">Name</div>',
            content: {
              type: 'text',
              content: '{{company.name}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });
          
          blockManager.add('company-address-placeholder', {
            label: '<div class="gjs-block-label">Address</div>',
            content: {
              type: 'text',
              content: '{{company.address}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-city-placeholder', {
            label: '<div class="gjs-block-label">City</div>',
            content: {
              type: 'text',
              content: '{{company.city}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-state-placeholder', {
            label: '<div class="gjs-block-label">State</div>',
            content: {
              type: 'text',
              content: '{{company.state}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-postal-code-placeholder', {
            label: '<div class="gjs-block-label">Postal Code</div>',
            content: {
              type: 'text',
              content: '{{company.postal_code}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-country-placeholder', {
            label: '<div class="gjs-block-label">Country</div>',
            content: {
              type: 'text',
              content: '{{company.country}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-email-placeholder', {
            label: '<div class="gjs-block-label">Email</div>',
            content: {
              type: 'text',
              content: '{{company.email}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-phone-placeholder', {
            label: '<div class="gjs-block-label">Phone</div>',
            content: {
              type: 'text',
              content: '{{company.phone}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-vat-number-placeholder', {
            label: '<div class="gjs-block-label">VAT/TAX Number</div>',
            content: {
              type: 'text',
              content: '{{company.vat_number}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

          blockManager.add('company-website-placeholder', {
            label: '<div class="gjs-block-label">Website</div>',
            content: {
              type: 'text',
              content: '{{company.website}}'
            },
            category: 'Company Variables',
            attributes: {
              'data-block': 'dynamic-text',
              'class': 'company-block',
            }
          });

        }

        // Mark editor as ready
        setIsEditorReady(true);

        // Store editor reference for cleanup
        (window as any).grapesEditor = editor;

        // Listen for block render events to apply category-specific styling
        editor.on('block:render', (blockView: any) => {
          const category = blockView.model.get('category');
          const blockElement = blockView.el;
          
          if (category && blockElement) {
            switch (category) {
              case 'Client Variables':
                blockElement.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
                blockElement.style.color = 'white';
                blockElement.style.borderLeft = '4px solid #2196f3';
                blockElement.style.borderRadius = '8px';
                break;
              case 'User Variables':
                blockElement.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
                blockElement.style.color = 'white';
                blockElement.style.borderLeft = '4px solid #4caf50';
                blockElement.style.borderRadius = '8px';
                break;
              case 'Company Variables':
                blockElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                blockElement.style.color = 'white';
                blockElement.style.borderLeft = '4px solid #9c27b0';
                blockElement.style.borderRadius = '8px';
                break;
              case 'Signatory Placeholders':
                blockElement.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                blockElement.style.color = 'white';
                blockElement.style.borderLeft = '4px solid #ff9800';
                blockElement.style.borderRadius = '8px';
                break;
            }
          }
        });


        // Load project data if provided
        if (initialProjectData) {
          try {
            editor.loadProjectData(initialProjectData);
          } catch (error) {
            // Silent error handling
          }
        }
      } catch (error) {
        // If canvas error, try to reinitialize after a delay
        if (error instanceof Error && error.message.includes('getFrames')) {
          setTimeout(() => {
            try {
              if ((window as any).grapesEditor) {
                (window as any).grapesEditor.destroy();
                (window as any).grapesEditor = null;
              }
              initializeEditor();
            } catch (retryError) {
              // Silent retry failure
            }
          }, 1000);
        }
      }
    };

    const startInitWatchdog = () => {
        if (isInitialized.current) {
          return;
        }
        let tries = 0;
        const maxTries = 40; // ~10s at 250ms
        const id = setInterval(() => {
          tries++;
          const el = editorRef.current as HTMLElement | null;
          const ready = !!(el && el.isConnected && el.parentNode);
          if (ready) {
            clearInterval(id);
            initializeEditor();
            return;
          }
          
          if (tries >= maxTries) {
            clearInterval(id);
          }
        }, 250);
      
    };


    // Wait for the canvas ref to mount before initializing
    startInitWatchdog();
    
    // Cleanup function
    return () => {
      if ((window as any).grapesEditor) {
        (window as any).grapesEditor.destroy();
        (window as any).grapesEditor = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Separate useEffect to handle initialHtml updates
  useEffect(() => {
    if (initialHtml && (window as any).grapesEditor && isEditorReady) {
      try {
        (window as any).grapesEditor.setComponents(initialHtml);
      } catch (error) {
        // Silent error handling
      }
    }
  }, [initialHtml, isEditorReady]);

  // Separate useEffect to handle initialProjectData updates
  useEffect(() => {
    if (initialProjectData && (window as any).grapesEditor && isEditorReady) {
      try {
        (window as any).grapesEditor.loadProjectData(initialProjectData);
      } catch (error) {
        // Silent error handling
      }
    }
  }, [initialProjectData, isEditorReady]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if ((window as any).grapesEditor) {
        (window as any).grapesEditor.destroy();
        (window as any).grapesEditor = null;
      }
    };
  }, []);

  const handleSave = async () => {
    if (!isEditorReady || !(window as any).grapesEditor) return;

    setIsSaving(true);
    
    try {
      const editor = (window as any).grapesEditor;
      const projectData = editor.getProjectData();

      // Build per-page HTML documents for server-side rendering
      const pagesApi = (editor as any).Pages;
      const customStore = (editor as any).__customPagesStore as
        | { data: Record<string, { html: string; css: string }>; order: string[]; activeId: string }
        | undefined;

      const buildDoc = (html: string, css: string) => `<!DOCTYPE html><html><style>${css||''}</style></head><body>${html||''}</body></html>`;

      const pagesPayload: Record<string, string> = {};
      if (pagesApi && pagesApi.getAll) {
        // Iterate all pages using API
        const current = (typeof pagesApi.getActive === 'function' ? pagesApi.getActive() : (pagesApi as any).getSelected?.());
        const all = pagesApi.getAll();
        for (const pg of all) {
          // Activate each page and capture
          if (typeof (pagesApi as any).select === 'function') (pagesApi as any).select(pg);
          else if (typeof (pagesApi as any).setActive === 'function') (pagesApi as any).setActive(pg);
          const html = editor.getHtml();
          const css = editor.getCss();

          const id = pg.getId ? pg.getId() : undefined;
          if (id) pagesPayload[id] = buildDoc(String(html), String(css));
        }
        // Restore current
        if (current) {
          if (typeof (pagesApi as any).select === 'function') (pagesApi as any).select(current);
          else if (typeof (pagesApi as any).setActive === 'function') (pagesApi as any).setActive(current);
        }
      } else if (customStore) {
        // Use the custom pages store and its order
        customStore.order.forEach((id) => {
          const entry = customStore.data[id];
          pagesPayload[id] = buildDoc(entry?.html || '', entry?.css || '');
        });
      } else {
        // Single-page fallback

        const originalGetCss = editor.getCss;
            
        editor.getCss = function() {
          const css = originalGetCss.call(this);
          // Remove *{} rules and specific CSS rules
          return css ? css
            .replace(/\*\s*\{\s*\}/g, '')
            .replace(/\*\s*\{\s*box-sizing:\s*border-box;\s*\}/g, '')
            .replace(/body\s*\{\s*margin:\s*0;\s*\}/g, '')
            .replace(/\n\s*\n/g, '\n') : '';
        };

        pagesPayload['page-1'] = buildDoc(String(editor.getHtml()), String(originalGetCss));
      }

      // Also keep current page as fullHtml for backward compatibility
      const fullHtml = pagesPayload[Object.keys(pagesPayload)[0]];

      await onSave(fullHtml, { ...projectData, __pages_html__: pagesPayload });
    } catch (error) {
      // Silent error handling
    } finally {
      setIsSaving(false);
    }
  };



  const handleMonacoHtmlEditorMount = (editor: any) => {
    setMonacoHtmlEditor(editor);
    
    // Add format on save and other formatting features
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const handleMonacoCssEditorMount = (editor: any) => {
    setMonacoCssEditor(editor);
    
    // Add format on save and other formatting features
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const handleMonacoHtmlChange = (value: string | undefined) => {
    if (value !== undefined) {
      setMonacoHtml(value);
    }
  };

  const handleMonacoCssChange = (value: string | undefined) => {
    if (value !== undefined) {
      setMonacoCss(value);
    }
  };


  const handleApplyMonacoChanges = () => {
    if (!(window as any).grapesEditor) {
      return;
    }

    try {
      const editor = (window as any).grapesEditor;
      
      // Clean the HTML to remove any body tags and head elements
      let cleanHtml = monacoHtml;
      if (cleanHtml.includes('<body')) {
        const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch && bodyMatch[1]) {
          cleanHtml = bodyMatch[1].trim();
        }
      }
      
      // Remove head elements (meta, title, etc.) that shouldn't be in body content
      cleanHtml = cleanHtml
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<title[^>]*>.*?<\/title>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<head[^>]*>.*?<\/head>/gi, '')
        .trim();
      
        editor.setComponents(cleanHtml);
        editor.setStyle(monacoCss);

        editor.trigger('change:style');
        editor.trigger('change:components');
        
        // Update the project data directly
        const projectData = editor.getProjectData();
        editor.loadProjectData(projectData);
        editor.refresh();
        setShowMonacoEditor(false);

      } catch (error) {
        alert('Error applying changes. Please try again.');
      }
      
  };

  const handleCancelMonacoEditor = () => {
    setShowMonacoEditor(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm" style={{ borderColor: colors.$20 }}>
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{blueprintName}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onCancel} type="secondary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isEditorReady || isSaving}
            disableWithoutIcon
          >
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      <div id="gjs" className="flex-1 flex flex-col" style={{ backgroundColor: colors.$1 }}>
        
        {/* GrapeJS Export Toolbar */}
        <div className="panel__export"></div>

        {/* Editor Container */}
        <div className="flex-1 flex overflow-hidden">

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {/* Canvas */}
                <div className="flex-1 relative min-w-0">
                    <div ref={editorRef} className="absolute inset-0 gjs-editor w-full h-full"></div>
                </div>
            </div>
        </div>

        {/* Monaco Editor Modal */}
        {showMonacoEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Code Editor</h3>
                <div className="flex space-x-2">
                    <Button onClick={handleApplyMonacoChanges} type="primary">
                    Apply Changes
                    </Button>
                    <Button onClick={handleCancelMonacoEditor} type="secondary">
                    Cancel
                    </Button>
                </div>
                </div>
                
                {/* Dual Monaco Editors */}
                <div className="flex-1 flex p-4 gap-4">
                {/* HTML Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">HTML</h4>
                    </div>
                    <div className="flex-1 border rounded">
                    <Editor
                        height="100%"
                        defaultLanguage="html"
                        value={monacoHtml}
                        onChange={handleMonacoHtmlChange}
                        onMount={handleMonacoHtmlEditorMount}
                        options={{
                        wordWrap: "on",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        contextmenu: true,
                        fixedOverflowWidgets: true,
                        showFoldingControls: 'always',
                        suggestOnTriggerCharacters: true,
                        lineDecorationsWidth: 0,
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnType: true,
                        formatOnPaste: true,
                        autoIndent: 'full',
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoSurround: 'languageDefined',
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontal: 'hidden',
                        },
                        theme: 'vs-light',
                        quickSuggestions: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'matchingDocuments'
                        }}
                    />
                    </div>
                </div>
                
                {/* CSS Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">CSS</h4>
                    </div>
                    <div className="flex-1 border rounded">
                    <Editor
                        height="100%"
                        defaultLanguage="css"
                        value={monacoCss}
                        onChange={handleMonacoCssChange}
                        onMount={handleMonacoCssEditorMount}
                        options={{
                        wordWrap: "on",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        contextmenu: true,
                        fixedOverflowWidgets: true,
                        showFoldingControls: 'always',
                        suggestOnTriggerCharacters: true,
                        lineDecorationsWidth: 0,
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnType: true,
                        formatOnPaste: true,
                        autoIndent: 'full',
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoSurround: 'languageDefined',
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontal: 'hidden',
                        },
                        theme: 'vs-light',
                        quickSuggestions: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'matchingDocuments'
                        }}
                    />
                    </div>
                </div>
                </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}
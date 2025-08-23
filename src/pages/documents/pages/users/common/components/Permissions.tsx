import { useColorScheme } from '$app/common/colors';
import { Card, Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Button, Checkbox } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { DocuninjaUserProps } from './Details';

export const PERMISSION_VIEW = 1;
export const PERMISSION_EDIT = 2;
export const PERMISSION_DELETE = 3;
export const PERMISSION_CREATE = 4;
export const PERMISSION_REQUIRES_APPROVAL = 5;

// For better TypeScript support, also add an enum
export enum Permission {
  View = 1,
  Edit = 2,
  Delete = 3,
  Create = 4,
  RequiresApproval = 5,
}

type ModelPermission =
  | typeof PERMISSION_VIEW
  | typeof PERMISSION_EDIT
  | typeof PERMISSION_DELETE
  | typeof PERMISSION_CREATE
  | typeof PERMISSION_REQUIRES_APPROVAL;

// Available models
const MODELS: Record<string, { name: string; permissions: ModelPermission[] }> =
  {
    documents: {
      name: 'documents',
      permissions: [
        PERMISSION_CREATE,
        PERMISSION_VIEW,
        PERMISSION_EDIT,
        PERMISSION_DELETE,
        PERMISSION_REQUIRES_APPROVAL,
      ],
    },
    templates: {
      name: 'templates',
      permissions: [
        PERMISSION_CREATE,
        PERMISSION_VIEW,
        PERMISSION_EDIT,
        PERMISSION_DELETE,
      ],
    },
    blueprints: {
      name: 'blueprints',
      permissions: [
        PERMISSION_CREATE,
        PERMISSION_VIEW,
        PERMISSION_EDIT,
        PERMISSION_DELETE,
      ],
    },
    clients: {
      name: 'clients',
      permissions: [
        PERMISSION_CREATE,
        PERMISSION_VIEW,
        PERMISSION_EDIT,
        PERMISSION_DELETE,
      ],
    },
  };

export default function Permissions({ user }: DocuninjaUserProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAdmin, setIsAdmin] = useState(user?.company_user?.is_admin ?? false);
  const [permissions, setPermissions] = useState<PermissionType[]>(
    user.permissions ?? []
  );

  const getPermissionLabel = (permissionId: number) => {
    switch (permissionId) {
      case PERMISSION_VIEW:
        return t('view');
      case PERMISSION_EDIT:
        return t('edit');
      case PERMISSION_DELETE:
        return t('delete');
      case PERMISSION_CREATE:
        return t('create');
      case PERMISSION_REQUIRES_APPROVAL:
        return t('requires_approval');
      default:
        return '';
    }
  };

  const hasPermission = (model: string, permissionId: number) => {
    return permissions.some(
      (p) =>
        p.model === model &&
        p.permission_id === permissionId &&
        p.permissionable_id === null
    );
  };

  const togglePermission = (model: string, permissionId: number) => {
    const existingPermission = permissions.find(
      (p) =>
        p.model === model &&
        p.permission_id === permissionId &&
        p.permissionable_id === null
    );

    if (existingPermission) {
      setPermissions(permissions.filter((p) => p !== existingPermission));
    } else {
      setPermissions([
        ...permissions,
        {
          model,
          id: '',
          permission_id: permissionId,
          permissionable_id: null,
        },
      ]);
    }
  };

  const hasAllPermissionsOfType = (permissionId: ModelPermission) => {
    return Object.values(MODELS).every((model) => {
      if (!model.permissions.includes(permissionId)) return true;
      return hasPermission(model.name, permissionId);
    });
  };

  const toggleAllPermissionsOfType = (
    permissionId: ModelPermission,
    checked: boolean
  ) => {
    const newPermissions = [...permissions];
    for (const model of Object.values(MODELS)) {
      if (!model.permissions.includes(permissionId)) continue;

      const existingPermission = permissions.find(
        (p) =>
          p.model === model.name &&
          p.permission_id === permissionId &&
          p.permissionable_id === null
      );

      if (checked && !existingPermission) {
        newPermissions.push({
          model: model.name,
          id: '',
          permission_id: permissionId,
          permissionable_id: null,
        });
      } else if (!checked && existingPermission) {
        const index = newPermissions.indexOf(existingPermission);
        if (index > -1) {
          newPermissions.splice(index, 1);
        }
      }
    }
    setPermissions(newPermissions);
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    // try {
    //   await onUpdate({
    //     is_admin: isAdmin,
    //     permissions: isAdmin ? [] : permissions,
    //   });
    // } catch (error) {
    //   // Error handling is done in the parent component
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const hasChanges = () => {
    const originalIsAdmin = user.company_user?.is_admin ?? false;
    const originalPermissions = user.permissions ?? [];

    if (isAdmin !== originalIsAdmin) {
      return true;
    }

    if (!isAdmin) {
      return (
        JSON.stringify(permissions.sort()) !==
        JSON.stringify(originalPermissions.sort())
      );
    }

    return false;
  };

  const isPermissionDisabled = () => isAdmin || isSubmitting;

  // Separate basic permissions from special ones
  const basicPermissionTypes = [
    PERMISSION_CREATE,
    PERMISSION_VIEW,
    PERMISSION_EDIT,
    PERMISSION_DELETE,
  ];
  const specialPermissionTypes = [PERMISSION_REQUIRES_APPROVAL];

  return (
    <div>
      <div className="space-y-4">
        <Card
          title={t('permissions')}
          className="shadow-sm w-full"
          childrenClassName="pb-8"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <Element
            leftSide={t('administrator')}
            leftSideHelp={t('administrator_description')}
          >
            <Toggle
              id="admin-toggle"
              checked={isAdmin}
              onValueChange={(checked) => {
                setIsAdmin(checked);
                setPermissions([]);
              }}
            />
          </Element>

          <div className="px-4 sm:px-6 py-4">
            <Divider
              className="border-dashed"
              withoutPadding
              borderColor={colors.$20}
            />
          </div>

          {/* Headers */}
          <Element>
            <div className="grid grid-cols-5">
              {basicPermissionTypes.map((permissionId) => (
                <div
                  key={permissionId}
                  className="col-span-1 text-center"
                  style={{ color: colors.$22 }}
                >
                  {getPermissionLabel(permissionId)}
                </div>
              ))}
              {specialPermissionTypes.map((permissionId) => (
                <div
                  key={permissionId}
                  className="col-span-1 text-center"
                  style={{ color: colors.$22 }}
                >
                  {getPermissionLabel(permissionId)}
                </div>
              ))}
            </div>
          </Element>

          {/* Select All Row */}
          <Element leftSide={t('all')}>
            <div className="grid grid-cols-5">
              {basicPermissionTypes.map((permissionId) => (
                <div
                  key={`all_${permissionId}`}
                  className="col-span-1 flex justify-center"
                >
                  <Checkbox
                    checked={hasAllPermissionsOfType(
                      permissionId as ModelPermission
                    )}
                    onValueChange={(checked) => {
                      toggleAllPermissionsOfType(
                        permissionId as ModelPermission,
                        !!checked
                      );
                    }}
                    disabled={isPermissionDisabled()}
                  />
                </div>
              ))}
              {specialPermissionTypes.map((permissionId) => (
                <div
                  key={`all_${permissionId}`}
                  className="col-span-1 flex justify-center"
                >
                  <span className="text-muted-foreground">—</span>
                </div>
              ))}
            </div>
          </Element>

          {/* Individual Model Permissions */}
          {Object.values(MODELS).map((model) => (
            <Element key={model.name} leftSide={t(model.name)}>
              <div className="grid grid-cols-5">
                {basicPermissionTypes.map((permissionId) => (
                  <div
                    key={`${model.name}_${permissionId}`}
                    className="col-span-1 flex justify-center"
                  >
                    {model.permissions.includes(
                      permissionId as ModelPermission
                    ) ? (
                      <Checkbox
                        checked={hasPermission(model.name, permissionId)}
                        onValueChange={(checked) => {
                          togglePermission(model.name, permissionId);
                        }}
                        disabled={isPermissionDisabled()}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                ))}
                {specialPermissionTypes.map((permissionId) => (
                  <div
                    key={`${model.name}_${permissionId}`}
                    className="col-span-1 flex justify-center"
                  >
                    {model.name === 'documents' &&
                    model.permissions.includes(
                      permissionId as ModelPermission
                    ) ? (
                      <Checkbox
                        checked={hasPermission(model.name, permissionId)}
                        onValueChange={(checked) => {
                          togglePermission(model.name, permissionId);
                        }}
                        disabled={isPermissionDisabled()}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                ))}
              </div>
            </Element>
          ))}
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          onClick={() => {
            setIsAdmin(user.company_user?.is_admin ?? false);
            setPermissions(user.permissions ?? []);
          }}
          disabled={isSubmitting}
        >
          {t('reset')}
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting || !hasChanges()}>
          {isSubmitting ? t('saving') : t('save_changes')}
        </Button>
      </div>
    </div>
  );
}

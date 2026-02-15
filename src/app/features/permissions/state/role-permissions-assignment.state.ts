import { inject, signal, computed, Injectable } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';
import { Role } from '../models/role.model';
import { MessageService } from 'primeng/api';
import { PermissionsCrudState } from './permissions-crud.state';

/** State and actions for "assign permissions to a role" dialog. */
@Injectable()
export class RolePermissionsAssignmentState {
  private readonly api = inject(PermissionsService);
  private readonly message = inject(MessageService);
  private readonly permissionsState = inject(PermissionsCrudState);

  readonly dialogVisible = signal(false);
  readonly role = signal<Role | null>(null);
  readonly selectedPermissionIds = signal<Set<string>>(new Set());
  readonly saving = signal(false);

  readonly permissionsWithChecked = computed(() => {
    const all = this.permissionsState.permissions();
    const selected = this.selectedPermissionIds();
    return all.map((p) => ({
      ...p,
      checked: selected.has(p._id),
    }));
  });

  open(role: Role): void {
    this.role.set(role);
    this.api.getRolePermissions(role._id).subscribe({
      next: (items) => {
        this.selectedPermissionIds.set(
          new Set(items.map((i) => i.permissionId)),
        );
        this.dialogVisible.set(true);
      },
      error: () => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load role permissions',
        });
      },
    });
  }

  close(): void {
    this.dialogVisible.set(false);
    this.role.set(null);
  }

  toggle(permissionId: string, checked: boolean): void {
    const set = new Set(this.selectedPermissionIds());
    if (checked) set.add(permissionId);
    else set.delete(permissionId);
    this.selectedPermissionIds.set(set);
  }

  save(): void {
    const currentRole = this.role();
    if (!currentRole) return;
    this.saving.set(true);
    this.api
      .setRolePermissions(
        currentRole._id,
        Array.from(this.selectedPermissionIds()),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.close();
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Role permissions updated',
          });
        },
        error: (err: { error?: { message?: string } }) => {
          this.saving.set(false);
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message ?? 'Request failed',
          });
        },
      });
  }
}

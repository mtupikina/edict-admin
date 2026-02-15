import { inject, signal, Injectable } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';
import { Permission } from '../models/permission.model';
import { CreatePermissionDto } from '../models/permission.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RolesCrudState } from './roles-crud.state';

/** State and actions for the Permissions tab: list, add/edit dialog, delete. */
@Injectable()
export class PermissionsCrudState {
  private readonly api = inject(PermissionsService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly message = inject(MessageService);
  private readonly rolesState = inject(RolesCrudState);

  readonly permissions = signal<Permission[]>([]);
  readonly loading = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<Permission | null>(null);
  readonly saving = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getAllPermissions().subscribe({
      next: (perms) => {
        this.permissions.set(perms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load permissions',
        });
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.dialogVisible.set(true);
  }

  openEdit(perm: Permission): void {
    this.editing.set(perm);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.editing.set(null);
  }

  save(value: CreatePermissionDto): void {
    this.saving.set(true);
    const perm = this.editing();
    const req = perm
      ? this.api.updatePermission(perm._id, value)
      : this.api.createPermission(value);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.load();
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: perm ? 'Permission updated' : 'Permission created',
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

  confirmDelete(payload: { perm: Permission; event: Event }): void {
    this.confirmation.confirm({
      target: payload.event.target as EventTarget,
      message: `Delete permission "${payload.perm.name}"? It will be removed from all roles.`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(payload.perm),
    });
  }

  private delete(perm: Permission): void {
    this.api.deletePermission(perm._id).subscribe({
      next: () => {
        this.load();
        this.rolesState.load(); // Roles may reference this permission
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Permission deleted',
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'Failed to delete permission',
        });
      },
    });
  }
}

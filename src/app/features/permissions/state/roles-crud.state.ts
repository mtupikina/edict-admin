import { inject, signal, Injectable } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';
import { Role } from '../models/role.model';
import { CreateRoleDto } from '../models/role.model';
import { ConfirmationService, MessageService } from 'primeng/api';

/** State and actions for the Roles tab: list, add/edit dialog, delete. */
@Injectable()
export class RolesCrudState {
  private readonly api = inject(PermissionsService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly message = inject(MessageService);

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<Role | null>(null);
  readonly saving = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load roles',
        });
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.dialogVisible.set(true);
  }

  openEdit(role: Role): void {
    this.editing.set(role);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.editing.set(null);
  }

  save(value: CreateRoleDto): void {
    this.saving.set(true);
    const role = this.editing();
    const req = role
      ? this.api.updateRole(role._id, value)
      : this.api.createRole(value);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.load();
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: role ? 'Role updated' : 'Role created',
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

  confirmDelete(payload: { role: Role; event: Event }): void {
    this.confirmation.confirm({
      target: payload.event.target as EventTarget,
      message: `Delete role "${payload.role.name}"? Users with this role will keep it until you change them.`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(payload.role),
    });
  }

  private delete(role: Role): void {
    this.api.deleteRole(role._id).subscribe({
      next: () => {
        this.load();
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Role deleted',
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'Failed to delete role',
        });
      },
    });
  }
}

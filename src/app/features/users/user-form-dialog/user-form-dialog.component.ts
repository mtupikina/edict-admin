import { Component, inject, input, output, model, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { User } from '../models/user.model';
import { CreateUserDto, UpdateUserDto } from '../models/user.model';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { Role } from '../../permissions/models/role.model';

export type UserFormSavePayload =
  | CreateUserDto
  | { id: string; dto: UpdateUserDto };

const SUPER_ADMIN_NAME = 'super_admin';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
  ],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent implements OnInit {
  user = input<User | null>(null);
  visible = model<boolean>(false);
  saving = input<boolean>(false);
  saveRequest = output<UserFormSavePayload>();

  private readonly fb = inject(FormBuilder);
  private readonly permissionsService = inject(PermissionsService);

  /** Assignable roles (excludes super_admin). */
  assignableRoles: Role[] = [];
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roleIds: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });

  constructor() {
    effect(() => {
      this.visible(); // re-run when dialog opens/closes
      const u = this.user();
      if (u) {
        const roleIds = u.roleIds?.length ? u.roleIds.map((r) => r._id) : [];
        this.form.patchValue({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          roleIds,
        });
        this.form.get('email')?.disable();
      } else {
        const defaultRoleIds =
          this.assignableRoles.length > 0 ? [this.assignableRoles[0]._id] : [];
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          roleIds: defaultRoleIds,
        });
        this.form.get('email')?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.permissionsService.getAllRoles().subscribe({
      next: (roles) => {
        this.assignableRoles = roles.filter((r) => r.name !== SUPER_ADMIN_NAME);
        if (
          !this.user() &&
          this.visible() &&
          this.assignableRoles.length > 0 &&
          !this.form.get('roleIds')?.value?.length
        ) {
          this.form.patchValue({ roleIds: [this.assignableRoles[0]._id] });
        }
      },
    });
  }

  close(): void {
    this.visible.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const u = this.user();
    if (u) {
      this.saveRequest.emit({
        id: u._id,
        dto: {
          firstName: value.firstName,
          lastName: value.lastName,
          roleIds: value.roleIds,
        },
      });
    } else {
      this.saveRequest.emit({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        roleIds: value.roleIds,
      });
    }
  }
}

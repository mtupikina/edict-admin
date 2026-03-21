import { Component, inject, input, output, model, effect } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { filter, switchMap, take } from 'rxjs';
import { User } from '../models/user.model';
import { CreateUserDto, UpdateUserDto } from '../models/user.model';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { Role } from '../../permissions/models/role.model';
import { ROLE_NAMES, userMayBeTutor } from '../../permissions/constants/role-names';

export type UserFormSavePayload =
  | CreateUserDto
  | { id: string; dto: UpdateUserDto };

export interface TutorSelectOption {
  _id: string;
  label: string;
}

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
export class UserFormDialogComponent {
  /** User list from parent (avoids a duplicate GET /users while the dialog is closed). */
  users = input<User[]>([]);
  user = input<User | null>(null);
  visible = model<boolean>(false);
  saving = input<boolean>(false);
  saveRequest = output<UserFormSavePayload>();

  private readonly fb = inject(FormBuilder);
  private readonly permissionsService = inject(PermissionsService);

  /** Assignable roles (excludes super_admin). */
  assignableRoles: Role[] = [];
  /** Users that can be selected as tutors (labels for multi-select). */
  tutorOptions: TutorSelectOption[] = [];
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roleIds: [[] as string[], [Validators.required, Validators.minLength(1)]],
    tutorIds: [[] as string[]],
  });

  constructor() {
    effect(() => {
      const list = this.users();
      this.tutorOptions = list
        .filter((candidate) =>
          userMayBeTutor((candidate.roleIds ?? []).map((r) => r.name)),
        )
        .map((u) => ({
          _id: u._id,
          label: `${u.firstName} ${u.lastName} (${u.email})`,
        }));
    });

    toObservable(this.visible)
      .pipe(
        filter(Boolean),
        switchMap(() => this.permissionsService.getAllRoles().pipe(take(1))),
        takeUntilDestroyed(),
      )
      .subscribe((roles) => {
        this.assignableRoles = roles.filter((r) => r.name !== ROLE_NAMES.SUPER_ADMIN);
        if (
          !this.user() &&
          this.assignableRoles.length > 0 &&
          !this.form.get('roleIds')?.value?.length
        ) {
          this.form.patchValue({ roleIds: [this.assignableRoles[0]._id] });
        }
      });

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
          tutorIds: u.tutorIds?.length ? [...u.tutorIds] : [],
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
          tutorIds: [],
        });
        this.form.get('email')?.enable();
      }
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
          tutorIds: value.tutorIds,
        },
      });
    } else {
      const createPayload: CreateUserDto = {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        roleIds: value.roleIds,
      };
      if (value.tutorIds.length > 0) {
        createPayload.tutorIds = value.tutorIds;
      }
      this.saveRequest.emit(createPayload);
    }
  }
}

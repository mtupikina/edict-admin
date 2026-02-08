import { Component, inject, input, output, model, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { User, UserRole } from '../models/user.model';
import { CreateUserDto, UpdateUserDto } from '../models/user.model';

const ROLES = [
  { label: 'Student', value: 'student' as UserRole },
  { label: 'Teacher', value: 'teacher' as UserRole },
  { label: 'Admin', value: 'admin' as UserRole },
];

export type UserFormSavePayload =
  | CreateUserDto
  | { id: string; dto: UpdateUserDto };

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
  ],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent {
  user = input<User | null>(null);
  visible = model<boolean>(false);
  saving = input<boolean>(false);
  saveRequest = output<UserFormSavePayload>();

  private readonly fb = inject(FormBuilder);
  readonly roles = ROLES;
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['student' as UserRole, Validators.required],
  });

  constructor() {
    effect(() => {
      this.visible(); // re-run when dialog opens/closes
      const u = this.user();
      if (u) {
        this.form.patchValue({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
        });
        this.form.get('email')?.disable();
      } else {
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          role: 'student' as UserRole,
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
          role: value.role,
        },
      });
    } else {
      this.saveRequest.emit({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        role: value.role,
      });
    }
  }
}

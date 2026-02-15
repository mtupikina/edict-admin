import { Component, input, output, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../models/role.model';
import { CreateRoleDto } from '../models/role.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './role-form-dialog.component.html',
})
export class RoleFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  visible = input.required<boolean>();
  editingRole = input<Role | null>(null);
  saving = input(false);

  visibleChange = output<boolean>();
  save = output<CreateRoleDto>();
  cancelDialog = output<void>();

  roleForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const role = this.editingRole();
      if (role) {
        this.roleForm.patchValue({
          name: role.name,
          description: role.description ?? '',
        });
      } else {
        this.roleForm.reset({ name: '', description: '' });
      }
    });
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  onSave(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.roleForm.getRawValue());
  }

  onCancelDialog(): void {
    this.cancelDialog.emit();
  }
}

import { Component, input, output, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Permission } from '../models/permission.model';
import { CreatePermissionDto } from '../models/permission.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-permission-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './permission-form-dialog.component.html',
})
export class PermissionFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  visible = input.required<boolean>();
  editingPermission = input<Permission | null>(null);
  saving = input(false);

  visibleChange = output<boolean>();
  save = output<CreatePermissionDto>();
  cancelDialog = output<void>();

  permissionForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const perm = this.editingPermission();
      if (perm) {
        this.permissionForm.patchValue({
          name: perm.name,
          description: perm.description ?? '',
        });
      } else {
        this.permissionForm.reset({ name: '', description: '' });
      }
    });
  }

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  onSave(): void {
    if (this.permissionForm.invalid) {
      this.permissionForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.permissionForm.getRawValue());
  }

  onCancelDialog(): void {
    this.cancelDialog.emit();
  }
}

import { Component, input, output } from '@angular/core';
import { Permission } from '../models/permission.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

export interface PermissionWithChecked extends Permission {
  checked: boolean;
}

@Component({
  selector: 'app-role-permissions-dialog',
  standalone: true,
  imports: [FormsModule, ButtonModule, DialogModule, CheckboxModule],
  templateUrl: './role-permissions-dialog.component.html',
})
export class RolePermissionsDialogComponent {
  visible = input.required<boolean>();
  roleName = input<string>('');
  permissions = input.required<PermissionWithChecked[]>();
  saving = input(false);

  visibleChange = output<boolean>();
  save = output<void>();
  cancelDialog = output<void>();
  togglePermission = output<{ permissionId: string; checked: boolean }>();

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }

  onToggle(permissionId: string, checked: boolean): void {
    this.togglePermission.emit({ permissionId, checked });
  }
}

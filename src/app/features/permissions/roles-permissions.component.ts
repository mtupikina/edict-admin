import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesCrudState } from './state/roles-crud.state';
import { PermissionsCrudState } from './state/permissions-crud.state';
import { RolePermissionsAssignmentState } from './state/role-permissions-assignment.state';
import { RolesTableComponent } from './roles-table/roles-table.component';
import { PermissionsTableComponent } from './permissions-table/permissions-table.component';
import { RoleFormDialogComponent } from './role-form-dialog/role-form-dialog.component';
import { PermissionFormDialogComponent } from './permission-form-dialog/permission-form-dialog.component';
import { RolePermissionsDialogComponent } from './role-permissions-dialog/role-permissions-dialog.component';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule,
    ConfirmDialogModule,
    ToastModule,
    RolesTableComponent,
    PermissionsTableComponent,
    RoleFormDialogComponent,
    PermissionFormDialogComponent,
    RolePermissionsDialogComponent,
  ],
  providers: [
    ConfirmationService,
    MessageService,
    RolesCrudState,
    PermissionsCrudState,
    RolePermissionsAssignmentState,
  ],
  templateUrl: './roles-permissions.component.html',
})
export class RolesPermissionsComponent {
  readonly rolesState = inject(RolesCrudState);
  readonly permissionsState = inject(PermissionsCrudState);
  readonly assignmentState = inject(RolePermissionsAssignmentState);
}

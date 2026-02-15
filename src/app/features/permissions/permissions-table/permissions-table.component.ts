import { Component, input, output } from '@angular/core';
import { Permission } from '../models/permission.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-permissions-table',
  standalone: true,
  imports: [ButtonModule, TableModule, TooltipModule],
  templateUrl: './permissions-table.component.html',
})
export class PermissionsTableComponent {
  permissions = input.required<Permission[]>();
  loading = input(false);

  addPermission = output<void>();
  editPermission = output<Permission>();
  deletePermission = output<{ perm: Permission; event: Event }>();
}

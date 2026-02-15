import { Component, input, output } from '@angular/core';
import { Role } from '../models/role.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-roles-table',
  standalone: true,
  imports: [ButtonModule, TableModule, TooltipModule],
  templateUrl: './roles-table.component.html',
})
export class RolesTableComponent {
  roles = input.required<Role[]>();
  loading = input(false);

  addRole = output<void>();
  editRole = output<Role>();
  managePermissions = output<Role>();
  deleteRole = output<{ role: Role; event: Event }>();
}

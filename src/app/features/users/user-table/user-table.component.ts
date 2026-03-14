import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../models/user.model';
import type { Role } from '../../permissions/models/role.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
  templateUrl: './user-table.component.html',
})
export class UserTableComponent {
  users = input.required<User[]>();
  loading = input<boolean>(false);
  editUser = output<User>();
  deleteUser = output<{ event: Event; user: User }>();

  /** Returns the user's roles for display (roleIds are populated as full role objects). */
  getRoles(user: User): Role[] {
    return user.roleIds ?? [];
  }

  onEdit(user: User): void {
    this.editUser.emit(user);
  }

  onDelete(event: Event, user: User): void {
    this.deleteUser.emit({ event, user });
  }
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../models/user.model';
import type { Role } from '../../permissions/models/role.model';
import { ROLE_NAMES } from '../../permissions/constants/role-names';

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

  /** Super admin rows are listed (e.g. as tutor options) but cannot be edited or deleted via this UI. */
  hasSuperAdminRole(user: User): boolean {
    return (user.roleIds ?? []).some((r) => r.name === ROLE_NAMES.SUPER_ADMIN);
  }

  /**
   * Resolves assigned tutor user ids to display labels using the current table data.
   * Tutors not present in the list (e.g. filtered server-side) show as "Unknown user".
   */
  tutorRowsFor(user: User): { tutorUserId: string; label: string }[] {
    const ids = user.tutorIds ?? [];
    const all = this.users();
    return ids.map((tutorUserId) => {
      const t = all.find((u) => u._id === tutorUserId);
      let label: string;
      if (t) {
        const name = `${t.firstName} ${t.lastName}`.trim();
        label = name.length > 0 ? name : t.email;
      } else {
        label = 'Unknown user';
      }
      return { tutorUserId, label };
    });
  }

  onEdit(user: User): void {
    this.editUser.emit(user);
  }

  onDelete(event: Event, user: User): void {
    this.deleteUser.emit({ event, user });
  }
}

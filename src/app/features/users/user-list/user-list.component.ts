import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../models/user.model';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserTableComponent } from '../user-table/user-table.component';
import { UserFormDialogComponent, UserFormSavePayload } from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    UserTableComponent,
    UserFormDialogComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  users: User[] = [];
  loading = false;
  dialogVisible = false;
  editingUser: User | null = null;
  saving = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
        });
      },
    });
  }

  openCreateDialog(): void {
    this.editingUser = null;
    this.dialogVisible = true;
  }

  openEditDialog(user: User): void {
    this.editingUser = user;
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
    this.editingUser = null;
  }

  onSave(payload: UserFormSavePayload): void {
    this.saving = true;
    if ('id' in payload) {
      this.userService.update(payload.id, payload.dto).subscribe({
        next: () => this.handleSaveSuccess('User updated'),
        error: (err) => this.handleSaveError(err),
      });
    } else {
      this.userService.create(payload).subscribe({
        next: () => this.handleSaveSuccess('User created'),
        error: (err) => this.handleSaveError(err),
      });
    }
  }

  private handleSaveSuccess(detail: string): void {
    this.saving = false;
    this.closeDialog();
    this.loadUsers();
    this.messageService.add({ severity: 'success', summary: 'Success', detail });
  }

  private handleSaveError(err: { error?: { message?: string } }): void {
    this.saving = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: err.error?.message ?? 'Request failed',
    });
  }

  confirmDelete(event: Event, user: User): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteUser(user),
    });
  }

  private deleteUser(user: User): void {
    this.userService.delete(user._id).subscribe({
      next: () => {
        this.loadUsers();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'Failed to delete user',
        });
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

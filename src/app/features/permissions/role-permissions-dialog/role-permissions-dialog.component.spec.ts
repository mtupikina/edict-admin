import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
  RolePermissionsDialogComponent,
  PermissionWithChecked,
} from './role-permissions-dialog.component';

const mockPermissions: PermissionWithChecked[] = [
  { _id: 'p1', name: 'words:read', checked: true },
  { _id: 'p2', name: 'words:write', checked: false },
];

describe('RolePermissionsDialogComponent', () => {
  let component: RolePermissionsDialogComponent;
  let fixture: ComponentFixture<RolePermissionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePermissionsDialogComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(RolePermissionsDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('roleName', 'admin');
    fixture.componentRef.setInput('permissions', mockPermissions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onVisibleChange emits value', () => {
    let received: boolean | undefined;
    component.visibleChange.subscribe((v) => (received = v));
    component.onVisibleChange(false);
    expect(received).toBe(false);
  });

  it('onToggle emits permissionId and checked', () => {
    let received: { permissionId: string; checked: boolean } | undefined;
    component.togglePermission.subscribe((p) => (received = p));
    component.onToggle('p1', false);
    expect(received).toEqual({ permissionId: 'p1', checked: false });
  });

  it('save output emits', () => {
    let emitted = false;
    component.save.subscribe(() => (emitted = true));
    component.save.emit();
    expect(emitted).toBe(true);
  });

  it('cancelDialog output emits', () => {
    let emitted = false;
    component.cancelDialog.subscribe(() => (emitted = true));
    component.cancelDialog.emit();
    expect(emitted).toBe(true);
  });
});

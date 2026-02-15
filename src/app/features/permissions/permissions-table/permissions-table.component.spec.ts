import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { PermissionsTableComponent } from './permissions-table.component';
import { Permission } from '../models/permission.model';

const mockPermissions: Permission[] = [
  { _id: '1', name: 'words:read', description: 'Read' },
];

describe('PermissionsTableComponent', () => {
  let component: PermissionsTableComponent;
  let fixture: ComponentFixture<PermissionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsTableComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('permissions', mockPermissions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required permissions input', () => {
    expect(component.permissions()).toEqual(mockPermissions);
  });

  it('addPermission output emits', () => {
    let emitted = false;
    component.addPermission.subscribe(() => (emitted = true));
    component.addPermission.emit();
    expect(emitted).toBe(true);
  });

  it('editPermission output emits permission', () => {
    let received: Permission | undefined;
    component.editPermission.subscribe((p) => (received = p));
    component.editPermission.emit(mockPermissions[0]);
    expect(received).toBe(mockPermissions[0]);
  });

  it('deletePermission output emits perm and event', () => {
    let payload: { perm: Permission; event: Event } | undefined;
    component.deletePermission.subscribe((p) => (payload = p));
    const ev = new Event('click');
    component.deletePermission.emit({ perm: mockPermissions[0], event: ev });
    expect(payload?.perm).toBe(mockPermissions[0]);
    expect(payload?.event).toBe(ev);
  });
});

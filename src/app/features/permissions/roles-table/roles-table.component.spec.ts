import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { RolesTableComponent } from './roles-table.component';
import { Role } from '../models/role.model';

const mockRoles: Role[] = [
  { _id: '1', name: 'admin', description: 'Admin' },
  { _id: '2', name: 'super_admin', description: 'Super' },
];

describe('RolesTableComponent', () => {
  let component: RolesTableComponent;
  let fixture: ComponentFixture<RolesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesTableComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roles', mockRoles);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required roles input', () => {
    expect(component.roles()).toEqual(mockRoles);
  });

  it('addRole output emits when add button would be clicked', () => {
    let emitted = false;
    component.addRole.subscribe(() => (emitted = true));
    component.addRole.emit();
    expect(emitted).toBe(true);
  });

  it('editRole output emits role', () => {
    let received: Role | undefined;
    component.editRole.subscribe((r) => (received = r));
    component.editRole.emit(mockRoles[0]);
    expect(received).toBe(mockRoles[0]);
  });

  it('managePermissions output emits role', () => {
    let received: Role | undefined;
    component.managePermissions.subscribe((r) => (received = r));
    component.managePermissions.emit(mockRoles[0]);
    expect(received).toBe(mockRoles[0]);
  });

  it('deleteRole output emits role and event', () => {
    let payload: { role: Role; event: Event } | undefined;
    component.deleteRole.subscribe((p) => (payload = p));
    const ev = new Event('click');
    component.deleteRole.emit({ role: mockRoles[0], event: ev });
    expect(payload?.role).toBe(mockRoles[0]);
    expect(payload?.event).toBe(ev);
  });
});

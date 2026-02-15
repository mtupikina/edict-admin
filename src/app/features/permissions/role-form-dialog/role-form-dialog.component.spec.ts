import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { RoleFormDialogComponent } from './role-form-dialog.component';

describe('RoleFormDialogComponent', () => {
  let component: RoleFormDialogComponent;
  let fixture: ComponentFixture<RoleFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFormDialogComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSave emits getRawValue when form valid', () => {
    component.roleForm.setValue({ name: 'editor', description: 'Desc' });
    let received: { name: string; description?: string } | undefined;
    component.save.subscribe((v) => (received = v));
    component.onSave();
    expect(received).toEqual({ name: 'editor', description: 'Desc' });
  });

  it('onSave does not emit when form invalid', () => {
    component.roleForm.setValue({ name: '', description: '' });
    let emitted = false;
    component.save.subscribe(() => (emitted = true));
    component.onSave();
    expect(emitted).toBe(false);
  });

  it('onCancelDialog emits cancelDialog', () => {
    let emitted = false;
    component.cancelDialog.subscribe(() => (emitted = true));
    component.onCancelDialog();
    expect(emitted).toBe(true);
  });

  it('onVisibleChange emits value', () => {
    let received: boolean | undefined;
    component.visibleChange.subscribe((v) => (received = v));
    component.onVisibleChange(false);
    expect(received).toBe(false);
  });

  it('effect patches form when editingRole input is set', () => {
    const role = { _id: '1', name: 'admin', description: 'Admin role' };
    fixture.componentRef.setInput('editingRole', role);
    fixture.detectChanges();
    expect(component.roleForm.get('name')?.value).toBe('admin');
    expect(component.roleForm.get('description')?.value).toBe('Admin role');
  });

  it('effect resets form when editingRole changes from role to null', () => {
    const role = { _id: '1', name: 'admin', description: 'Admin' };
    fixture.componentRef.setInput('editingRole', role);
    fixture.detectChanges();
    expect(component.roleForm.get('name')?.value).toBe('admin');
    fixture.componentRef.setInput('editingRole', null);
    fixture.detectChanges();
    expect(component.roleForm.get('name')?.value).toBe('');
    expect(component.roleForm.get('description')?.value).toBe('');
  });
});

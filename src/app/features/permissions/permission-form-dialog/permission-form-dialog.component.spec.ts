import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { PermissionFormDialogComponent } from './permission-form-dialog.component';

describe('PermissionFormDialogComponent', () => {
  let component: PermissionFormDialogComponent;
  let fixture: ComponentFixture<PermissionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionFormDialogComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSave emits getRawValue when form valid', () => {
    component.permissionForm.setValue({
      name: 'words:read',
      description: 'Desc',
    });
    let received: { name: string; description?: string } | undefined;
    component.save.subscribe((v) => (received = v));
    component.onSave();
    expect(received).toEqual({ name: 'words:read', description: 'Desc' });
  });

  it('onSave does not emit when form invalid', () => {
    component.permissionForm.setValue({ name: '', description: '' });
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

  it('effect patches form when editingPermission input is set', () => {
    const perm = {
      _id: 'p1',
      name: 'words:read',
      description: 'Read words',
    };
    fixture.componentRef.setInput('editingPermission', perm);
    fixture.detectChanges();
    expect(component.permissionForm.get('name')?.value).toBe('words:read');
    expect(component.permissionForm.get('description')?.value).toBe(
      'Read words'
    );
  });

  it('effect uses empty string when editingPermission has no description', () => {
    const perm = { _id: 'p1', name: 'words:write' };
    fixture.componentRef.setInput('editingPermission', perm);
    fixture.detectChanges();
    expect(component.permissionForm.get('description')?.value).toBe('');
  });

  it('effect resets form when editingPermission changes from perm to null', () => {
    const perm = {
      _id: 'p1',
      name: 'words:read',
      description: 'Read',
    };
    fixture.componentRef.setInput('editingPermission', perm);
    fixture.detectChanges();
    expect(component.permissionForm.get('name')?.value).toBe('words:read');
    fixture.componentRef.setInput('editingPermission', null);
    fixture.detectChanges();
    expect(component.permissionForm.get('name')?.value).toBe('');
    expect(component.permissionForm.get('description')?.value).toBe('');
  });

  it('onSave does not emit and leaves form touched when invalid', () => {
    component.permissionForm.setValue({ name: '', description: '' });
    let emitted = false;
    component.save.subscribe(() => (emitted = true));
    component.onSave();
    expect(emitted).toBe(false);
    expect(component.permissionForm.get('name')?.touched).toBe(true);
  });
});

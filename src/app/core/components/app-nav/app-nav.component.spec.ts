import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppNavComponent } from './app-nav.component';
import { AuthService } from '../../services/auth.service';

describe('AppNavComponent', () => {
  let component: AppNavComponent;
  let fixture: ComponentFixture<AppNavComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['logout']);
    await TestBed.configureTestingModule({
      imports: [AppNavComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return active class when router url matches path', () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/users');
    expect(component.navLinkClass('/users')).toContain('bg-primary-100');
    expect(component.navLinkClass('/users')).toContain('text-primary-700');
  });

  it('should return active class when router url starts with path and slash', () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/users/123');
    expect(component.navLinkClass('/users')).toContain('bg-primary-100');
  });

  it('should return inactive class when router url does not match path', () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/permissions');
    expect(component.navLinkClass('/users')).toContain('text-slate-600');
  });

  it('logout should call authService.logout', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should have links to Users and Roles & Permissions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map((a) => a.getAttribute('routerLink'));
    expect(hrefs).toContain('/users');
    expect(hrefs).toContain('/permissions');
  });
});

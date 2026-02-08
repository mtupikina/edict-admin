import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard, loggedInGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

const StubComponent = Component({ standalone: true, template: '' })(class {});

function runGuard(guard: typeof authGuard, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  return TestBed.runInInjectionContext(() => guard(route, state));
}

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/users' } as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authService.isAuthenticated.and.returnValue(false);
    TestBed.configureTestingModule({
      imports: [StubComponent],
      providers: [
        provideRouter([{ path: 'users', component: StubComponent }, { path: '', component: StubComponent }]),
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  it('returns true when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    const result = runGuard(authGuard, route, state);
    expect(result).toBe(true);
  });

  it('returns UrlTree to / when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    const result = runGuard(authGuard, route, state) as UrlTree;
    expect(result).toBeTruthy();
    expect(result.toString()).toContain('/');
  });
});

describe('loggedInGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/' } as RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    authService.isAuthenticated.and.returnValue(false);
    TestBed.configureTestingModule({
      imports: [StubComponent],
      providers: [
        provideRouter([{ path: '', component: StubComponent }, { path: 'users', component: StubComponent }]),
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  it('returns true when not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    const result = runGuard(loggedInGuard, route, state);
    expect(result).toBe(true);
  });

  it('returns UrlTree to /users when authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    const result = runGuard(loggedInGuard, route, state) as UrlTree;
    expect(result).toBeTruthy();
    expect(result.toString()).toContain('users');
  });
});

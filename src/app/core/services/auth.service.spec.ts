import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getToken returns null when no token stored', () => {
    service.clearToken();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('setToken stores token and isAuthenticated becomes true', () => {
    service.setToken('abc');
    expect(service.getToken()).toBe('abc');
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('edict_admin_token')).toBe('abc');
  });

  it('clearToken removes token', () => {
    service.setToken('abc');
    service.clearToken();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('edict_admin_token')).toBeNull();
  });

  it('logout clears token, calls api, and navigates to /', () => {
    service.setToken('abc');
    service.logout();
    expect(service.getToken()).toBeNull();
    const req = httpMock.expectOne('http://localhost:3000/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('logout when no token still navigates to /', () => {
    service.clearToken();
    service.logout();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    httpMock.expectNone('http://localhost:3000/auth/logout');
  });
});

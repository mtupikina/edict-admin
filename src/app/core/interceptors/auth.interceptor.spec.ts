import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let passedReq: HttpRequest<unknown> | null;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getToken', 'clearToken']);
    passedReq = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  const next: HttpHandlerFn = (req) => {
    passedReq = req;
    return of(new HttpResponse({ body: null }));
  };

  it('adds Authorization header when token exists and url is api', (done) => {
    authService.getToken.and.returnValue('token123');
    const req = new HttpRequest('GET', 'http://localhost:3000/users');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(passedReq!.headers.get('Authorization')).toBe('Bearer token123');
        done();
      });
    });
  });

  it('does not add header when no token', (done) => {
    authService.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', 'http://localhost:3000/users');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(passedReq!.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  it('does not add header when url does not start with apiUrl', (done) => {
    authService.getToken.and.returnValue('token123');
    const req = new HttpRequest('GET', 'https://other.com/api');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(passedReq!.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  it('on 401 clears token and navigates to /', (done) => {
    authService.getToken.and.returnValue('token123');
    const req = new HttpRequest('GET', 'http://localhost:3000/users');
    const nextWith401: HttpHandlerFn = () =>
      throwError(() => ({ status: 401, message: 'Unauthorized' }));
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, nextWith401).subscribe({
        next: () => done.fail('expected stream to complete'),
        error: () => done.fail('expected no error'),
        complete: () => {
          expect(authService.clearToken).toHaveBeenCalled();
          done();
        },
      });
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';

import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '../../../core/services/auth.service';

describe('AuthCallbackComponent', () => {
  let component: AuthCallbackComponent;
  let fixture: ComponentFixture<AuthCallbackComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['setToken']);
    await TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(AuthCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('with token sets token and navigates to /users', () => {
    TestBed.resetTestingModule();
    const route = { snapshot: { queryParamMap: { get: (k: string) => (k === 'token' ? 'jwt123' : null) } } };
    TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const f = TestBed.createComponent(AuthCallbackComponent);
    f.detectChanges();
    expect(authService.setToken).toHaveBeenCalledWith('jwt123');
    expect(navSpy).toHaveBeenCalledWith(['/users']);
  });

  it('with error=unauthorized navigates to / with query', () => {
    TestBed.resetTestingModule();
    const route = { snapshot: { queryParamMap: { get: (k: string) => (k === 'error' ? 'unauthorized' : null) } } };
    TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const f = TestBed.createComponent(AuthCallbackComponent);
    f.detectChanges();
    expect(navSpy).toHaveBeenCalledWith(['/'], { queryParams: { error: 'unauthorized' } });
  });

  it('with no token navigates to /', () => {
    TestBed.resetTestingModule();
    const route = { snapshot: { queryParamMap: { get: () => null } } };
    TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const f = TestBed.createComponent(AuthCallbackComponent);
    f.detectChanges();
    expect(navSpy).toHaveBeenCalledWith(['/']);
  });
});

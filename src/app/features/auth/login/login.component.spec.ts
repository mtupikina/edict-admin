import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['loginWithGoogle']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideAnimations(),
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('showAccessDenied is false when no error query', () => {
    expect(component.showAccessDenied).toBe(false);
  });

  it('showAccessDenied is true and navigates when error=unauthorized', async () => {
    TestBed.resetTestingModule();
    const route = { snapshot: { queryParamMap: { get: (k: string) => (k === 'error' ? 'unauthorized' : null) } } };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideAnimations(),
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    expect(f.componentInstance.showAccessDenied).toBe(true);
    expect(navSpy).toHaveBeenCalledWith([], { queryParams: {}, replaceUrl: true });
  });

  it('login calls authService.loginWithGoogle', () => {
    component.login();
    expect(authService.loginWithGoogle).toHaveBeenCalled();
  });
});

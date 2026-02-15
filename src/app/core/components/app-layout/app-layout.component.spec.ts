import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppLayoutComponent } from './app-layout.component';

describe('AppLayoutComponent', () => {
  let fixture: ComponentFixture<AppLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayoutComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayoutComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render app-app-nav', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-app-nav')).toBeTruthy();
  });

  it('should contain a main element with router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const main = compiled.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.querySelector('router-outlet')).toBeTruthy();
  });
});

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

const NAV_LINK_BASE =
  'px-3 py-2 rounded-lg font-medium transition-colors';
const NAV_LINK_INACTIVE =
  'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
const NAV_LINK_ACTIVE = 'bg-primary-100 text-primary-700 font-semibold';

@Component({
  selector: 'app-app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './app-nav.component.html',
})
export class AppNavComponent {
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);

  navLinkClass(path: string): string {
    const active = this.router.url === path || this.router.url.startsWith(path + '/');
    return `${NAV_LINK_BASE} ${active ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}`;
  }

  logout(): void {
    this.authService.logout();
  }
}

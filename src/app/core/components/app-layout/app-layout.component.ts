import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppNavComponent } from '../app-nav/app-nav.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, AppNavComponent, RouterOutlet],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {}

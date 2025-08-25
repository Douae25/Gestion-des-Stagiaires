import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminNavbarComponent } from './admin-navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'admin-main',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AdminNavbarComponent, RouterOutlet],
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.scss']
})
export class AdminMainComponent {}

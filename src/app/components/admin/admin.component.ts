import { Component } from '@angular/core';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminNavbarComponent } from './admin-navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminSidebarComponent, AdminNavbarComponent, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-rh-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],  // ✅ ajouter RouterModule
  templateUrl: './rh-sidebar.component.html',
  styleUrls: ['./rh-sidebar.component.scss']
})
export class RhSidebarComponent {
  constructor(private router: Router) {}

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}

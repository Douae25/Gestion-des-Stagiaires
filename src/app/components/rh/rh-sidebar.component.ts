
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rh-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rh-sidebar.component.html',
  styleUrls: ['./rh-sidebar.component.scss']
})
export class RhSidebarComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}

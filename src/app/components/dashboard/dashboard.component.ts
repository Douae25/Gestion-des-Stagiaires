import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatToolbarModule]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Rediriger vers le dashboard spécifique au rôle
        this.redirectToRoleDashboard(user.role);
      }
    });
  }

  private redirectToRoleDashboard(role: string): void {
    switch (role) {
      case 'stagiaire':
        this.router.navigate(['/stagiaire/dashboard']);
        break;
      case 'rh':
        this.router.navigate(['/rh/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'encadrant':
        this.router.navigate(['/encadrant/dashboard']);
        break;
      default:
        // Rester sur ce dashboard si le rôle n'est pas reconnu
        break;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  goToLanding(): void {
    this.router.navigate(['/']);
  }
}


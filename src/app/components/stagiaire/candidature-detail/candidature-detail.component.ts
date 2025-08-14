import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-candidature-detail',
  template: `
    <div class="candidature-detail-container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span>Détail de la candidature</span>
      </mat-toolbar>
      
      <div class="content">
        <mat-card>
          <mat-card-content>
            <h2>Candidature #{{ candidatureId }}</h2>
            <p>Détails de la candidature à implémenter...</p>
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Retour aux candidatures
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .candidature-detail-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .content {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatToolbarModule]
})
export class CandidatureDetailComponent implements OnInit {
  candidatureId: string | null = null;
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.candidatureId = this.route.snapshot.paramMap.get('id');
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user || user.role !== 'stagiaire') {
        this.router.navigate(['/login']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/candidatures']);
  }
}

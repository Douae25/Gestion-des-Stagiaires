import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { OffreStageService } from '../../services/offre-stage.service';
import { OffreStage } from '../../models/offre-stage';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class LandingComponent implements OnInit, AfterViewInit {
  offres: OffreStage[] = [];
  loading = false;
  error: string | null = null;
  isMenuOpen = false; // Pour le menu mobile

  constructor(
    private offreStageService: OffreStageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOffres();
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.checkScrollReveal();
    this.handleNavbarScroll();
  }

  // Méthodes pour la navbar
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    this.closeMenu(); // Ferme le menu mobile
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  handleNavbarScroll(): void {
    const navbar = document.querySelector('.navbar') as HTMLElement;
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  onLoginClick(): void {
    console.log('Connexion clicked - Navigation vers /login');
    try {
      this.router.navigate(['/login']).then(success => {
        if (success) {
          console.log('Navigation vers /login réussie');
        } else {
          console.error('Navigation vers /login échouée');
        }
      }).catch(error => {
        console.error('Erreur lors de la navigation vers /login:', error);
      });
    } catch (error) {
      console.error('Erreur dans onLoginClick:', error);
    }
  }

  onRegisterClick(): void {
    console.log('Inscription clicked - Navigation vers /register');
    try {
      this.router.navigate(['/register']).then(success => {
        if (success) {
          console.log('Navigation vers /register réussie');
        } else {
          console.error('Navigation vers /register échouée');
        }
      }).catch(error => {
        console.error('Erreur lors de la navigation vers /register:', error);
      });
    } catch (error) {
      console.error('Erreur dans onRegisterClick:', error);
    }
  }

  private initScrollAnimations(): void {
    // Initial check for elements in viewport
    setTimeout(() => {
      this.checkScrollReveal();
    }, 100);
  }

  private checkScrollReveal(): void {
    const elements = document.querySelectorAll('.scroll-reveal');
    
    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }

  loadOffres(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Chargement des 5 premières offres actives...');
    
    // Utiliser la méthode simplifiée pour récupérer les 5 premières offres actives
    this.offreStageService.getOffresActives().subscribe({
      next: (offres) => {
        console.log('Offres chargées avec succès:', offres);
        this.offres = offres;
        this.loading = false;
        
        if (offres.length === 0) {
          console.log('Aucune offre active trouvée');
          this.snackBar.open('Aucune offre active disponible pour le moment', 'Fermer', {
            duration: 5000,
            panelClass: ['info-snackbar']
          });
        } else {
          this.snackBar.open(`${offres.length} offre(s) chargée(s) avec succès`, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des offres:', error);
        
        this.error = error.message || 'Impossible de charger les offres';
        this.loading = false;
        
        this.snackBar.open('Erreur lors du chargement des offres', 'Fermer', {
          duration: 10000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  voirToutesLesOffres(): void {
    // Navigation vers la page de toutes les offres
    console.log('Navigation vers toutes les offres');
  }

  onSearch(): void {
    // Logique de recherche
    console.log('Recherche lancée');
  }

  onCtaClick(): void {
    // Action pour le bouton CTA
    console.log('CTA clicked');
  }

  onContactClick(): void {
    // Action pour le bouton de contact
    console.log('Contact clicked');
  }

  // Méthode pour obtenir le label du statut
  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'en_cours':
        return 'Ouvert aux candidatures';
      case 'fermee':
        return 'Offre fermée';
      case 'archivee':
        return 'Offre archivée';
      default:
        return statut;
    }
  }

  // Méthode pour vérifier si l'offre est active
  isOffreActive(statut: string): boolean {
    return statut === 'en_cours';
  }
}

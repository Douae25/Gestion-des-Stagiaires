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
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

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
    MatDialogModule,
    MatMenuModule,
    MatDividerModule
  ]
})
export class LandingComponent implements OnInit, AfterViewInit {
  offres: OffreStage[] = [];
  loading = false;
  error: string | null = null;
  isMenuOpen = false; // Pour le menu mobile
  currentUser: User | null = null;
  isAuthenticated = false;

  constructor(
    private offreStageService: OffreStageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier l'état d'authentification
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
    
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
    // Vérifier si le stagiaire est connecté avant d'accéder aux offres
    if (!this.isAuthenticated) {
      this.snackBar.open('Vous devez vous connecter pour consulter toutes les offres', 'Se connecter', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/offres' } });
      });
      return;
    }
    
    // Navigation vers la page de toutes les offres
    this.router.navigate(['/offres']);
  }

  // Méthode pour consulter une offre spécifique
  consulterOffre(offre: OffreStage): void {
    if (!this.isAuthenticated) {
      this.snackBar.open('Vous devez vous connecter pour consulter cette offre', 'Se connecter', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: `/offres/${offre.id}` } });
      });
      return;
    }
    
    // Navigation vers le détail de l'offre
    this.router.navigate(['/offres', offre.id]);
  }

  // Méthode pour postuler à une offre
  postulerOffre(offre: OffreStage): void {
    // Vérifier d'abord si l'offre est active
    if (offre.statut !== 'en_cours') {
      this.snackBar.open('Cette offre n\'est plus disponible pour les candidatures', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Vérifier si l'utilisateur est connecté
    if (!this.isAuthenticated) {
      // Redirection directe vers la page de login
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: `/candidature/${offre.id}`,
          offre: JSON.stringify({
            id: offre.id,
            titre: offre.titre,
            entreprise: offre.entreprise?.nom || 'Entreprise',
            localisation: offre.localisation || 'Non spécifiée'
          })
        } 
      });
      return;
    }

    // Vérifier si l'utilisateur est un stagiaire
    if (this.currentUser?.role !== 'stagiaire') {
      this.snackBar.open('Seuls les stagiaires peuvent postuler aux offres', 'Fermer', {
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Si tout est ok, rediriger vers le formulaire de candidature
    // TODO: À implémenter - pour l'instant on affiche un message
    this.snackBar.open(`Candidature pour "${offre.titre}" - Formulaire à implémenter`, 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
    
    // Dans le futur, on redirigera vers :
    // this.router.navigate(['/candidature', offre.id]);
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

  // Méthodes d'authentification
  goToDashboard(): void {
    if (this.currentUser) {
      switch (this.currentUser.role) {
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
          this.router.navigate(['/']);
      }
    }
  }

  goToProfile(): void {
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case 'stagiaire':
          this.router.navigate(['/stagiaire/profile']);
          break;
        case 'rh':
          this.router.navigate(['/rh/profile']);
          break;
        case 'admin':
          this.router.navigate(['/admin/profile']);
          break;
        case 'encadrant':
          this.router.navigate(['/encadrant/profile']);
          break;
        default:
          this.router.navigate(['/']);
      }
    }
  }

  logout(): void {
    this.authService.logout();
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

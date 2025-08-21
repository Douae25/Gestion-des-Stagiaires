import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffreStageService } from '../../../services/offre-stage.service';
import { AuthService } from '../../../services/auth.service';
import { StagiaireService } from '../../../services/stagiaire.service';

// Interfaces pour la structure de données
interface UtilisateurInfo {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  numero_telephone: string;
  type: string;
  statut: string;
}

interface OffreInfo {
  id: number;
  id_rh: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  duree: number;
  statut: string;
  localisation: string;
  competence_requise: string;
  date_publication: string;
  duree_candidature: number;
  nombre_limite_candidature: number;
  rh_info: UtilisateurInfo;
}

interface Candidature {
  id: number;
  id_stagiaire: number;
  id_utilisateur: number;
  id_offre: number;
  statut: string;
  date_soumission: string;
  date_acceptation: string | null;
  cv: string | null;
  lettre_motivation: string | null;
  convention_stage: string | null;
  convention_signee: string | null;
  attestation: string | null;
  id_encadrant: number | null;
  stagiaire_info: UtilisateurInfo;
  encadrant_info: UtilisateurInfo | null;
  rh_info: UtilisateurInfo;
  offre_info: OffreInfo;
}

// Nouvelles interfaces pour les encadrants
interface Encadrant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  departement: string;
  specialite?: string;
}

interface Departement {
  nom: string;
  count: number;
}

@Component({
  selector: 'app-rh-candidatures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rh-candidatures.component.html',
  styleUrls: ['./rh-candidatures.component.scss']
})
export class RhCandidaturesComponent implements OnInit {
  offresTraitement: any[] = [];
  candidatures: Candidature[] = [];
  selectedOffre: any = null;
  showCandidaturesModal = false;
  loading = false;
  candidaturesLoading = false;
  error = '';
  candidaturesError = '';
  sortAscending = true; // true = plus anciens en premier (par défaut)

  // Nouvelles propriétés pour l'affectation d'encadrant
  showEncadrantModal = false;
  selectedCandidature: Candidature | null = null;
  encadrants: Encadrant[] = [];
  departements: Departement[] = [];
  selectedDepartement = '';
  selectedEncadrant = '';
  encadrantsLoading = false;
  encadrantError = '';
  filteredEncadrants: Encadrant[] = [];

  constructor(
    private offreService: OffreStageService,
    private authService: AuthService,
    private stagiaireService: StagiaireService
  ) {}

  ngOnInit() {
    this.loadOffresTraitement();
    this.loadEncadrants();
  }

  loadOffresTraitement() {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    this.offreService.getOffresForTraitement(currentUser.id).subscribe({
      next: (data: any[]) => {
        console.log('Offres pour traitement reçues:', data);
        this.offresTraitement = data;
        this.sortOffres();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des offres:', error);
        this.error = 'Erreur lors du chargement des offres';
        this.loading = false;
      }
    });
  }

  // Charger la liste des encadrants
  loadEncadrants() {
    this.encadrantsLoading = true;
    this.encadrantError = '';

    this.stagiaireService.getEncadrants().subscribe({
      next: (data: any[]) => {
        // Adapter la structure reçue de l'API à celle attendue par le template
        this.encadrants = data.map(e => ({
          id: e.id,
          nom: e.utilisateur?.nom || '',
          prenom: e.utilisateur?.prenom || '',
          email: e.utilisateur?.email || '',
          departement: e.departement || ''
        }));
        this.filteredEncadrants = [...this.encadrants];
        this.generateDepartements();
        this.encadrantsLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des encadrants:', error);
        this.encadrantError = 'Erreur lors du chargement des encadrants';
        this.encadrantsLoading = false;
        // Données de démonstration en cas d'erreur API
        this.encadrants = [
          { id: 1, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@company.com', departement: 'Développement' },
          { id: 2, nom: 'Dubois', prenom: 'Pierre', email: 'pierre.dubois@company.com', departement: 'Marketing' },
          { id: 3, nom: 'Leclerc', prenom: 'Marie', email: 'marie.leclerc@company.com', departement: 'Data Science' },
          { id: 4, nom: 'Moreau', prenom: 'Laurent', email: 'laurent.moreau@company.com', departement: 'Design' },
          { id: 5, nom: 'Bernard', prenom: 'Alice', email: 'alice.bernard@company.com', departement: 'Développement' },
          { id: 6, nom: 'Petit', prenom: 'Thomas', email: 'thomas.petit@company.com', departement: 'Marketing' }
        ];
        this.filteredEncadrants = [...this.encadrants];
        this.generateDepartements();
      }
    });
  }

  // Générer la liste des départements à partir des encadrants
  generateDepartements() {
    const deptMap = new Map<string, number>();
    
    this.encadrants.forEach(encadrant => {
      const dept = encadrant.departement;
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });

    this.departements = Array.from(deptMap.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }

  // Filtrer les encadrants par département
  onDepartementChange() {
    if (this.selectedDepartement === '') {
      this.filteredEncadrants = [...this.encadrants];
    } else {
      this.filteredEncadrants = this.encadrants.filter(
        encadrant => encadrant.departement === this.selectedDepartement
      );
    }
    
    // Réinitialiser la sélection d'encadrant si elle n'est plus valide
    const encadrantValide = this.filteredEncadrants.find(e => e.id.toString() === this.selectedEncadrant);
    if (!encadrantValide) {
      this.selectedEncadrant = '';
    }
  }

  sortOffres() {
    this.offresTraitement.sort((a, b) => {
      const dateA = new Date(a.date_publication).getTime();
      const dateB = new Date(b.date_publication).getTime();
      
      if (this.sortAscending) {
        return dateA - dateB; // Plus anciens en premier
      } else {
        return dateB - dateA; // Plus récents en premier
      }
    });
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortOffres();
  }

  getSortIcon(): string {
    return this.sortAscending ? 'arrow_upward' : 'arrow_downward';
  }

  getSortText(): string {
    return this.sortAscending ? 'Plus anciens en premier' : 'Plus récents en premier';
  }

  afficherCandidatures(offre: any) {
    console.log('Afficher candidatures pour offre:', offre);
    this.selectedOffre = offre;
    this.showCandidaturesModal = true;
    this.loadCandidatures(offre.id);
  }

  loadCandidatures(idOffre: number) {
    this.candidaturesLoading = true;
    this.candidaturesError = '';
    this.candidatures = [];

    this.stagiaireService.getCandidaturesByOffre(idOffre).subscribe({
      next: (data: any[]) => {
        console.log('Candidatures reçues:', data);
        this.candidatures = data;
        this.candidaturesLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des candidatures:', error);
        this.candidaturesError = 'Erreur lors du chargement des candidatures';
        this.candidaturesLoading = false;
      }
    });
  }

  closeCandidaturesModal() {
    this.showCandidaturesModal = false;
    this.selectedOffre = null;
    this.candidatures = [];
    this.candidaturesError = '';
  }

  accepterCandidature(candidature: Candidature) {
    console.log('Accepter candidature:', candidature);
    const nomComplet = `${candidature.stagiaire_info?.prenom} ${candidature.stagiaire_info?.nom}`;
    
    if (confirm(`Êtes-vous sûr de vouloir accepter la candidature de ${nomComplet} ?\n\nATTENTION: Les autres candidatures pour cette offre seront automatiquement refusées.`)) {
      // Appeler l'API pour accepter la candidature
      this.stagiaireService.accepterCandidature(candidature.id).subscribe({
        next: (response) => {
          console.log('✅ Candidature acceptée avec succès:', response);
          
          // Afficher un message de succès avec style vert
          this.showNotification(
            `✅ Candidature acceptée avec succès !`,
            `La candidature de ${nomComplet} a été acceptée pour l'offre "${this.selectedOffre?.titre}".`,
            'success'
          );
          
          // Vérifier s'il y a d'autres candidatures qui ont été refusées
          const autresCandidatures = this.candidatures.filter(c => c.id !== candidature.id && c.statut === 'en_attente');
          if (autresCandidatures.length > 0) {
            // Afficher un message d'information pour les candidatures refusées
            setTimeout(() => {
              this.showNotification(
                `ℹ️ Autres candidatures automatiquement refusées`,
                `${autresCandidatures.length} autre(s) candidature(s) ont été automatiquement refusées pour cette offre.`,
                'info'
              );
            }, 2000); // Afficher après 2 secondes
          }
          
          // Ouvrir le modal d'affectation d'encadrant
          this.ouvrirModalEncadrant(candidature);
          
          // Recharger les candidatures pour mettre à jour l'affichage
          this.loadCandidatures(candidature.id_offre);
        },
        error: (error) => {
          console.error('❌ Erreur complète lors de l\'acceptation:', error);
          console.error('Status de l\'erreur:', error.status);
          console.error('Message de l\'erreur:', error.message);
          console.error('Corps de l\'erreur:', error.error);
          
          // Message d'erreur plus détaillé pour le debug
          let errorMessage = `Une erreur s'est produite lors de l'acceptation de la candidature de ${nomComplet}.`;
          
          if (error.status) {
            errorMessage += ` (Status: ${error.status})`;
          }
          
          if (error.error && typeof error.error === 'string') {
            errorMessage += ` Détail: ${error.error}`;
          } else if (error.message) {
            errorMessage += ` Détail: ${error.message}`;
          }
          
          this.showNotification(
            `❌ Erreur lors de l'acceptation`,
            errorMessage,
            'error'
          );
          
          // En cas d'erreur, on recharge quand même pour vérifier l'état réel
          console.log('🔄 Rechargement des candidatures pour vérifier l\'état réel...');
          setTimeout(() => {
            this.loadCandidatures(candidature.id_offre);
          }, 1000);
        }
      });
    }
  }

  // Ouvrir le modal d'affectation d'encadrant
  ouvrirModalEncadrant(candidature: Candidature) {
    this.selectedCandidature = candidature;
    this.selectedDepartement = '';
    this.selectedEncadrant = '';
    this.filteredEncadrants = [...this.encadrants];
    this.showEncadrantModal = true;
  }

  // Fermer le modal d'affectation d'encadrant
  fermerModalEncadrant() {
    this.showEncadrantModal = false;
    this.selectedCandidature = null;
    this.selectedDepartement = '';
    this.selectedEncadrant = '';
    this.encadrantError = '';
  }

  // Affecter l'encadrant sélectionné
  affecterEncadrant() {
    if (!this.selectedCandidature || !this.selectedEncadrant) {
      this.encadrantError = 'Veuillez sélectionner un encadrant';
      return;
    }

    const encadrantSelectionne = this.filteredEncadrants.find(e => e.id.toString() === this.selectedEncadrant);
    if (!encadrantSelectionne) {
      this.encadrantError = 'Encadrant sélectionné non valide';
      return;
    }

    console.log('Affectation encadrant:', encadrantSelectionne, 'à candidature:', this.selectedCandidature.id);

    this.stagiaireService.affecterEncadrant(this.selectedCandidature.id, encadrantSelectionne.id).subscribe({
      next: (response) => {
        console.log('✅ Encadrant affecté avec succès:', response);
        
        const nomStagiaire = `${this.selectedCandidature?.stagiaire_info?.prenom} ${this.selectedCandidature?.stagiaire_info?.nom}`;
        const nomEncadrant = `${encadrantSelectionne.prenom} ${encadrantSelectionne.nom}`;
        
        this.showNotification(
          `✅ Encadrant affecté avec succès !`,
          `${nomEncadrant} a été affecté comme encadrant de ${nomStagiaire}.`,
          'success'
        );
        
        // Fermer le modal
        this.fermerModalEncadrant();
        
        // Recharger les candidatures pour mettre à jour l'affichage
        if (this.selectedCandidature) {
          this.loadCandidatures(this.selectedCandidature.id_offre);
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'affectation de l\'encadrant:', error);
        
        let errorMessage = 'Erreur lors de l\'affectation de l\'encadrant';
        if (error.status === 404) {
          errorMessage = 'Candidature ou encadrant non trouvé';
        } else if (error.status === 400) {
          errorMessage = 'Données d\'affectation invalides';
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        this.encadrantError = errorMessage;
      }
    });
  }

  // Méthode utilitaire pour afficher les notifications
  private showNotification(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') {
    // Créer un élément de notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Ajouter les styles CSS inline
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 500px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `;
    
    // Couleurs selon le type
    if (type === 'success') {
      notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      notification.style.color = 'white';
    } else if (type === 'error') {
      notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      notification.style.color = 'white';
    } else if (type === 'info') {
      notification.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      notification.style.color = 'white';
    } else if (type === 'warning') {
      notification.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      notification.style.color = 'white';
    }
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .notification h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }
      .notification p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }
      .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.7;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .notification-close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    
    // Ajouter la notification au DOM
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Méthodes pour le téléchargement des fichiers base64
  downloadCV(candidature: Candidature) {
    if (!candidature.cv) {
      alert('Aucun CV disponible pour ce candidat');
      return;
    }
    
    const nomFichier = `CV_${candidature.stagiaire_info?.prenom}_${candidature.stagiaire_info?.nom}.pdf`;
    this.downloadBase64File(candidature.cv, nomFichier, 'application/pdf');
  }

  downloadLettreMotivation(candidature: Candidature) {
    if (!candidature.lettre_motivation) {
      alert('Aucune lettre de motivation disponible pour ce candidat');
      return;
    }
    
    const nomFichier = `Lettre_${candidature.stagiaire_info?.prenom}_${candidature.stagiaire_info?.nom}.pdf`;
    this.downloadBase64File(candidature.lettre_motivation, nomFichier, 'application/pdf');
  }

  private downloadBase64File(base64Data: string, fileName: string, mimeType: string) {
    try {
      // Nettoyer le base64 (enlever le préfixe data:...; si présent)
      let base64Clean = base64Data;
      if (base64Data.includes(',')) {
        base64Clean = base64Data.split(',')[1];
      }

      // Convertir base64 en bytes
      const byteCharacters = atob(base64Clean);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Créer le blob
      const blob = new Blob([byteArray], { type: mimeType });

      // Créer l'URL de téléchargement
      const url = window.URL.createObjectURL(blob);

      // Créer un lien temporaire pour télécharger
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  }

  calculateDurationInMonths(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    const months = (fin.getFullYear() - debut.getFullYear()) * 12 + 
                  (fin.getMonth() - debut.getMonth());
    
    // Ajuster pour les jours
    if (fin.getDate() < debut.getDate()) {
      return Math.max(0, months - 1);
    }
    
    return Math.max(0, months);
  }

  getCompetencesList(competences: string): string[] {
    if (!competences) return [];
    
    // Séparer par virgule et nettoyer chaque compétence
    return competences.split(',')
      .map(comp => comp.trim())
      .filter(comp => comp.length > 0);
  }
}

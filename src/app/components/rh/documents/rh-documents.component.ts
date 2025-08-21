import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffreStageService } from '../../../services/offre-stage.service';
import { AuthService } from '../../../services/auth.service';
import { StagiaireService } from '../../../services/stagiaire.service';

// Interfaces pour les documents
interface Convention {
  id: number;
  id_stagiaire: number;
  nom_stagiaire: string;
  prenom_stagiaire: string;
  email_stagiaire: string;
  titre_stage: string;
  date_debut: string;
  date_fin: string;
  encadrant?: {
    nom: string;
    prenom: string;
    departement: string;
  };
  convention_deposee: boolean;
  convention_signee?: boolean;
  uploading?: boolean;
  convention_base64?: string | null;
  message_success?: string;
}

interface Attestation {
  id: number;
  id_stagiaire: number;
  nom_stagiaire: string;
  prenom_stagiaire: string;
  email_stagiaire: string;
  rapport_final?: boolean;
  date_soumission_rapport?: string;
  encadrant?: {
    nom: string;
    prenom: string;
    departement: string;
  };
  note?: number;
  commentaire?: string;
  attestation_envoyee?: boolean;
  generating?: boolean;
  rapport_final_document?: string;
  rapport_final_titre?: string;
}

@Component({
  selector: 'app-rh-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rh-documents.component.html',
  styleUrls: ['./rh-documents.component.scss']
})
export class RhDocumentsComponent implements OnInit {
  // Navigation
  activeTab: 'conventions' | 'attestations' = 'conventions';
  
  // Données
  conventions: Convention[] = [];
  attestations: Attestation[] = [];
  
  // Compteurs
  conventionsCount = 0;
  attestationsCount = 0;

  constructor(
    private offreService: OffreStageService,
    private authService: AuthService,
    private stagiaireService: StagiaireService
  ) {}

  ngOnInit() {
    this.loadConventions();
    this.loadAttestations();
  }

  // Navigation entre les onglets
  setActiveTab(tab: 'conventions' | 'attestations') {
    this.activeTab = tab;
  }

  // Charger les conventions à signer
  loadConventions() {
    // Appel API pour conventions à signer
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.conventions = [];
      this.conventionsCount = 0;
      return;
    }
    this.offreService.getConventionsNonSignees(currentUser.id).subscribe({
      next: (data: any[]) => {
        this.conventions = data.map(item => ({
          id: item.id,
          id_stagiaire: item.id_stagiaire,
          nom_stagiaire: item.stagiaire_info?.nom || '',
          prenom_stagiaire: item.stagiaire_info?.prenom || '',
          email_stagiaire: item.stagiaire_info?.email || '',
          titre_stage: item.offre_info?.titre || '',
          date_debut: item.offre_info?.date_debut || '',
          date_fin: item.offre_info?.date_fin || '',
          encadrant: item.encadrant_info ? {
            nom: item.encadrant_info.nom,
            prenom: item.encadrant_info.prenom,
            departement: item.encadrant_info.departement || ''
          } : undefined,
          convention_deposee: !!item.convention_stage,
          convention_signee: !!item.convention_signee,
          convention_base64: item.convention_stage || null
        }));
        this.conventionsCount = this.conventions.length;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des conventions non signées:', error);
        this.conventions = [];
        this.conventionsCount = 0;
      }
    });
  }

  // Charger les attestations à délivrer
  loadAttestations() {
    // Récupérer l'id RH courant
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.attestations = [];
      this.attestationsCount = 0;
      return;
    }
    this.offreService.getAttestationsFinaliseesRh(currentUser.id).subscribe({
      next: (data: any[]) => {
        // Mapper la structure API vers le modèle Attestation
        this.attestations = data.map(item => ({
          id: item.candidature.id,
          id_stagiaire: item.candidature.id_utilisateur,
          nom_stagiaire: item.stagiaire_info?.nom || '',
          prenom_stagiaire: item.stagiaire_info?.prenom || '',
          email_stagiaire: item.stagiaire_info?.email || '',
          rapport_final: !!item.rapport_final,
          rapport_final_id: item.rapport_final?.id,
          rapport_final_titre: item.rapport_final?.titre,
          date_soumission_rapport: item.rapport_final?.dateDepot || '',
          rapport_final_document: item.rapport_final?.document,
          encadrant: item.encadrant_info ? {
            nom: item.encadrant_info.nom,
            prenom: item.encadrant_info.prenom,
            departement: item.encadrant_info.encadrant_info?.departement || ''
          } : undefined,
          note: item.evaluation?.note,
          commentaire: item.evaluation?.commentaire,
          attestation_envoyee: !!item.candidature.attestation
        }));
        this.attestationsCount = this.attestations.length;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des attestations:', error);
        this.attestations = [];
        this.attestationsCount = 0;
      }
    });
  }

  // Actions pour conventions
  telechargerConvention(convention: Convention) {
    if (!convention.convention_base64) {
      alert('Aucune convention déposée pour ce stagiaire');
      return;
    }
    // Nettoyer le base64 (enlever le préfixe data:...; si présent)
    let base64Clean = convention.convention_base64;
    if (base64Clean.includes(',')) {
      base64Clean = base64Clean.split(',')[1];
    }
    // Convertir base64 en bytes
    const byteCharacters = atob(base64Clean);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Convention_${convention.prenom_stagiaire}_${convention.nom_stagiaire}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  onConventionFileSelected(event: any, convention: Convention) {
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier sélectionné:', file, 'pour convention:', convention);
      convention.uploading = true;
      this.stagiaireService.deposerConventionSignee(convention.id, file).subscribe({
        next: (response) => {
          convention.uploading = false;
          convention.convention_signee = true;
          convention.message_success = (response && response.message) ? response.message : 'Convention signée déposée.';
          console.log('Convention signée uploadée avec succès', response);
        },
        error: (error) => {
          // Si le backend retourne 200 ou 204, considérer comme succès
          if (error.status === 200 || error.status === 204) {
            convention.uploading = false;
            convention.convention_signee = true;
            convention.message_success = 'Convention signée déposée.';
            console.log('Convention signée uploadée (succès, corps vide)', error);
            return;
          }
          convention.uploading = false;
          convention.convention_signee = false;
          convention.message_success = undefined;
          alert('Erreur lors du dépôt de la convention signée.');
          console.error('Erreur upload convention signée:', error);
        }
      });
    }
  }

  // Actions pour attestations
  telechargerRapport(attestation: Attestation) {
    if (!attestation.rapport_final_document) {
      alert('Aucun rapport final disponible pour ce stagiaire');
      return;
    }
    // Nettoyer le base64 (enlever le préfixe data:...; si présent)
    let base64Clean = attestation.rapport_final_document;
    if (base64Clean.includes(',')) {
      base64Clean = base64Clean.split(',')[1];
    }
    // Convertir base64 en bytes
    const byteCharacters = atob(base64Clean);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attestation.rapport_final_titre ? `${attestation.rapport_final_titre}.pdf` : 'rapport_final.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  genererAttestation(attestation: Attestation) {
    if (!attestation.note) {
      alert('Veuillez saisir une note avant de générer l\'attestation');
      return;
    }

    console.log('Générer attestation pour:', attestation);
    attestation.generating = true;
    
    // TODO: Implémenter la génération et l'envoi de l'attestation
    // Simulation de génération
    setTimeout(() => {
      attestation.generating = false;
      attestation.attestation_envoyee = true;
      console.log('Attestation générée et envoyée avec succès');
      
      // Mettre à jour le compteur
      this.attestationsCount = this.attestations.filter(a => !a.attestation_envoyee).length;
    }, 3000);
  }
}

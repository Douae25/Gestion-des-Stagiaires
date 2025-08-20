
import { Injectable } from '@angular/core';

// Interface pour un rapport de stage
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UtilisateurUpdateResponse } from '../models/utilisateur-update-response.model';

export interface StagiaireProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero_telephone?: string;
  mot_de_passe?: string; // Optionnel pour les updates
  type: string; // "stagiaire"
  date_creation?: string;
  stagiaire_info?: {
    niveau_etude?: string;
    etablissement?: string;

    
  };
}
// Interface pour un rapport de stage
export interface Rapport {
  id: number;
  titre: string;
  document: string;
  nbCommentaires?: number;
  idCandidature: number;
  type?: string;
  date_soumission?: string;
  statut?: string;
  commentaire_encadrant?: string;
  nom_fichier?: string;
}

// Interface spécifique pour les updates de profil
export interface ProfileUpdateData {
  nom?: string;
  prenom?: string;
  email?: string;
  numero_telephone?: string;
  type?: string;
  stagiaire_info?: {
    niveau_etude?: string;
    etablissement?: string;

  };
}

export interface Candidature {
  id: number;
  id_stagiaire: number;
  id_utilisateur?: number;
  id_offre: number;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'en_cours_evaluation';
  date_soumission: string;
  date_reponse?: string;
  commentaire_rh?: string;
  cv?: string;
  lettre_motivation?: string;
  convention_stage?: string;
  convention_signee?: string; // Convention signée par l'entreprise
  convention_signee_rh?: string; // Autre nom possible pour la convention signée
  attestation?: string;
  attestation_stage?: string; // Autre nom possible pour l'attestation
  id_encadrant?: number;
  offre_info: {
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
  };
  encadrant_info?: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe?: string;
    numero_telephone: string;
    type: string;
    statut: string;
    stagiaire_info?: any;
    encadrant_info: {
      id: number;
      id_encadrant: number;
      departement: string;
    };
  };
  rh_info?: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe?: string;
    numero_telephone: string;
    type: string;
    statut: string;
    stagiaire_info?: any;
    encadrant_info?: any;
  };
}

export interface CandidaturesResponse {
  candidatures: Candidature[];
  total: number;
  en_attente: number;
  acceptees: number;
  refusees: number;
}

export interface Notification {
  id: number;
  titre: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  date_creation: string;
  lu: boolean;
  url?: string;
  offre_id?: number;
  candidature_id?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  non_lues: number;
}

export interface DashboardStats {
  candidatures: {
    total: number;
    en_attente: number;
    acceptees: number;
    refusees: number;
    en_cours_evaluation: number;
  };
  offres: {
    total_disponibles: number;
    nouvelles_cette_semaine: number;
    correspondant_profil: number;
  };
  documents: {
    cv_uploaded: boolean;
    lettre_motivation_uploaded: boolean;
    attestations_count: number;
  };
  activite_recente: {
    derniere_connexion: string;
    derniere_candidature?: string;
  };
}

export interface Document {
  id: number;
  type: 'cv' | 'lettre_motivation' | 'attestation' | 'rapport';
  nom: string;
  url: string;
  taille: number;
  date_upload: string;
  statut: 'valide' | 'en_attente' | 'refuse';
}

export interface DocumentsResponse {
  documents: Document[];
}

// Interfaces pour les stages
export interface Stage {
  id: number;
  candidature_id: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  duree: number;
  localisation: string;
  statut: 'en_cours' | 'termine' | 'interrompu';
  convention_signee: boolean;
  convention_deposee: boolean;
  date_depot_convention?: string;
  rapport_final_soumis: boolean;
  attestation_generee: boolean;
  
  // Informations de l'encadrant
  encadrant?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    poste?: string;
  };
  
  // Informations de l'entreprise
  entreprise?: {
    id: number;
    nom: string;
    adresse?: string;
    secteur?: string;
  };
  
  // Documents liés au stage
  convention_stage?: string; // URL ou base64
  attestation_stage?: string; // URL ou base64
  rapports: Rapport[];
}



export interface StagesResponse {
  stages: Stage[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class StagiaireService {
  // Récupérer les commentaires d'un rapport
  getCommentairesRapport(idRapport: number) {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  return this.http.get<any[]>(`/api/commentaires/rapport/${idRapport}`, { headers });
  }
  private readonly API_URL = '/api';
  private candidaturesCache: Array<{ candidature: Candidature, rapports: Rapport[] }> | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders() {
    return this.authService.getAuthHeaders();
  }

  // Profil du stagiaire
  getProfile(): Observable<StagiaireProfile> {
    const currentUser = this.authService.getCurrentUser();
    console.log('=== DEBUG PROFILE REQUEST ===');
    console.log('Current user in getProfile:', currentUser);
    console.log('User ID:', currentUser?.id);
    console.log('User email:', currentUser?.email);
    console.log('User role:', currentUser?.role);
    console.log('Token présent:', !!this.authService.getToken());
    
    if (!currentUser?.id) {
      console.error('❌ Aucun utilisateur connecté ou ID manquant');
      throw new Error('Utilisateur non connecté ou ID manquant');
    }

    const url = `${this.API_URL}/utilisateurs/${currentUser.id}`;
    console.log('🌐 URL de la requête:', url);

    return this.http.get<StagiaireProfile>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('🚨 Erreur lors de la récupération du profil:');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        
        if (error.status === 403) {
          console.error('❌ Erreur 403: Problème d\'authentification ou utilisateur non trouvé');
          console.error('Cela peut indiquer:');
          console.error('1. Token expiré ou invalide');
          console.error('2. Utilisateur supprimé de la base de données');
          console.error('3. Incohérence entre email du token et email en DB');
          
          // Forcer la déconnexion pour résoudre l'incohérence
          console.warn('🔄 Déconnexion forcée pour résoudre l\'incohérence...');
          this.authService.handleUserNotFoundError();
        }
        
        return throwError(() => error);
      })
    );
  }

  updateProfile(profile: Partial<StagiaireProfile>): Observable<UtilisateurUpdateResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    console.log('🔍 Données reçues pour la mise à jour:', profile);
    console.log('🔍 stagiaire_info reçu:', profile.stagiaire_info);

    // Version 1: Données à la racine (comme actuellement)
    const updateDataFlat = {
      nom: profile.nom,
      prenom: profile.prenom,
      email: profile.email,
      numero_telephone: profile.numero_telephone || '',
      type: profile.type || 'stagiaire',
      mot_de_passe: profile.mot_de_passe,
      niveau_etude: profile.stagiaire_info?.niveau_etude || '',
      etablissement: profile.stagiaire_info?.etablissement || ''
    };

    // Version 2: Données avec stagiaire_info imbriqué
    const updateDataNested = {
      nom: profile.nom,
      prenom: profile.prenom,
      email: profile.email,
      numero_telephone: profile.numero_telephone || '',
      type: profile.type || 'stagiaire',
      mot_de_passe: profile.mot_de_passe,
      stagiaire_info: {
        niveau_etude: profile.stagiaire_info?.niveau_etude || '',
        etablissement: profile.stagiaire_info?.etablissement || ''
      }
    };

    // Testons d'abord la version imbriquée
    const updateData = updateDataNested;

    console.log('📤 Structure envoyée au backend:');
    console.log('- Version:', 'nested (stagiaire_info imbriqué)');
    console.log('- Niveau d\'étude:', updateData.stagiaire_info?.niveau_etude);
    console.log('- Établissement:', updateData.stagiaire_info?.etablissement);
    console.log('📦 Données complètes:', { ...updateData, mot_de_passe: '[MASQUÉ]' });

    return this.http.put<UtilisateurUpdateResponse>(`${this.API_URL}/utilisateurs/${currentUser.id}`, updateData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        // Gérer le nouveau token si l'email a changé
        if (response.emailChanged && response.newToken) {
          console.log('📧 Email modifié - mise à jour du token');
          
          // Mettre à jour le token dans le localStorage
          localStorage.setItem('authToken', response.newToken);
          
          // Mettre à jour les informations utilisateur dans le service d'authentification
          const updatedUser = {
            ...currentUser,
            email: response.utilisateur.email,
            nom: response.utilisateur.nom,
            prenom: response.utilisateur.prenom
          };
          
          // Si votre AuthService a une méthode pour mettre à jour l'utilisateur
          this.authService.updateCurrentUser(updatedUser, response.newToken);
        }
      }),
      map(response => response), // Retourner la réponse complète
      catchError(error => {
        console.error('❌ Erreur avec structure imbriquée, test avec structure plate...');
        
        // Si l'approche imbriquée échoue, essayons la structure plate
        const flatData = updateDataFlat;
        console.log('📤 Nouvelle tentative avec structure plate:');
        console.log('- Niveau d\'étude:', flatData.niveau_etude);
        console.log('- Établissement:', flatData.etablissement);
        
        return this.http.put<UtilisateurUpdateResponse>(`${this.API_URL}/utilisateurs/${currentUser.id}`, flatData, {
          headers: this.getHeaders()
        }).pipe(
          tap(response => {
            // Gérer le nouveau token si l'email a changé (même logique)
            if (response.emailChanged && response.newToken) {
              console.log('📧 Email modifié - mise à jour du token');
              localStorage.setItem('authToken', response.newToken);
              
              const updatedUser = {
                ...currentUser,
                email: response.utilisateur.email,
                nom: response.utilisateur.nom,
                prenom: response.utilisateur.prenom
              };
              
              this.authService.updateCurrentUser(updatedUser, response.newToken);
            }
          })
        );
      })
    );
  }

  // Candidatures
  getCandidatures(page: number = 1, limit: number = 10): Observable<Candidature[]> {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user in getCandidatures:', currentUser);
    
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté ou ID manquant');
    }

    console.log('Calling correct backend endpoint: /candidatures/utilisateur/' + currentUser.id);
    
    return this.http.get<Candidature[]>(
      `${this.API_URL}/candidatures/utilisateur/${currentUser.id}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  getCandidatureDetail(candidatureId: number): Observable<Candidature> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    // Essayer d'abord l'endpoint spécifique au stagiaire pour éviter les erreurs 403
    console.log('Tentative de récupération des détails via l\'endpoint utilisateur');
    return this.http.get<Candidature>(`${this.API_URL}/candidatures/utilisateur/${currentUser.id}/${candidatureId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.log('Endpoint spécifique non disponible, essai de l\'endpoint générique');
        // Si l'endpoint spécifique échoue, essayer l'endpoint générique
        return this.http.get<Candidature>(`${this.API_URL}/candidatures/${candidatureId}`, {
          headers: this.getHeaders()
        });
      })
    );
  }

  // Annuler une candidature
  cancelCandidature(candidatureId: number): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    console.log('🗑️ Annulation de la candidature ID:', candidatureId);
    
    return this.http.delete(`${this.API_URL}/candidatures/${candidatureId}`, {
      headers: this.getHeaders(),
      responseType: 'text' // Indiquer qu'on attend du texte ou une réponse vide
    }).pipe(
      map(response => {
        console.log('✅ Candidature annulée avec succès - Réponse:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de l\'annulation de la candidature:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Erreur lors de l\'annulation de la candidature';
        
        // Si le statut est 200 mais on a une erreur, c'est probablement un problème de parsing
        if (error.status === 200) {
          console.log('✅ Statut 200 détecté - considérer comme succès');
          return of('success'); // Retourner un succès artificiel
        }
        
        if (error.status === 403) {
          errorMessage = 'Vous n\'êtes pas autorisé à annuler cette candidature';
        } else if (error.status === 404) {
          errorMessage = 'Candidature non trouvée';
        } else if (error.status === 400) {
          errorMessage = 'Cette candidature ne peut plus être annulée';
        }
        
        throw new Error(errorMessage);
      })
    );
  }

  // Notifications
  getNotifications(page: number = 1, limit: number = 20): Observable<NotificationsResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.get<NotificationsResponse>(
      `${this.API_URL}/stagiaires/${currentUser.id}/notifications?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/notifications/${notificationId}/read`, {}, {
      headers: this.getHeaders()
    });
  }

  markAllNotificationsAsRead(): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.patch<void>(`${this.API_URL}/stagiaires/${currentUser.id}/notifications/read-all`, {}, {
      headers: this.getHeaders()
    });
  }

  // Statistiques du dashboard
  getDashboardStats(): Observable<DashboardStats> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.get<DashboardStats>(`${this.API_URL}/stagiaires/${currentUser.id}/stats`, {
      headers: this.getHeaders()
    });
  }

  // Documents
  getDocuments(): Observable<DocumentsResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.get<DocumentsResponse>(`${this.API_URL}/stagiaires/${currentUser.id}/documents`, {
      headers: this.getHeaders()
    });
  }

  uploadDocument(file: File, type: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    // Note: Pour l'upload de fichiers, on n'ajoute pas Content-Type dans les headers
    const headers = this.authService.getAuthHeaders().delete('Content-Type');

    return this.http.post<Document>(`${this.API_URL}/stagiaires/${currentUser.id}/documents`, formData, {
      headers
    });
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/documents/${documentId}`, {
      headers: this.getHeaders()
    });
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/documents/download/${documentId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Télécharger la convention signée pour un utilisateur spécifique
  downloadConventionSignee(idUtilisateur: number, candidatureId?: number): Observable<Blob> {
    let url = `${this.API_URL}/candidatures/utilisateur/${idUtilisateur}`;
    if (candidatureId) {
      url += `/${candidatureId}`;
    }
    
    return this.http.get<Candidature>(url, {
      headers: this.getHeaders()
    }).pipe(
      switchMap((candidature: Candidature) => {
        if (!candidature.convention_signee) {
          throw new Error('Convention signée non disponible');
        }
        
        // Si convention_signee est un chemin de fichier sur le serveur
        if (typeof candidature.convention_signee === 'string') {
          // Vérifier si c'est des données base64 ou un chemin de fichier
          if (candidature.convention_signee.startsWith('JVBERi0x') || candidature.convention_signee.startsWith('data:')) {
            // C'est des données base64, les convertir en blob directement
            try {
              const base64Data = candidature.convention_signee.replace(/^data:application\/pdf;base64,/, '');
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              return of(blob);
            } catch (error) {
              throw new Error('Erreur lors du décodage du fichier PDF');
            }
          } else {
            // C'est un chemin de fichier, faire un appel API pour le téléchargement
            const downloadUrl = `${this.API_URL}/documents/download-file?path=${encodeURIComponent(candidature.convention_signee)}`;
            return this.http.get(downloadUrl, {
              headers: this.getHeaders(),
              responseType: 'blob'
            });
          }
        }
        
        throw new Error('Format de convention non valide');
      }),
      catchError((error) => {
        console.error('Erreur lors du téléchargement de la convention:', error);
        return throwError(() => error);
      })
    );
  }

  // Postuler à une offre
  postulerOffre(candidatureData: FormData): Observable<Candidature> {
    // Pour l'upload de fichiers, on n'ajoute pas Content-Type dans les headers
    const token = this.authService.getToken();
    
    console.log('Token disponible pour candidature:', !!token);
    console.log('Current user:', this.authService.getCurrentUser());
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Envoi de la candidature vers:', `${this.API_URL}/candidatures`);
    console.log('Headers:', headers.keys());

    return this.http.post<Candidature>(`${this.API_URL}/candidatures`, candidatureData, {
      headers
    });
  }

  // Retirer une candidature
  retirerCandidature(candidatureId: number): Observable<any> {
    console.log('Suppression de la candidature ID:', candidatureId);
    
    return this.http.delete(`${this.API_URL}/candidatures/${candidatureId}`, {
      headers: this.getHeaders(),
      observe: 'response', // Observer la réponse complète
      responseType: 'text' as 'json'
    }).pipe(
      map((response) => {
        console.log('Réponse complète du serveur:', response);
        console.log('Status:', response.status);
        console.log('Body:', response.body);
        
        // Si le status est 200 ou 204, c'est un succès
        if (response.status === 200 || response.status === 204) {
          return { success: true, message: 'Candidature supprimée avec succès' };
        }
        return response.body;
      }),
      catchError((error) => {
        console.error('Erreur lors de la suppression:', error);
        
        // Si le status est 200 mais traité comme erreur, c'est probablement un succès
        if (error.status === 200 || error.status === 204) {
          console.log('Suppression réussie malgré l\'erreur apparente (status ' + error.status + ')');
          return of({ success: true, message: 'Candidature supprimée avec succès' });
        }
        
        throw error;
      })
    );
  }

  // ==================== GESTION DES STAGES ====================

  // Récupérer la liste des stages acceptés de l'étudiant
  getStages(): Observable<StagesResponse> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    console.log('📚 Récupération des candidatures acceptées pour l\'utilisateur:', currentUser.id);
    
    // Vider le cache pour forcer un nouveau chargement
    this.clearCandidaturesCache();
    
    return this.getCandidaturesAcceptees().pipe(
      map(items => {
        console.log('✅ Mes candidatures acceptées reçues:', items);
        console.log('📊 Nombre de candidatures:', items.length);
        // items est un tableau d'objets {candidature, rapports}
        const stages: Stage[] = items.map(item => {
          const stage = this.transformCandidatureToStage(item.candidature);
          stage.rapports = item.rapports || [];
          return stage;
        });
        console.log('🏫 Stages finaux:', stages);
        return {
          stages,
          total: stages.length
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des candidatures acceptées:', error);
        throw error;
      })
    );
  }

  // Méthode utilitaire pour transformer une candidature en stage
  private transformCandidatureToStage(candidature: Candidature): Stage {
    console.log('🔄 Transformation candidature en stage:', candidature);
    console.log('🔍 Convention stage:', candidature.convention_stage);
    console.log('🔍 Attestation:', candidature.attestation);
    console.log('🔍 Candidature complète:', JSON.stringify(candidature, null, 2));
    
    const offre = candidature.offre_info;
    console.log('📋 Offre extraite:', offre);
    
    if (!offre) {
      console.warn('⚠️ Aucune offre trouvée pour la candidature:', candidature.id);
    }
    
    const conventionDeposee = candidature.convention_stage ? true : false;
    // Chercher tous les champs possibles pour la convention signée
    const conventionSignee = !!(
      candidature.convention_signee || 
      candidature.convention_signee_rh || 
      candidature.attestation || 
      candidature.attestation_stage
    );
    
    // Log pour diagnostiquer les champs disponibles
    console.log('📊 Champs disponibles dans candidature:', Object.keys(candidature));
    console.log('📄 Convention déposée:', conventionDeposee);
    console.log('📝 convention_signee:', !!candidature.convention_signee);
    console.log('📝 convention_signee_rh:', !!candidature.convention_signee_rh);
    console.log('📋 attestation:', !!candidature.attestation);
    console.log('📋 attestation_stage:', !!candidature.attestation_stage);
    console.log('✍️ Convention signée (résultat final):', conventionSignee);
    
    const stage: Stage = {
      id: candidature.id, // Utiliser l'ID de la candidature comme ID du stage
      candidature_id: candidature.id,
      titre: offre?.titre || `Stage - Candidature ${candidature.id}`,
      description: offre?.description || 'Description non disponible',
      date_debut: offre?.date_debut || new Date().toISOString().split('T')[0],
      date_fin: offre?.date_fin || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +6 mois par défaut
      duree: offre?.duree || 6,
      localisation: offre?.localisation || 'Non spécifiée',
      statut: 'en_cours', // Par défaut, les candidatures acceptées sont des stages en cours
      convention_signee: conventionSignee,
      convention_deposee: conventionDeposee,
      date_depot_convention: candidature.convention_stage ? candidature.date_reponse : undefined,
      rapport_final_soumis: false, // Par défaut, pas encore soumis
      attestation_generee: candidature.attestation ? true : false,
      
      // Informations de l'entreprise (extraites du RH info)
      entreprise: candidature.rh_info ? {
        id: candidature.rh_info.id_utilisateur,
        nom: `${candidature.rh_info.prenom} ${candidature.rh_info.nom}`,
        adresse: undefined, // Pas disponible dans l'API candidatures
        secteur: undefined  // Pas disponible dans l'API candidatures
      } : {
        id: 0,
        nom: 'Entreprise non spécifiée',
        adresse: undefined,
        secteur: undefined
      },
      
      // Informations de l'encadrant (si disponible)
      encadrant: candidature.encadrant_info ? {
        id: candidature.encadrant_info.id_utilisateur,
        nom: candidature.encadrant_info.nom,
        prenom: candidature.encadrant_info.prenom,
        email: candidature.encadrant_info.email,
        telephone: candidature.encadrant_info.numero_telephone,
        poste: candidature.encadrant_info.encadrant_info?.departement || 'Non spécifié'
      } : undefined,
      
      // Documents liés au stage
      convention_stage: candidature.convention_stage,
      attestation_stage: candidature.attestation || candidature.attestation_stage,
      rapports: [] // Aucun rapport par défaut
    };
    
    console.log('✅ Stage transformé:', stage);
    return stage;
  }

  // Récupérer les candidatures acceptées (qui deviennent des stages)



  // Correction du typage pour la structure backend
  getCandidaturesAcceptees(): Observable<Array<{ candidature: Candidature, rapports: Rapport[] }>> {
    // Si on a déjà les données en cache, les retourner
    if (this.candidaturesCache) {
      console.log('📦 Utilisation du cache pour les candidatures acceptées');
      return of(this.candidaturesCache);
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    console.log('🎯 Récupération des candidatures acceptées pour l\'utilisateur:', currentUser.id);
    
    return this.http.get<Array<{ candidature: Candidature, rapports: Rapport[] }>>(`${this.API_URL}/candidatures/mes-candidatures-acceptees`, {
      headers: this.getHeaders()
    }).pipe(
      tap(items => {
        console.log('✅ Candidatures acceptées récupérées:', items);
        // Stocker en cache
        this.candidaturesCache = items;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des candidatures acceptées:', error);
        throw error;
      })
    );
  }

  // Méthode utilitaire pour convertir base64 en blob
  private convertBase64ToBlob(base64Data: string, mimeType: string = 'application/pdf'): Blob {
    let cleanBase64 = base64Data;
    
    // Si c'est un data URL, extraire seulement la partie base64
    if (base64Data.startsWith('data:')) {
      cleanBase64 = base64Data.split(',')[1];
    }
    
    try {
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('❌ Erreur lors de la conversion base64:', error);
      throw new Error('Impossible de convertir les données du fichier');
    }
  }

  // Méthode pour vider le cache (utile pour forcer un rechargement)
  clearCandidaturesCache(): void {
    this.candidaturesCache = null;
  }

  // Récupérer les détails d'un stage spécifique
  getStageDetail(stageId: number): Observable<Stage> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.get<Stage>(`${this.API_URL}/stages/${stageId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(stage => {
        console.log('✅ Détails du stage récupérés:', stage);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération du stage:', error);
        throw error;
      })
    );
  }

  // Déposer la convention de stage
  deposerConventionStage(candidatureId: number, conventionFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('id_candidature', candidatureId.toString());
    formData.append('convention_stage', conventionFile);

    // Pour les uploads de fichiers, nous devons utiliser des headers spéciaux
    // qui n'incluent PAS Content-Type (le navigateur le gère automatiquement)
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // PAS de Content-Type pour multipart/form-data !
    });

    return this.http.post(`${this.API_URL}/candidatures/conventions`, formData, {
      headers: headers,
      responseType: 'text' // L'API retourne du texte, pas du JSON
    }).pipe(
      tap((response) => {
        console.log('✅ Convention de stage déposée avec succès:', response);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du dépôt de la convention:', error);
        throw error;
      })
    );
  }

  // Déposer un rapport de stage
  deposerRapport(idCandidature: number, rapportFile: File, titre: string): Observable<any> {
    const formData = new FormData();
    formData.append('document', rapportFile);
    formData.append('titre', titre);
    formData.append('idCandidature', idCandidature.toString());

    // Log du contenu du FormData
    console.log('FormData envoyé au backend:');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], ':', pair[1].name, pair[1].type, pair[1].size + ' bytes');
      } else {
        console.log(pair[0], ':', pair[1]);
      }
    }

    // Récupérer le token et créer le header Authorization uniquement
    const token = this.authService.getToken();
    let httpHeaders = new HttpHeaders();
    if (token) {
      httpHeaders = httpHeaders.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.API_URL}/rapports`, formData, { headers: httpHeaders }).pipe(
      tap(response => {
        console.log('✅ Rapport déposé avec succès:', response);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du dépôt du rapport:', error);
        throw error;
      })
    );
  }

  // Récupérer les rapports d'un stage
  getRapportsStage(stageId: number): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.API_URL}/stages/${stageId}/rapports`, {
      headers: this.getHeaders()
    }).pipe(
      tap(rapports => {
        console.log('✅ Rapports récupérés:', rapports);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des rapports:', error);
        throw error;
      })
    );
  }

  // Télécharger l'attestation de stage via /candidatures/utilisateur/{idUtilisateur}/{candidatureId}
  // Télécharger l'attestation de stage depuis les candidatures (base64)
  telechargerAttestation(candidatureId: number): Observable<Blob> {
    return this.getCandidatures().pipe(
      map(candidatures => {
        const candidature = candidatures.find(c => c.id === candidatureId);
        if (!candidature) {
          throw new Error('Candidature non trouvée');
        }
        const attestationData = candidature.attestation || candidature.attestation_stage;
        if (!attestationData) {
          throw new Error('Attestation non disponible');
        }
        // Conversion base64 en blob
        return this.convertBase64ToBlob(attestationData);
      }),
      tap(() => {
        console.log('✅ Attestation téléchargée depuis les données candidature');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement de l\'attestation:', error);
        throw error;
      })
    );
  }

  // Télécharger un rapport
  telechargerRapport(rapportId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/rapports/${rapportId}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => {
        console.log('✅ Rapport téléchargé');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement du rapport:', error);
        throw error;
      })
    );
  }

  // Télécharger le modèle de convention de stage
  telechargerModeleConvention(stageId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/stages/${stageId}/convention/modele`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => {
        console.log('✅ Modèle de convention téléchargé');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement du modèle de convention:', error);
        throw error;
      })
    );
  }

  // Télécharger la convention de stage déposée par le stagiaire
  // Télécharger la convention depuis les données de candidature déjà récupérées
  telechargerConventionCandidature(candidatureId: number): Observable<Blob> {
    return this.getCandidaturesAcceptees().pipe(
      map(items => {
        const item = items.find(item => item.candidature.id === candidatureId);
        const candidature = item?.candidature;
        if (!candidature) {
          throw new Error('Candidature non trouvée');
        }
        // Priorité à la convention signée, sinon convention normale
        let conventionData = candidature.convention_signee || candidature.convention_stage;
        if (!conventionData) {
          throw new Error('Convention non disponible');
        }
        console.log('📄 Convention trouvée dans les données candidature');
        return this.convertBase64ToBlob(conventionData);
      }),
      tap(() => {
        console.log('✅ Ma convention téléchargée depuis les données candidature');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement de ma convention:', error);
        throw error;
      })
    );
  }

  // Télécharger la convention signée depuis toutes les candidatures (pour la page candidatures)
  telechargerConventionSigneeCandidature(candidatureId: number): Observable<Blob> {
    return this.getCandidatures().pipe(
      map(candidatures => {
        const candidature = candidatures.find(c => c.id === candidatureId);
        if (!candidature) {
          throw new Error('Candidature non trouvée');
        }
        
        if (!candidature.convention_signee) {
          throw new Error('Convention signée non disponible');
        }
        
        console.log('📄 Convention signée trouvée dans les données candidature');
        return this.convertBase64ToBlob(candidature.convention_signee);
      }),
      tap(() => {
        console.log('✅ Convention signée téléchargée depuis les données candidature');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement de la convention signée:', error);
        throw error;
      })
    );
  }

  // Télécharger la convention depuis l'ancien système (pour compatibilité)
  telechargerConvention(stageId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/stages/${stageId}/convention/download`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(() => {
        console.log('✅ Ma convention téléchargée');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement de ma convention:', error);
        throw error;
      })
    );
  }

  // Télécharger la convention signée par l'entreprise (depuis les données de candidature)
  telechargerConventionSignee(candidatureId: number): Observable<Blob> {
    return this.getCandidaturesAcceptees().pipe(
      map(items => {
        const item = items.find(item => item.candidature.id === candidatureId);
        const candidature = item?.candidature;
        if (!candidature) {
          throw new Error('Candidature non trouvée');
        }
        // Chercher le champ qui contient la convention signée
        const conventionSigneeData = candidature.convention_signee || 
                                   candidature.convention_signee_rh || 
                                   candidature.attestation || 
                                   candidature.attestation_stage;
        if (!conventionSigneeData) {
          throw new Error('Convention signée non disponible');
        }
        console.log('📄 Convention signée trouvée dans les données candidature');
        return this.convertBase64ToBlob(conventionSigneeData);
      }),
      tap(() => {
        console.log('✅ Convention signée téléchargée depuis les données candidature');
      }),
      catchError(error => {
        console.error('❌ Erreur lors du téléchargement de la convention signée:', error);
        throw error;
      })
    );
  }
}

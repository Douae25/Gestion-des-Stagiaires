export interface Rapport {
  id: number;
  titre: string;
  document: string;
  nbCommentaires?: number;
  encadrant?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    poste?: string;
  };
}
export interface Tag {
  libelle: string;
  color: string;
}

export interface OffreStage {
  id: number;
  titre: string;
  description: string;
  date_debut: string; // LocalDate du backend
  date_fin: string;   // LocalDate du backend
  duree: number;      // Integer du backend
  statut: string;     // en_cours, fermee, archivee
  localisation: string;
  competence_requise: string;
  date_publication: string; // LocalDate du backend
  duree_candidature: number; // en jours
  nombre_limite_candidature?: number; // nullable - si null, pas de limite
  nombre_candidatures_actuelles?: number; // pour afficher le nombre actuel de candidatures
  entreprise?: {
    id: number;
    nom: string;
    logo?: string;
  };
}

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
  entreprise?: {
    id: number;
    nom: string;
    logo?: string;
  };
}

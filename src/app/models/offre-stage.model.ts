export interface Tag {
  libelle: string;
  color: string;
}

export interface OffreStage {
  id: number;
  titre: string;
  description: string;
  duree: string;
  ville: string;
  pays: string;
  tags: Tag[];
  salaire: number;
  entreprise: {
    id: number;
    nom: string;
    logo?: string;
  };
  date_publication: string;
  lieu: string;
  statut: string;
}

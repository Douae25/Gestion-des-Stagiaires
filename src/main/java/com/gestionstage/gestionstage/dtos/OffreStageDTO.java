package com.gestionstage.gestionstage.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class OffreStageDTO {
    private Integer id;
    private Integer id_rh;
    private String titre;
    private String description;
    private LocalDate date_debut;
    private LocalDate date_fin;
    private Integer duree;
    private String statut; // en_cours, fermee, archivee
    private String localisation;
    private String competence_requise;

    private LocalDate date_publication;
    private Integer duree_candidature; // en jours, peut être null
    private Integer nombre_limite_candidature; // peut être null

    // Ajout des infos RH
    private UtilisateurCompletDTO rh_info;
}

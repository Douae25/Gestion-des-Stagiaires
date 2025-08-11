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
}

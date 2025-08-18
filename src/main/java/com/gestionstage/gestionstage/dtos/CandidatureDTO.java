package com.gestionstage.gestionstage.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CandidatureDTO {
    private Integer id;
    private Integer id_stagiaire;
    private Integer id_utilisateur;  // Ajouter l'ID utilisateur
    private Integer id_offre;
    private String statut; // en_attente, acceptee, refusee
    private LocalDate date_soumission;
    private LocalDate date_acceptation;

    private byte[] cv;
    private byte[] lettre_motivation;

    private byte[] convention_stage;
    private byte[] convention_signee;
    private byte[] attestation;

    private Integer id_encadrant;

    // Informations de l'offre
    private OffreStageDTO offre_info;

    // Informations de l'encadrant assigné
    private UtilisateurCompletDTO encadrant_info;

    // Informations du RH qui a créé l'offre
    private UtilisateurCompletDTO rh_info;

}

package com.gestionstage.gestionstage.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CandidatureDTO {
    private Integer id;
    private Integer id_stagiaire;
    private Integer id_offre;
    private String statut; // en_attente, acceptee, refusee
    private LocalDate date_soumission;

    private byte[] cv;
    private byte[] lettre_motivation;

    private byte[] convention_stage;
    private byte[] attestation;

    private Integer id_encadrant;

}

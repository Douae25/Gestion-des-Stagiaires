package com.gestionstage.gestionstage.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_stagiaire", referencedColumnName = "id_stagiaire")
    private Stagiaire stagiaire;

    @ManyToOne
    @JoinColumn(name = "id_offre")
    private OffreStage offre;

    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.en_attente;

    private LocalDate date_soumission;
    
    private LocalDate date_acceptation;

    @Lob
    private byte[] cv;

    @Lob
    private byte[] lettre_motivation;

    @Lob
    private byte[] convention_stage;

    @Lob
    private byte[] convention_signee;

    @Lob
    private byte[] attestation;

    public enum Statut {
        en_attente, acceptee, refusee
    }

    @ManyToOne
@JoinColumn(name = "id_encadrant", referencedColumnName = "id", nullable = true)
private Encadrant encadrant;

}



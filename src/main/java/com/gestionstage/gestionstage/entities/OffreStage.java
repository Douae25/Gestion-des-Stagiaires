package com.gestionstage.gestionstage.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class OffreStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

@ManyToOne(optional = false) 
@JoinColumn(name = "id_rh", nullable = false)
private Utilisateur rh;

    private String titre;
    private String description;
    private String sujet;

    public String getSujet() {
        return sujet;
    }

    private LocalDate date_debut;
    private LocalDate date_fin;
    private Integer duree;

    @Enumerated(EnumType.STRING)
    private StatutOffre statut = StatutOffre.en_cours;

    private String localisation;
    private String competence_requise;

    private LocalDate date_publication;
    private Integer duree_candidature; // en jours, peut être null
    private Integer nombre_limite_candidature; // peut être null

    public enum StatutOffre {
        en_cours, fermee, archivee
    }
}

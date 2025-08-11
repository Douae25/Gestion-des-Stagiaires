package com.gestionstage.gestionstage.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Stagiaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "id_stagiaire", referencedColumnName = "id_utilisateur", unique = true)
    private Utilisateur utilisateur;

    private String niveau_etude;
    private String etablissement;

    // Getters & Setters
}

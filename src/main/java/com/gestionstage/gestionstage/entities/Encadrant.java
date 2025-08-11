package com.gestionstage.gestionstage.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Encadrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "id_encadrant", referencedColumnName = "id_utilisateur", unique = true)
    private Utilisateur utilisateur;

    private String departement;

    // Getters & Setters
}

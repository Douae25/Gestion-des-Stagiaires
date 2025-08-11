package com.gestionstage.gestionstage.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    private String nom;
    private String prenom;

    @Column(unique = true)
    private String email;

    private String mot_de_passe;
    private String numero_telephone;

    @Enumerated(EnumType.STRING)
    private TypeUtilisateur type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.active; // valeur par défaut

    public enum TypeUtilisateur {
        stagiaire, encadrant, rh, admin
    }

    public enum Statut {
        active, archive
    }
}

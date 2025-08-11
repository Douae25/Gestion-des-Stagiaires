package com.gestionstage.gestionstage.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Commentaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String contenu;

    @ManyToOne
    @JoinColumn(name = "id_rapport")
    private Rapport rapport;
}

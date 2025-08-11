package com.gestionstage.gestionstage.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Rapport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String titre;

    @Lob
    private byte[] document;

    @ManyToOne
    @JoinColumn(name = "id_candidature")
    private Candidature candidature;
}

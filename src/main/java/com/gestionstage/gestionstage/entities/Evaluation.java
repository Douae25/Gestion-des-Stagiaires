package com.gestionstage.gestionstage.entities;


import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
@ManyToOne
@JoinColumn(name = "id_stagiaire", referencedColumnName = "id_stagiaire")
private Stagiaire stagiaire;

@ManyToOne
@JoinColumn(name = "id_encadrant_fk", referencedColumnName = "id")
private Encadrant encadrant;

    private Float note;
    private String commentaire;
    private LocalDate date_evaluation;

    // Getters & Setters
}

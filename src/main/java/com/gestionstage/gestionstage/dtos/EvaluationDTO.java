package com.gestionstage.gestionstage.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EvaluationDTO {
    private Integer id;
    private Integer id_stagiaire;
    private Integer id_encadrant;
    private Float note;
    private String commentaire;
    private LocalDate date_evaluation;
}

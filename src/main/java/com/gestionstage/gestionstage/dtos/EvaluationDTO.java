package com.gestionstage.gestionstage.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EvaluationDTO {
    private Integer id;
    private Float note;
    private String commentaire;
    private LocalDate dateEvaluation;
    private Integer id_stagiaire;
    private Integer id_encadrant;

    public Integer getId_encadrant() {
        return id_encadrant;
    }

    public void setId_encadrant(Integer id_encadrant) {
        this.id_encadrant = id_encadrant;
    }

    public Integer getId_stagiaire() {
        return id_stagiaire;
    }

    public void setId_stagiaire(Integer id_stagiaire) {
        this.id_stagiaire = id_stagiaire;
    }
}

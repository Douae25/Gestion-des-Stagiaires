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
    // Ajout des ids métier transmis par le front
    private Integer id_utilisateur_encadrant;
    private Integer id_utilisateur_stagiaire;

    public Integer getId_encadrant() {
        return id_encadrant;
    }
    public void setId_encadrant(Integer id_encadrant) {
        this.id_encadrant = id_encadrant;
    }
    public Integer getId_stagiaire() {
        return id_stagiaire;
    }
    // (Supprimé la version en double de setId_stagiaire)
    public Integer getId_utilisateur_encadrant() {
        return id_utilisateur_encadrant;
    }
    public void setId_utilisateur_encadrant(Integer id_utilisateur_encadrant) {
        this.id_utilisateur_encadrant = id_utilisateur_encadrant;
    }
    public Integer getId_utilisateur_stagiaire() {
        return id_utilisateur_stagiaire;
    }
    public void setId_utilisateur_stagiaire(Integer id_utilisateur_stagiaire) {
        this.id_utilisateur_stagiaire = id_utilisateur_stagiaire;
    }
    // Pour compatibilité avec le contrôleur
    public void setId_encadrant_fk(Integer idEncadrantTechnique) {
        this.id_encadrant = idEncadrantTechnique;
    }
    public void setId_stagiaire(Integer idStagiaireTechnique) {
        this.id_stagiaire = idStagiaireTechnique;
    }
}

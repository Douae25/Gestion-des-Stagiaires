package com.gestionstage.gestionstage.dtos;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentaireDTO {
    private Integer id;
    private String contenu;
    private String texte;
    private Integer idRapport;
    private java.time.LocalDate dateCommentaire;
    private Integer idCandidature;

    public String getTexte() { return texte; }
    public void setTexte(String texte) { this.texte = texte; }
    public java.time.LocalDate getDateCommentaire() { return dateCommentaire; }
    public void setDateCommentaire(java.time.LocalDate dateCommentaire) { this.dateCommentaire = dateCommentaire; }
    public Integer getIdCandidature() { return idCandidature; }
    public void setIdCandidature(Integer idCandidature) { this.idCandidature = idCandidature; }
}

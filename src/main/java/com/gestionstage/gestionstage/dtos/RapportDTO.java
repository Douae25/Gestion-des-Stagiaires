package com.gestionstage.gestionstage.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RapportDTO {
    private java.util.List<com.gestionstage.gestionstage.dtos.CommentaireDTO> commentaires;

    public java.util.List<com.gestionstage.gestionstage.dtos.CommentaireDTO> getCommentaires() {
        return commentaires;
    }

    public void setCommentaires(java.util.List<com.gestionstage.gestionstage.dtos.CommentaireDTO> commentaires) {
        this.commentaires = commentaires;
    }
    private Integer id;
    private String titre;
    private LocalDate dateDepot;
    private byte[] document;
    private Integer idCandidature;

    public Integer getIdCandidature() {
        return idCandidature;
    }

    public void setIdCandidature(Integer idCandidature) {
        this.idCandidature = idCandidature;
    }

    public byte[] getDocument() {
        return document;
    }

    public void setDocument(byte[] document) {
        this.document = document;
    }
}



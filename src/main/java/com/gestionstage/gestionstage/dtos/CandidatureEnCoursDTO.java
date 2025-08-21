package com.gestionstage.gestionstage.dtos;

import lombok.Data;
import java.util.List;

@Data
public class CandidatureEnCoursDTO {
    private CandidatureDTO candidature;
    private OffreStageDTO offre;
    private StagiaireDTO stagiaire;
    private EncadrantDTO encadrant;
    private UtilisateurDTO rh;
    private List<RapportDTO> rapports;
    private List<CommentaireDTO> commentaires;
    private EvaluationDTO evaluation;
}

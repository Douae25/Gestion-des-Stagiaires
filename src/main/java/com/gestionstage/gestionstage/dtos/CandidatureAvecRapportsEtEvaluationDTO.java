package com.gestionstage.gestionstage.dtos;

import lombok.Data;

@Data
public class CandidatureAvecRapportsEtEvaluationDTO {
    private CandidatureDTO candidature;
    private OffreStageDTO offre;
    private UtilisateurCompletDTO stagiaire_info;
    private UtilisateurCompletDTO encadrant_info;
    private RapportDTO rapport_final;
    private EvaluationDTO evaluation;
}

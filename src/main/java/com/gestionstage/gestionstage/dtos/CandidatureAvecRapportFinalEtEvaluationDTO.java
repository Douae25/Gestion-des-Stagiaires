package com.gestionstage.gestionstage.dtos;

import lombok.Data;
// ...existing code...

@Data
public class CandidatureAvecRapportFinalEtEvaluationDTO {
    // Candidature principale
    private CandidatureDTO candidature;
    // Infos du stagiaire (sans doublon)
    private StagiaireDTO stagiaire;
    // Infos de l'offre
    private OffreStageDTO offre;
    // Rapport final unique
    private RapportDTO rapportFinal;
    // Evaluation unique
    private EvaluationDTO evaluation;
}

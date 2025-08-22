package com.gestionstage.gestionstage.dtos;

public class CandidatureAvecRapportFinalDTO {
    private CandidatureDTO candidature;
    private StagiaireDTO stagiaire;
    private OffreStageDTO offre;
    private RapportDTO rapportFinal;

    public CandidatureDTO getCandidature() { return candidature; }
    public void setCandidature(CandidatureDTO candidature) { this.candidature = candidature; }

    public StagiaireDTO getStagiaire() { return stagiaire; }
    public void setStagiaire(StagiaireDTO stagiaire) { this.stagiaire = stagiaire; }

    public OffreStageDTO getOffre() { return offre; }
    public void setOffre(OffreStageDTO offre) { this.offre = offre; }

    public RapportDTO getRapportFinal() { return rapportFinal; }
    public void setRapportFinal(RapportDTO rapportFinal) { this.rapportFinal = rapportFinal; }
}

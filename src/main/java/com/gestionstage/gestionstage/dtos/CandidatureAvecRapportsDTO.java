package com.gestionstage.gestionstage.dtos;

import java.util.List;

public class CandidatureAvecRapportsDTO {
    private CandidatureDTO candidature;
    private List<RapportDTO> rapports;

    public CandidatureDTO getCandidature() {
        return candidature;
    }
    public void setCandidature(CandidatureDTO candidature) {
        this.candidature = candidature;
    }
    public List<RapportDTO> getRapports() {
        return rapports;
    }
    public void setRapports(List<RapportDTO> rapports) {
        this.rapports = rapports;
    }
}

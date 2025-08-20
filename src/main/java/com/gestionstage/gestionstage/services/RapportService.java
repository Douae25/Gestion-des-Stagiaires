package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.dtos.RapportDTO;
import com.gestionstage.gestionstage.entities.Candidature;
import com.gestionstage.gestionstage.entities.Rapport;
import com.gestionstage.gestionstage.repositories.CandidatureRepository;
import com.gestionstage.gestionstage.repositories.RapportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RapportService {

    @Autowired
    private RapportRepository rapportRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private CandidatureService candidatureService;

    public RapportDTO ajouterRapport(RapportDTO dto) {
        Candidature candidature = candidatureRepository.findById(dto.getIdCandidature())
            .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée"));

        Rapport rapport = new Rapport();
        rapport.setTitre(dto.getTitre());
        rapport.setDocument(dto.getDocument());
        rapport.setCandidature(candidature);

        rapport = rapportRepository.save(rapport);

        dto.setId(rapport.getId());

        // 🔔 Si le titre est "rapport final", notifier l'encadrant
        if (dto.getTitre() != null && dto.getTitre().trim().equalsIgnoreCase("Rapport final de stage")) {
            candidatureService.notifierEvaluationParEncadrant(dto.getIdCandidature());
        }

        return dto;
    }

    public List<RapportDTO> getRapportsParCandidature(Integer idCandidature) {
        return rapportRepository.findByCandidatureId(idCandidature).stream().map(r -> {
            RapportDTO dto = new RapportDTO();
            dto.setId(r.getId());
            dto.setTitre(r.getTitre());
            dto.setDocument(r.getDocument());
            dto.setIdCandidature(r.getCandidature().getId());
            return dto;
        }).collect(Collectors.toList());
    }
}


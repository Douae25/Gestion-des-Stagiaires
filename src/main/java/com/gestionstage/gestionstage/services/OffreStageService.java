package com.gestionstage.gestionstage.services;


import com.gestionstage.gestionstage.dtos.OffreStageDTO;
import com.gestionstage.gestionstage.entities.OffreStage;
import com.gestionstage.gestionstage.entities.Utilisateur;
import com.gestionstage.gestionstage.repositories.OffreStageRepository;
import com.gestionstage.gestionstage.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OffreStageService {

    @Autowired
    private OffreStageRepository offreStageRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public List<OffreStageDTO> getAll() {
        return offreStageRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OffreStageDTO> getActives() {
        return offreStageRepository.findByStatut(OffreStage.StatutOffre.en_cours)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

public OffreStageDTO create(OffreStageDTO dto) {
    // 1. Récupération de l'utilisateur
    Utilisateur rh = utilisateurRepository.findById(dto.getId_rh())
            .orElseThrow(() -> new IllegalArgumentException("RH avec ID " + dto.getId_rh() + " non trouvé"));

    // 2. Vérification du type
    if (rh.getType() != Utilisateur.TypeUtilisateur.rh) {
        throw new IllegalArgumentException("L'utilisateur avec ID " + dto.getId_rh() + " n'est pas de type RH");
    }

    // 3. Création de l'offre
    OffreStage offre = new OffreStage();
    offre.setTitre(dto.getTitre());
    offre.setDescription(dto.getDescription());
    offre.setDate_debut(dto.getDate_debut());
    offre.setDate_fin(dto.getDate_fin());
    offre.setDuree(dto.getDuree());
    offre.setStatut(OffreStage.StatutOffre.valueOf(dto.getStatut()));
    offre.setLocalisation(dto.getLocalisation());
    offre.setCompetence_requise(dto.getCompetence_requise());
    offre.setRh(rh);

    OffreStage saved = offreStageRepository.save(offre);
    dto.setId(saved.getId());

    return dto;
}


public OffreStageDTO getById(Integer id) {
    OffreStage offre = offreStageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Offre introuvable"));
    return toDTO(offre);
}

public OffreStageDTO update(Integer id, OffreStageDTO dto) {
    OffreStage offre = offreStageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Offre introuvable"));

    offre.setTitre(dto.getTitre());
    offre.setDescription(dto.getDescription());
    offre.setDate_debut(dto.getDate_debut());
    offre.setDate_fin(dto.getDate_fin());
    offre.setDuree(dto.getDuree());
    offre.setStatut(OffreStage.StatutOffre.valueOf(dto.getStatut()));
    offre.setLocalisation(dto.getLocalisation());
    offre.setCompetence_requise(dto.getCompetence_requise());

    OffreStage updated = offreStageRepository.save(offre);
    return toDTO(updated);
}

public void changerStatutOffre(Integer id, String statut) {
    OffreStage offre = offreStageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Offre introuvable"));

    try {
        offre.setStatut(OffreStage.StatutOffre.valueOf(statut));
    } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Statut invalide : " + statut + ". Les statuts valides sont : en_cours, archivee");
    }

    offreStageRepository.save(offre);
}


    private OffreStageDTO toDTO(OffreStage offre) {
        OffreStageDTO dto = new OffreStageDTO();
        dto.setId(offre.getId());
        dto.setId_rh(offre.getRh() != null ? offre.getRh().getIdUtilisateur() : null);
        dto.setTitre(offre.getTitre());
        dto.setDescription(offre.getDescription());
        dto.setDate_debut(offre.getDate_debut());
        dto.setDate_fin(offre.getDate_fin());
        dto.setDuree(offre.getDuree());
        dto.setStatut(offre.getStatut().name());
        dto.setLocalisation(offre.getLocalisation());
        dto.setCompetence_requise(offre.getCompetence_requise());
        return dto;
    }
}

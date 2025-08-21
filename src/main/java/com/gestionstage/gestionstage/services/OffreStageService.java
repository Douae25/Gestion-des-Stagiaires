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

    @Autowired
    private com.gestionstage.gestionstage.repositories.CandidatureRepository candidatureRepository;

    public List<OffreStageDTO> getAll() {
    List<OffreStage> offres = offreStageRepository.findAll();
    offres.forEach(this::updateStatutIfNeeded);
    return offres.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OffreStageDTO> getActives() {
        List<OffreStage> offres = offreStageRepository.findByStatut(OffreStage.StatutOffre.en_cours);
        offres.forEach(this::updateStatutIfNeeded);
        // Filtrer les offres encore actives
        return offres.stream()
                .filter(this::isStillActive)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public OffreStageDTO create(OffreStageDTO dto) {
        Utilisateur rh = utilisateurRepository.findById(dto.getId_rh())
                .orElseThrow(() -> new IllegalArgumentException("RH avec ID " + dto.getId_rh() + " non trouvé"));
        if (rh.getType() != Utilisateur.TypeUtilisateur.rh) {
            throw new IllegalArgumentException("L'utilisateur avec ID " + dto.getId_rh() + " n'est pas de type RH");
        }
        OffreStage offre = new OffreStage();
        offre.setTitre(dto.getTitre());
        offre.setDescription(dto.getDescription());
        offre.setDate_debut(dto.getDate_debut());
        offre.setDate_fin(dto.getDate_fin());
        offre.setDuree(dto.getDuree());
        offre.setStatut(OffreStage.StatutOffre.en_cours);
        offre.setLocalisation(dto.getLocalisation());
        offre.setCompetence_requise(dto.getCompetence_requise());
        offre.setRh(rh);
        offre.setDate_publication(java.time.LocalDate.now());
        offre.setDuree_candidature(dto.getDuree_candidature());
        offre.setNombre_limite_candidature(dto.getNombre_limite_candidature());
        OffreStage saved = offreStageRepository.save(offre);
        dto.setId(saved.getId());
        dto.setDate_publication(saved.getDate_publication());
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
        // Mise à jour des nouveaux champs
        if (dto.getDate_publication() != null) {
            offre.setDate_publication(dto.getDate_publication());
        }
        offre.setDuree_candidature(dto.getDuree_candidature());
        offre.setNombre_limite_candidature(dto.getNombre_limite_candidature());
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


    public OffreStageDTO toDTO(OffreStage offre) {
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
        dto.setDate_publication(offre.getDate_publication());
        dto.setDuree_candidature(offre.getDuree_candidature());
        dto.setNombre_limite_candidature(offre.getNombre_limite_candidature());
        // Ajout des infos RH
        if (offre.getRh() != null) {
            com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO rhDto = new com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO();
            rhDto.setId_utilisateur(offre.getRh().getIdUtilisateur());
            rhDto.setNom(offre.getRh().getNom());
            rhDto.setPrenom(offre.getRh().getPrenom());
            rhDto.setEmail(offre.getRh().getEmail());
            rhDto.setNumero_telephone(offre.getRh().getNumero_telephone());
            rhDto.setType(offre.getRh().getType().name());
            rhDto.setStatut(offre.getRh().getStatut().name());
            dto.setRh_info(rhDto);
        }
        return dto;
    }

    // Vérifie et met à jour le statut de l'offre si besoin
    private void updateStatutIfNeeded(OffreStage offre) {
        if (offre.getStatut() == OffreStage.StatutOffre.en_cours) {
            boolean shouldClose = false;
            // Vérifier la durée de candidature
            if (offre.getDate_publication() != null && offre.getDuree_candidature() != null) {
                java.time.LocalDate finCandidature = offre.getDate_publication().plusDays(offre.getDuree_candidature());
                if (java.time.LocalDate.now().isAfter(finCandidature)) {
                    shouldClose = true;
                }
            }
            // Vérifier le nombre limite de candidatures
            if (offre.getNombre_limite_candidature() != null && getNombreCandidatures(offre.getId()) >= offre.getNombre_limite_candidature()) {
                shouldClose = true;
            }
            if (shouldClose) {
                offre.setStatut(OffreStage.StatutOffre.fermee);
                offreStageRepository.save(offre);
            }
        }
    }

    // Vérifie si l'offre est encore active
    private boolean isStillActive(OffreStage offre) {
        boolean active = true;
        if (offre.getDate_publication() != null && offre.getDuree_candidature() != null) {
            java.time.LocalDate finCandidature = offre.getDate_publication().plusDays(offre.getDuree_candidature());
            if (java.time.LocalDate.now().isAfter(finCandidature)) {
                active = false;
            }
        }
        if (offre.getNombre_limite_candidature() != null && getNombreCandidatures(offre.getId()) >= offre.getNombre_limite_candidature()) {
            active = false;
        }
        return active;
    }

    // À adapter selon votre logique métier pour compter les candidatures
    private int getNombreCandidatures(Integer offreId) {
        return (int) candidatureRepository.findAll().stream()
                .filter(c -> c.getOffre() != null && c.getOffre().getId().equals(offreId))
                .count();
    }


    public List<OffreStageDTO> getOffresByRh(Integer idRh) {
        List<OffreStage> offres = offreStageRepository.findAll().stream()
            .filter(o -> o.getRh() != null && o.getRh().getIdUtilisateur().equals(idRh))
            .collect(Collectors.toList());
        offres.forEach(this::updateStatutIfNeeded);
        return offres.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OffreStageDTO> getOffresPourTraitement(Integer idRh) {
        List<OffreStage> offres = offreStageRepository.findAll().stream()
            .filter(o -> o.getRh() != null && o.getRh().getIdUtilisateur().equals(idRh))
            .filter(o -> o.getStatut() == OffreStage.StatutOffre.en_cours)
            .filter(this::shouldBeClosed)
            .collect(Collectors.toList());
        return offres.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Vérifie si l'offre devrait être fermée selon les critères
    private boolean shouldBeClosed(OffreStage offre) {
        boolean shouldClose = false;
        
        // Vérifier la durée de candidature
        if (offre.getDate_publication() != null && offre.getDuree_candidature() != null) {
            java.time.LocalDate finCandidature = offre.getDate_publication().plusDays(offre.getDuree_candidature());
            if (java.time.LocalDate.now().isAfter(finCandidature)) {
                shouldClose = true;
            }
        }
        
        // Vérifier le nombre limite de candidatures
        if (offre.getNombre_limite_candidature() != null && getNombreCandidatures(offre.getId()) >= offre.getNombre_limite_candidature()) {
            shouldClose = true;
        }
        
        return shouldClose;
    }
}

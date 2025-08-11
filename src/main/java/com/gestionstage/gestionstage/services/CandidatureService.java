// Fichier : CandidatureService.java

package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.dtos.CandidatureDTO;
import com.gestionstage.gestionstage.entities.*;
import com.gestionstage.gestionstage.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidatureService {

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private StagiaireRepository stagiaireRepository;

    @Autowired
    private OffreStageRepository offreStageRepository;

    @Autowired
    private EncadrantRepository encadrantRepository;

    @Autowired
    private EmailService emailService;

    public CandidatureDTO create(CandidatureDTO dto) {
        OffreStage offre = offreStageRepository.findById(dto.getId_offre())
                .orElseThrow(() -> new IllegalArgumentException("Offre introuvable"));
        Stagiaire stagiaire = stagiaireRepository.findById(dto.getId_stagiaire())
                .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable"));

        if (stagiaire.getUtilisateur() == null || stagiaire.getUtilisateur().getType() != Utilisateur.TypeUtilisateur.stagiaire) {
            throw new IllegalArgumentException("L'utilisateur n'est pas un stagiaire");
        }

        Candidature candidature = new Candidature();
        candidature.setDate_soumission(dto.getDate_soumission());
        candidature.setStatut(Candidature.Statut.valueOf(dto.getStatut()));
        candidature.setCv(dto.getCv());
        candidature.setLettre_motivation(dto.getLettre_motivation());
        candidature.setConvention_stage(dto.getConvention_stage());
        candidature.setAttestation(dto.getAttestation());
        candidature.setStagiaire(stagiaire);
        candidature.setOffre(offre);

        candidature = candidatureRepository.save(candidature);
        dto.setId(candidature.getId());
        return dto;
    }

    public void changerStatut(Integer id, String nouveauStatut) {
        Candidature candidature = candidatureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

        candidature.setStatut(Candidature.Statut.valueOf(nouveauStatut));
        candidatureRepository.save(candidature);

        String emailStagiaire = candidature.getStagiaire().getUtilisateur().getEmail();
        String sujet = "Mise à jour de votre candidature";
        String contenu;

        if ("acceptee".equalsIgnoreCase(nouveauStatut)) {
            contenu = "<p>Votre candidature a été <strong>acceptée</strong>. Merci de déposer votre convention de stage sur la plateforme.</p>";
        } else if ("refusee".equalsIgnoreCase(nouveauStatut)) {
            contenu = "<p>Votre candidature a été <strong>refusée</strong>. Merci pour votre intérêt.</p>";
        } else {
            contenu = "<p>Le statut de votre candidature a été mis à jour : " + nouveauStatut + "</p>";
        }

        emailService.envoyerEmailHtml(emailStagiaire, sujet, contenu);
    }

    public void uploadDocument(Integer idCandidature, String type, byte[] fileData) {
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

        if ("convention".equals(type)) {
            candidature.setConvention_stage(fileData);
            candidatureRepository.save(candidature);

            String emailRh = candidature.getOffre().getRh().getEmail();
            emailService.envoyerEmailHtml(emailRh, "Convention de stage à signer",
                    "<p>Une convention a été déposée pour l'offre : <strong>" +
                            candidature.getOffre().getTitre() + "</strong>. Merci de la signer.</p>");
        } else if ("attestation".equals(type)) {
            candidature.setAttestation(fileData);
            candidatureRepository.save(candidature);
        } else {
            throw new IllegalArgumentException("Type de document non supporté");
        }
    }

    public void confirmationConventionRemiseParRH(Integer idCandidature) {
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));
        String emailStagiaire = candidature.getStagiaire().getUtilisateur().getEmail();
        emailService.envoyerEmailHtml(emailStagiaire, "Convention signée",
                "<p>Votre convention a été signée et remise par le RH.</p>");
    }

    public void affecterEncadrant(Integer idCandidature, Integer idEncadrant) {
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

        Encadrant encadrant = encadrantRepository.findById(idEncadrant)
                .orElseThrow(() -> new IllegalArgumentException("Encadrant introuvable"));

        candidature.setEncadrant(encadrant);
        candidatureRepository.save(candidature);

        String emailEncadrant = encadrant.getUtilisateur().getEmail();
        emailService.envoyerEmailHtml(emailEncadrant, "Affectation d'un stagiaire",
                "<p>Vous avez été affecté en tant qu'encadrant pour : <strong>"
                        + candidature.getOffre().getTitre() + "</strong>.</p>");
    }

    public void notifierFinStage(Integer idCandidature) {
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));
        String emailStagiaire = candidature.getStagiaire().getUtilisateur().getEmail();
        emailService.envoyerEmailHtml(emailStagiaire, "Fin de stage",
                "<p>Votre stage est terminé. Merci de déposer votre rapport final.</p>");
    }

    public void notifierEvaluationParEncadrant(Integer idCandidature) {
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));
        String emailEncadrant = candidature.getEncadrant().getUtilisateur().getEmail();
        emailService.envoyerEmailHtml(emailEncadrant, "Evaluation stagiaire",
                "<p>Merci d'évaluer le stagiaire sur la plateforme.</p>");
    }

    public void notifierAttestationPourRH(Integer idStagiaire) {
        Candidature candidature = candidatureRepository.findByStagiaireId(idStagiaire)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));
        String emailRh = candidature.getOffre().getRh().getEmail();
        emailService.envoyerEmailHtml(emailRh, "Attestation de stage",
                "<p>Merci de déposer l'attestation de stage.</p>");
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void verifierFinStageAutomatiquement() {
        List<Candidature> candidatures = candidatureRepository.findAll();
        LocalDate today = LocalDate.now();
        for (Candidature c : candidatures) {
            if (c.getOffre().getDate_fin() != null && c.getOffre().getDate_fin().isEqual(today)) {
                notifierFinStage(c.getId());
            }
        }
    }


    public void deposerConventionSigneeParRH(Integer idCandidature, byte[] fichierConventionSignee) {
    Candidature candidature = candidatureRepository.findById(idCandidature)
            .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

    // Met à jour la convention signée
    candidature.setConvention_stage(fichierConventionSignee);
    candidatureRepository.save(candidature);

    // Envoie l’email au RH pour demander de déposer l’attestation
    Integer idStagiaire = candidature.getStagiaire().getId();
    notifierAttestationPourRH(idStagiaire);
}


    public List<CandidatureDTO> getAll() {
        return candidatureRepository.findAll().stream().map(c -> {
            CandidatureDTO dto = new CandidatureDTO();
            dto.setId(c.getId());
            dto.setId_stagiaire(c.getStagiaire().getId());
            dto.setId_offre(c.getOffre().getId());
            dto.setStatut(c.getStatut().name());
            dto.setDate_soumission(c.getDate_soumission());
            return dto;
        }).collect(Collectors.toList());
    }
}

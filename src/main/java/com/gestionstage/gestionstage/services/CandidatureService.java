// Fichier : CandidatureService.java

package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.dtos.CandidatureDTO;
import com.gestionstage.gestionstage.dtos.EncadrantDTO;
import com.gestionstage.gestionstage.dtos.OffreStageDTO;
import com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO;
import com.gestionstage.gestionstage.dtos.EncadrantDTO;
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

    public CandidatureDTO createByUtilisateur(CandidatureDTO dto) {
        OffreStage offre = offreStageRepository.findById(dto.getId_offre())
                .orElseThrow(() -> new IllegalArgumentException("Offre introuvable"));
        
        // Vérifier que la date limite n'est pas dépassée
        if (offre.getDate_fin() != null && LocalDate.now().isAfter(offre.getDate_fin())) {
            throw new IllegalArgumentException("Impossible de postuler : la date limite de l'offre est dépassée");
        }

        // Vérifier que l'offre est encore ouverte
        if (offre.getStatut() != OffreStage.StatutOffre.en_cours) {
            throw new IllegalArgumentException("Impossible de postuler : l'offre n'est plus ouverte");
        }
        
        // Trouver le stagiaire à partir de l'ID utilisateur
        Stagiaire stagiaire = stagiaireRepository.findByUtilisateurIdUtilisateur(dto.getId_utilisateur())
                .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable pour cet utilisateur"));

        // S'assurer que l'id_stagiaire est défini
        if (stagiaire.getId_stagiaire() == null) {
            stagiaire.setId_stagiaire(dto.getId_utilisateur());
        }

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
        dto.setId_stagiaire(stagiaire.getId_stagiaire()); // Utiliser id_stagiaire au lieu de id
        return dto;
    }

    public CandidatureDTO updateCandidatureDocuments(Integer idCandidature, Integer idUtilisateur, 
                                                    byte[] nouveauCv, byte[] nouvelleLettreMotivation) {
        // Récupérer la candidature
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

        // Vérifier que la candidature appartient bien au stagiaire
        Stagiaire stagiaire = stagiaireRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable"));
        
        if (!candidature.getStagiaire().getId_stagiaire().equals(stagiaire.getId_stagiaire())) {
            throw new IllegalArgumentException("Vous ne pouvez modifier que vos propres candidatures");
        }

        // Vérifier que la date limite n'est pas dépassée
        LocalDate dateFinOffre = candidature.getOffre().getDate_fin();
        if (dateFinOffre != null && LocalDate.now().isAfter(dateFinOffre)) {
            throw new IllegalArgumentException("Impossible de modifier la candidature : la date limite de l'offre est dépassée");
        }

        // Vérifier que la candidature est encore modifiable (en_attente)
        if (candidature.getStatut() != Candidature.Statut.en_attente) {
            throw new IllegalArgumentException("Impossible de modifier une candidature qui n'est plus en attente");
        }

        // Mettre à jour les documents
        if (nouveauCv != null) {
            candidature.setCv(nouveauCv);
        }
        if (nouvelleLettreMotivation != null) {
            candidature.setLettre_motivation(nouvelleLettreMotivation);
        }

        candidature = candidatureRepository.save(candidature);

        // Retourner le DTO mis à jour
        return convertToDTO(candidature);
    }

    private CandidatureDTO convertToDTO(Candidature candidature) {
        CandidatureDTO dto = new CandidatureDTO();
        dto.setId(candidature.getId());
        dto.setId_stagiaire(candidature.getStagiaire().getId_stagiaire());
        dto.setId_offre(candidature.getOffre().getId());
        dto.setStatut(candidature.getStatut().name());
        dto.setDate_soumission(candidature.getDate_soumission());
        dto.setCv(candidature.getCv());
        dto.setLettre_motivation(candidature.getLettre_motivation());
        dto.setConvention_stage(candidature.getConvention_stage());
        dto.setAttestation(candidature.getAttestation());
        
        if (candidature.getEncadrant() != null) {
            dto.setId_encadrant(candidature.getEncadrant().getId());
        }

        // Ajouter les informations de l'offre
        OffreStageDTO offreDTO = new OffreStageDTO();
        offreDTO.setId(candidature.getOffre().getId());
        offreDTO.setId_rh(candidature.getOffre().getRh().getIdUtilisateur());
        offreDTO.setTitre(candidature.getOffre().getTitre());
        offreDTO.setDescription(candidature.getOffre().getDescription());
        offreDTO.setDate_debut(candidature.getOffre().getDate_debut());
        offreDTO.setDate_fin(candidature.getOffre().getDate_fin());
        offreDTO.setDuree(candidature.getOffre().getDuree());
        offreDTO.setStatut(candidature.getOffre().getStatut().name());
        offreDTO.setLocalisation(candidature.getOffre().getLocalisation());
        offreDTO.setCompetence_requise(candidature.getOffre().getCompetence_requise());
        dto.setOffre_info(offreDTO);

        return dto;
    }

    public void deleteCandidature(Integer idCandidature, Integer idUtilisateur) {
        // Récupérer la candidature
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

        // Vérifier que la candidature appartient bien au stagiaire
        Stagiaire stagiaire = stagiaireRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable"));
        
        if (!candidature.getStagiaire().getId_stagiaire().equals(stagiaire.getId_stagiaire())) {
            throw new IllegalArgumentException("Vous ne pouvez supprimer que vos propres candidatures");
        }

        // Vérifier que la date limite n'est pas dépassée
        LocalDate dateFinOffre = candidature.getOffre().getDate_fin();
        if (dateFinOffre != null && LocalDate.now().isAfter(dateFinOffre)) {
            throw new IllegalArgumentException("Impossible de supprimer la candidature : la date limite de l'offre est dépassée");
        }

        // Vérifier que la candidature est encore supprimable (en_attente)
        if (candidature.getStatut() != Candidature.Statut.en_attente) {
            throw new IllegalArgumentException("Impossible de supprimer une candidature qui n'est plus en attente");
        }

        // Supprimer la candidature
        candidatureRepository.delete(candidature);
    }

    public void changerStatut(Integer id, String nouveauStatut) {
        Candidature candidature = candidatureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));

        candidature.setStatut(Candidature.Statut.valueOf(nouveauStatut));
        
        // Enregistrer la date d'acceptation si la candidature est acceptée
        if ("acceptee".equalsIgnoreCase(nouveauStatut)) {
            candidature.setDate_acceptation(LocalDate.now());
            
            // Fermer l'offre de stage une fois qu'une candidature est acceptée
            OffreStage offre = candidature.getOffre();
            offre.setStatut(OffreStage.StatutOffre.fermee);
            offreStageRepository.save(offre);
            
            // Refuser automatiquement toutes les autres candidatures en attente pour cette offre
            List<Candidature> autresCandidatures = candidatureRepository.findCandidaturesEnAttenteByOffre(offre.getId())
                    .stream()
                    .filter(c -> !c.getId().equals(candidature.getId()))
                    .toList();
            
            for (Candidature autreCandidature : autresCandidatures) {
                autreCandidature.setStatut(Candidature.Statut.refusee);
                candidatureRepository.save(autreCandidature);
                
                // Envoyer email de notification aux autres stagiaires
                String emailAutreStagiaire = autreCandidature.getStagiaire().getUtilisateur().getEmail();
                String sujetRefus = "Candidature refusée - Offre pourvue";
                String contenuRefus = "<p>Votre candidature a été <strong>refusée</strong> car l'offre de stage a été pourvue par un autre candidat.</p>" +
                        "<p>Merci pour votre intérêt et n'hésitez pas à postuler pour d'autres offres.</p>";
                emailService.envoyerEmailHtml(emailAutreStagiaire, sujetRefus, contenuRefus);
            }
            
            // Log pour traçabilité
            if (autresCandidatures.size() > 0) {
                System.out.println("Offre " + offre.getId() + " fermée automatiquement. " + 
                                 autresCandidatures.size() + " candidature(s) refusée(s) automatiquement.");
            }
        }
        
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
        System.out.println("Tentative d'upload pour la candidature ID: " + idCandidature);
        System.out.println("Type de document: " + type);
        Candidature candidature = candidatureRepository.findById(idCandidature)
                .orElseThrow(() -> new IllegalArgumentException("Candidature introuvable"));
        System.out.println("Candidature trouvée: " + candidature.getId());

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

    // Met à jour la convention signée (nouvelle colonne distincte)
    candidature.setConvention_signee(fichierConventionSignee);
    candidatureRepository.save(candidature);

    // Envoie l'email au RH pour demander de déposer l'attestation
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

    public List<CandidatureDTO> getCandidaturesAcceptees() {
        return candidatureRepository.findByStatut(Candidature.Statut.acceptee).stream().map(c -> {
            CandidatureDTO dto = new CandidatureDTO();
            dto.setId(c.getId());
            dto.setId_stagiaire(c.getStagiaire().getId());
            dto.setId_offre(c.getOffre().getId());
            dto.setStatut(c.getStatut().name());
            dto.setDate_soumission(c.getDate_soumission());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<CandidatureDTO> getCandidaturesAccepteesByUtilisateur(Integer idUtilisateur) {
        return candidatureRepository.findByUtilisateurIdAndStatut(idUtilisateur, Candidature.Statut.acceptee)
                .stream().map(c -> {
                    CandidatureDTO dto = new CandidatureDTO();
                    dto.setId(c.getId());
                    dto.setId_stagiaire(c.getStagiaire().getId());
                    dto.setId_offre(c.getOffre().getId());
                    dto.setStatut(c.getStatut().name());
                    dto.setDate_soumission(c.getDate_soumission());
                    dto.setDate_acceptation(c.getDate_acceptation());
                    dto.setId_encadrant(c.getEncadrant() != null ? c.getEncadrant().getId() : null);
                    
                    // Ajouter les documents (convention et attestation)
                    dto.setConvention_stage(c.getConvention_stage());
                    dto.setConvention_signee(c.getConvention_signee());
                    dto.setAttestation(c.getAttestation());
                    
                    // Ajouter les informations de l'offre
                    OffreStageDTO offreDTO = new OffreStageDTO();
                    offreDTO.setId(c.getOffre().getId());
                    offreDTO.setId_rh(c.getOffre().getRh().getIdUtilisateur());
                    offreDTO.setTitre(c.getOffre().getTitre());
                    offreDTO.setDescription(c.getOffre().getDescription());
                    offreDTO.setDate_debut(c.getOffre().getDate_debut());
                    offreDTO.setDate_fin(c.getOffre().getDate_fin());
                    offreDTO.setDuree(c.getOffre().getDuree());
                    offreDTO.setStatut(c.getOffre().getStatut().name());
                    offreDTO.setLocalisation(c.getOffre().getLocalisation());
                    offreDTO.setCompetence_requise(c.getOffre().getCompetence_requise());
                    dto.setOffre_info(offreDTO);
                    
                    // Ajouter les informations de l'encadrant (si assigné)
                    if (c.getEncadrant() != null && c.getEncadrant().getUtilisateur() != null) {
                        dto.setEncadrant_info(createUtilisateurDTO(c.getEncadrant().getUtilisateur()));
                    }
                    
                    // Ajouter les informations du RH qui a créé l'offre
                    if (c.getOffre().getRh() != null) {
                        dto.setRh_info(createUtilisateurDTO(c.getOffre().getRh()));
                    }
                    
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<CandidatureDTO> getCandidaturesByStagiaire(Integer idStagiaire) {
        // Vérifier que le stagiaire existe
        stagiaireRepository.findById(idStagiaire)
                .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable"));
        
        return candidatureRepository.findAll().stream()
                .filter(c -> c.getStagiaire().getId().equals(idStagiaire))
                .map(c -> {
                    CandidatureDTO dto = new CandidatureDTO();
                    dto.setId(c.getId());
                    dto.setId_stagiaire(c.getStagiaire().getId());
                    dto.setId_offre(c.getOffre().getId());
                    dto.setStatut(c.getStatut().name());
                    dto.setDate_soumission(c.getDate_soumission());
                    dto.setDate_acceptation(c.getDate_acceptation());
                    
                    // Ajouter CV et lettre de motivation
                    dto.setCv(c.getCv());
                    dto.setLettre_motivation(c.getLettre_motivation());
                    dto.setConvention_stage(c.getConvention_stage());
                    dto.setConvention_signee(c.getConvention_signee());
                    dto.setAttestation(c.getAttestation());
                    
                    // Ajouter l'ID de l'encadrant s'il existe
                    if (c.getEncadrant() != null) {
                        dto.setId_encadrant(c.getEncadrant().getId());
                    }
                    
                    // Ajouter les informations de l'offre
                    OffreStageDTO offreDTO = new OffreStageDTO();
                    offreDTO.setId(c.getOffre().getId());
                    offreDTO.setId_rh(c.getOffre().getRh().getIdUtilisateur());
                    offreDTO.setTitre(c.getOffre().getTitre());
                    offreDTO.setDescription(c.getOffre().getDescription());
                    offreDTO.setDate_debut(c.getOffre().getDate_debut());
                    offreDTO.setDate_fin(c.getOffre().getDate_fin());
                    offreDTO.setDuree(c.getOffre().getDuree());
                    offreDTO.setStatut(c.getOffre().getStatut().name());
                    offreDTO.setLocalisation(c.getOffre().getLocalisation());
                    offreDTO.setCompetence_requise(c.getOffre().getCompetence_requise());
                    dto.setOffre_info(offreDTO);
                    
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<CandidatureDTO> getCandidaturesByUtilisateur(Integer idUtilisateur) {
        // Trouver le stagiaire à partir de l'ID utilisateur
        Stagiaire stagiaire = stagiaireRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable pour cet utilisateur"));
        
        return getCandidaturesByStagiaire(stagiaire.getId());
    }

    private UtilisateurCompletDTO createUtilisateurDTO(Utilisateur utilisateur) {
        if (utilisateur == null) return null;
        
        UtilisateurCompletDTO dto = new UtilisateurCompletDTO();
        dto.setId_utilisateur(utilisateur.getIdUtilisateur());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setNumero_telephone(utilisateur.getNumero_telephone());
        dto.setType(utilisateur.getType().name());
        dto.setStatut(utilisateur.getStatut().name());

        // Cas encadrant
        if (utilisateur.getType() == Utilisateur.TypeUtilisateur.encadrant) {
            encadrantRepository.findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur())
                    .ifPresent(encadrant -> {
                        EncadrantDTO encadrantDTO = new EncadrantDTO();
                        encadrantDTO.setId(encadrant.getId());
                        encadrantDTO.setId_encadrant(encadrant.getUtilisateur().getIdUtilisateur());
                        encadrantDTO.setDepartement(encadrant.getDepartement());
                        dto.setEncadrant_info(encadrantDTO);
                    });
        }

        return dto;
    }

    /**
     * Tâche programmée qui s'exécute tous les jours à 09:00
     * Vérifie les candidatures acceptées sans convention après 7 jours
     */
    @Scheduled(cron = "0 0 9 * * *") // Tous les jours à 9h00
    public void verifierConventionsManquantes() {
        LocalDate dateLimit = LocalDate.now().minusDays(7);
        
        // Utiliser la méthode optimisée du repository
        List<Candidature> candidaturesEnRetard = candidatureRepository.findCandidaturesAccepteesEnRetard(dateLimit);

        for (Candidature candidature : candidaturesEnRetard) {
            // Changer le statut à refusée
            candidature.setStatut(Candidature.Statut.refusee);
            candidatureRepository.save(candidature);

            // Envoyer email de notification au stagiaire
            String emailStagiaire = candidature.getStagiaire().getUtilisateur().getEmail();
            String sujet = "Candidature refusée - Convention non déposée";
            String contenu = "<p>Votre candidature a été automatiquement <strong>refusée</strong> car vous n'avez pas déposé votre convention de stage dans les 7 jours suivant l'acceptation.</p>" +
                    "<p>Pour toute réclamation, veuillez contacter le service RH.</p>";

            emailService.envoyerEmailHtml(emailStagiaire, sujet, contenu);
            
            System.out.println("Candidature " + candidature.getId() + " refusée automatiquement - Convention non déposée dans les délais");
        }
        
        if (candidaturesEnRetard.size() > 0) {
            System.out.println("Vérification automatique: " + candidaturesEnRetard.size() + " candidature(s) refusée(s) pour convention manquante");
        }
    }
}

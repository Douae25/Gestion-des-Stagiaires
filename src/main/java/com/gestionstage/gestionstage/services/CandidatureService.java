// Fichier : CandidatureService.java

package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.dtos.CandidatureDTO;
import com.gestionstage.gestionstage.dtos.EncadrantDTO;
import com.gestionstage.gestionstage.dtos.OffreStageDTO;
import com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO;
import com.gestionstage.gestionstage.dtos.EncadrantDTO;
import com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsEtEvaluationDTO;
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

    @Autowired
    private RapportRepository rapportRepository;

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private OffreStageService offreStageService;

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

    public CandidatureDTO toDTO(Candidature candidature) {
        CandidatureDTO dto = new CandidatureDTO();
        dto.setId(candidature.getId());
        dto.setId_stagiaire(candidature.getStagiaire().getId());
        dto.setId_offre(candidature.getOffre().getId());
        dto.setStatut(candidature.getStatut().name());
        dto.setDate_soumission(candidature.getDate_soumission());
        dto.setDate_acceptation(candidature.getDate_acceptation());
        dto.setCv(candidature.getCv());
        dto.setLettre_motivation(candidature.getLettre_motivation());
        dto.setConvention_stage(candidature.getConvention_stage());
        dto.setConvention_signee(candidature.getConvention_signee());
        dto.setAttestation(candidature.getAttestation());
        if (candidature.getEncadrant() != null) {
            dto.setId_encadrant(candidature.getEncadrant().getId());
            dto.setEncadrant_info(createUtilisateurDTO(candidature.getEncadrant().getUtilisateur()));
        }
        if (candidature.getStagiaire() != null && candidature.getStagiaire().getUtilisateur() != null) {
            dto.setStagiaire_info(createUtilisateurDTO(candidature.getStagiaire().getUtilisateur()));
        }
        if (candidature.getOffre() != null) {
            OffreStageDTO offreDTO = offreStageService.toDTO(candidature.getOffre());
            dto.setOffre_info(offreDTO);
        }
        return dto;
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

    // Envoie un email au stagiaire pour l'informer que la convention signée a été déposée et que le stage commence
    String emailStagiaire = candidature.getStagiaire().getUtilisateur().getEmail();
    String sujet = "Convention signée déposée - Début du stage";
    String contenu = "<p>Votre convention de stage signée a été déposée. Votre stage commence officiellement. Bonne chance !</p>";
    emailService.envoyerEmailHtml(emailStagiaire, sujet, contenu);
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

    public List<CandidatureDTO> getCandidaturesByOffre(Integer idOffre) {
        List<Candidature> candidatures = candidatureRepository.findAll().stream()
                .filter(c -> c.getOffre() != null && c.getOffre().getId().equals(idOffre))
                .collect(Collectors.toList());
        
        return candidatures.stream().map(candidature -> {
            CandidatureDTO dto = new CandidatureDTO();
            dto.setId(candidature.getId());
            dto.setId_utilisateur(candidature.getStagiaire().getUtilisateur().getIdUtilisateur());
            dto.setId_stagiaire(candidature.getStagiaire().getId());
            dto.setId_offre(candidature.getOffre().getId());
            dto.setStatut(candidature.getStatut().name());
            dto.setDate_soumission(candidature.getDate_soumission());
            dto.setDate_acceptation(candidature.getDate_acceptation());
            dto.setLettre_motivation(candidature.getLettre_motivation());
            dto.setCv(candidature.getCv());
            dto.setConvention_stage(candidature.getConvention_stage());
            dto.setConvention_signee(candidature.getConvention_signee());
            dto.setAttestation(candidature.getAttestation());
            
            // Ajout des infos du stagiaire
            if (candidature.getStagiaire() != null && candidature.getStagiaire().getUtilisateur() != null) {
                dto.setStagiaire_info(createUtilisateurDTO(candidature.getStagiaire().getUtilisateur()));
            }
            
            // Ajout des infos encadrant si assigné
            if (candidature.getEncadrant() != null) {
                dto.setId_encadrant(candidature.getEncadrant().getId());
                dto.setEncadrant_info(createUtilisateurDTO(candidature.getEncadrant().getUtilisateur()));
            }
            
            // Ajout des infos de l'offre
            if (candidature.getOffre() != null) {
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
                offreDTO.setDate_publication(candidature.getOffre().getDate_publication());
                offreDTO.setDuree_candidature(candidature.getOffre().getDuree_candidature());
                offreDTO.setNombre_limite_candidature(candidature.getOffre().getNombre_limite_candidature());
                
                // Ajout des infos RH
                if (candidature.getOffre().getRh() != null) {
                    offreDTO.setRh_info(createUtilisateurDTO(candidature.getOffre().getRh()));
                    dto.setRh_info(createUtilisateurDTO(candidature.getOffre().getRh()));
                }
                
                dto.setOffre_info(offreDTO);
            }
            
            return dto;
        }).collect(Collectors.toList());
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

    public List<CandidatureDTO> getCandidaturesAccepteesAvecConventionNonSigneeByRh(Integer idRh) {
        return candidatureRepository.findAll().stream()
            .filter(c -> c.getOffre() != null && c.getOffre().getRh() != null && c.getOffre().getRh().getIdUtilisateur().equals(idRh))
            .filter(c -> c.getStatut().name().equalsIgnoreCase("acceptee"))
            .filter(c -> c.getConvention_stage() != null && c.getConvention_signee() == null)
            .map(candidature -> {
                CandidatureDTO dto = new CandidatureDTO();
                dto.setId(candidature.getId());
                dto.setId_utilisateur(candidature.getStagiaire().getUtilisateur().getIdUtilisateur());
                dto.setId_stagiaire(candidature.getStagiaire().getId());
                dto.setId_offre(candidature.getOffre().getId());
                dto.setStatut(candidature.getStatut().name());
                dto.setDate_soumission(candidature.getDate_soumission());
                dto.setDate_acceptation(candidature.getDate_acceptation());
                dto.setLettre_motivation(candidature.getLettre_motivation());
                dto.setCv(candidature.getCv());
                dto.setConvention_stage(candidature.getConvention_stage());
                dto.setConvention_signee(candidature.getConvention_signee());
                dto.setAttestation(candidature.getAttestation());
                dto.setId_encadrant(candidature.getEncadrant() != null ? candidature.getEncadrant().getId() : null);
                // Infos stagiaire
                if (candidature.getStagiaire() != null && candidature.getStagiaire().getUtilisateur() != null) {
                    dto.setStagiaire_info(createUtilisateurDTO(candidature.getStagiaire().getUtilisateur()));
                }
                // Infos encadrant
                if (candidature.getEncadrant() != null) {
                    dto.setEncadrant_info(createUtilisateurDTO(candidature.getEncadrant().getUtilisateur()));
                }
                // Infos offre
                if (candidature.getOffre() != null) {
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
                    offreDTO.setDate_publication(candidature.getOffre().getDate_publication());
                    offreDTO.setDuree_candidature(candidature.getOffre().getDuree_candidature());
                    offreDTO.setNombre_limite_candidature(candidature.getOffre().getNombre_limite_candidature());
                    // Infos RH
                    if (candidature.getOffre().getRh() != null) {
                        offreDTO.setRh_info(createUtilisateurDTO(candidature.getOffre().getRh()));
                        dto.setRh_info(createUtilisateurDTO(candidature.getOffre().getRh()));
                    }
                    dto.setOffre_info(offreDTO);
                }
                return dto;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    public List<com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsEtEvaluationDTO> getCandidaturesFinalisees() {
        List<CandidatureAvecRapportsEtEvaluationDTO> result = new java.util.ArrayList<>();
        List<Candidature> candidatures = candidatureRepository.findAll();
        for (Candidature c : candidatures) {
            System.out.println("Candidature id=" + c.getId() + ", statut=" + c.getStatut() + ", convention_signee=" + (c.getConvention_signee() != null) + ", offre.date_fin=" + (c.getOffre() != null ? c.getOffre().getDate_fin() : null));
            if (!c.getStatut().name().equalsIgnoreCase("acceptee")) continue;
            if (c.getConvention_signee() == null) continue;
            if (c.getOffre() == null || c.getOffre().getDate_fin() == null || java.time.LocalDate.now().isBefore(c.getOffre().getDate_fin())) continue;
            List<com.gestionstage.gestionstage.entities.Rapport> rapports = rapportRepository.findByCandidatureId(c.getId());
            boolean hasRapportFinal = rapports.stream().anyMatch(r -> {
                boolean match = "Rapport final de stage".equalsIgnoreCase(r.getTitre());
                if (match) {
                    System.out.println("Rapport final trouvé pour candidature id=" + c.getId() + ", rapport id=" + r.getId());
                }
                return match;
            });
            if (!hasRapportFinal) {
                System.out.println("Aucun rapport final pour candidature id=" + c.getId());
                continue;
            }
            java.util.Optional<com.gestionstage.gestionstage.entities.Evaluation> evaluationOpt = evaluationRepository.findByStagiaireIdAndEncadrantId(
                c.getStagiaire().getId_stagiaire(),
                c.getEncadrant() != null ? c.getEncadrant().getId() : null
            );
            if (!evaluationOpt.isPresent()) {
                System.out.println("Aucune évaluation pour stagiaire id=" + c.getStagiaire().getId() + ", encadrant id=" + (c.getEncadrant() != null ? c.getEncadrant().getId() : null));
                continue;
            }
            com.gestionstage.gestionstage.entities.Evaluation evaluation = evaluationOpt.get();
            System.out.println("Évaluation trouvée pour candidature id=" + c.getId() + ", évaluation id=" + evaluation.getId());
            CandidatureAvecRapportsEtEvaluationDTO dto = new CandidatureAvecRapportsEtEvaluationDTO();
            dto.setCandidature(toDTO(c));
            dto.setOffre(c.getOffre() != null ? offreStageService.toDTO(c.getOffre()) : null);
            dto.setStagiaire_info(createUtilisateurDTO(c.getStagiaire().getUtilisateur()));
            if (c.getEncadrant() != null) {
                dto.setEncadrant_info(createUtilisateurDTO(c.getEncadrant().getUtilisateur()));
            }
            com.gestionstage.gestionstage.entities.Rapport rapportFinal = rapports.stream().filter(r -> "Rapport final de stage".equalsIgnoreCase(r.getTitre())).findFirst().orElse(null);
            if (rapportFinal != null) {
                com.gestionstage.gestionstage.dtos.RapportDTO rapportDTO = new com.gestionstage.gestionstage.dtos.RapportDTO();
                rapportDTO.setId(rapportFinal.getId());
                rapportDTO.setTitre(rapportFinal.getTitre());
                rapportDTO.setDateDepot(rapportFinal.getDateDepot());
                rapportDTO.setDocument(rapportFinal.getDocument());
                dto.setRapport_final(rapportDTO);
            }
            if (evaluation != null) {
                com.gestionstage.gestionstage.dtos.EvaluationDTO evalDTO = new com.gestionstage.gestionstage.dtos.EvaluationDTO();
                evalDTO.setId(evaluation.getId());
                evalDTO.setNote(evaluation.getNote());
                evalDTO.setCommentaire(evaluation.getCommentaire());
                evalDTO.setDateEvaluation(evaluation.getDate_evaluation());
                evalDTO.setId_stagiaire(evaluation.getStagiaire() != null ? evaluation.getStagiaire().getId_stagiaire() : null);
                evalDTO.setId_encadrant(evaluation.getEncadrant() != null ? evaluation.getEncadrant().getId() : null);
                dto.setEvaluation(evalDTO);
            }
            result.add(dto);
        }
        System.out.println("Nombre de candidatures finalisées trouvées : " + result.size());
        return result;
    }

    public List<com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsEtEvaluationDTO> getCandidaturesFinaliseesByRh(Integer idRh) {
        List<CandidatureAvecRapportsEtEvaluationDTO> result = new java.util.ArrayList<>();
        List<Candidature> candidatures = candidatureRepository.findAll();
        for (Candidature c : candidatures) {
            if (c.getOffre() == null || c.getOffre().getRh() == null || !c.getOffre().getRh().getIdUtilisateur().equals(idRh)) continue;
            System.out.println("Candidature id=" + c.getId() + ", stagiaire.id_stagiaire=" + (c.getStagiaire() != null ? c.getStagiaire().getId_stagiaire() : null) + ", encadrant.id=" + (c.getEncadrant() != null ? c.getEncadrant().getId() : null));
            if (!c.getStatut().name().equalsIgnoreCase("acceptee")) continue;
            if (c.getConvention_signee() == null) continue;
            if (c.getOffre().getDate_fin() == null || java.time.LocalDate.now().isBefore(c.getOffre().getDate_fin())) continue;
            List<Rapport> rapports = rapportRepository.findByCandidatureId(c.getId());
            boolean hasRapportFinal = rapports.stream().anyMatch(r -> {
                boolean match = "Rapport final de stage".equalsIgnoreCase(r.getTitre());
                if (match) {
                    System.out.println("Rapport final trouvé pour candidature id=" + c.getId() + ", rapport id=" + r.getId());
                }
                return match;
            });
            if (!hasRapportFinal) {
                System.out.println("Aucun rapport final pour candidature id=" + c.getId());
                continue;
            }
            java.util.Optional<Evaluation> evaluationOpt = evaluationRepository.findByStagiaireIdAndEncadrantId(
                c.getStagiaire().getId_stagiaire(),
                c.getEncadrant() != null ? c.getEncadrant().getId() : null
            );
            if (!evaluationOpt.isPresent()) {
                System.out.println("Aucune évaluation pour stagiaire id=" + c.getStagiaire().getId_stagiaire() + ", encadrant id=" + (c.getEncadrant() != null ? c.getEncadrant().getId() : null));
                continue;
            }
            Evaluation evaluation = evaluationOpt.get();
            System.out.println("Évaluation trouvée pour candidature id=" + c.getId() + ", évaluation id=" + evaluation.getId());
            CandidatureAvecRapportsEtEvaluationDTO dto = new CandidatureAvecRapportsEtEvaluationDTO();
            dto.setCandidature(toDTO(c));
            dto.setOffre(c.getOffre() != null ? offreStageService.toDTO(c.getOffre()) : null);
            dto.setStagiaire_info(createUtilisateurDTO(c.getStagiaire().getUtilisateur()));
            if (c.getEncadrant() != null) {
                dto.setEncadrant_info(createUtilisateurDTO(c.getEncadrant().getUtilisateur()));
            }
            Rapport rapportFinal = rapports.stream().filter(r -> "Rapport final de stage".equalsIgnoreCase(r.getTitre())).findFirst().orElse(null);
            if (rapportFinal != null) {
                com.gestionstage.gestionstage.dtos.RapportDTO rapportDTO = new com.gestionstage.gestionstage.dtos.RapportDTO();
                rapportDTO.setId(rapportFinal.getId());
                rapportDTO.setTitre(rapportFinal.getTitre());
                rapportDTO.setDateDepot(rapportFinal.getDateDepot());
                rapportDTO.setDocument(rapportFinal.getDocument());
                dto.setRapport_final(rapportDTO);
            }
            if (evaluation != null) {
                com.gestionstage.gestionstage.dtos.EvaluationDTO evalDTO = new com.gestionstage.gestionstage.dtos.EvaluationDTO();
                evalDTO.setId(evaluation.getId());
                evalDTO.setNote(evaluation.getNote());
                evalDTO.setCommentaire(evaluation.getCommentaire());
                evalDTO.setDateEvaluation(evaluation.getDate_evaluation());
                evalDTO.setId_stagiaire(evaluation.getStagiaire() != null ? evaluation.getStagiaire().getId_stagiaire() : null);
                evalDTO.setId_encadrant(evaluation.getEncadrant() != null ? evaluation.getEncadrant().getId() : null);
                dto.setEvaluation(evalDTO);
            }
            result.add(dto);
        }
        System.out.println("Nombre de candidatures finalisées trouvées pour RH id=" + idRh + " : " + result.size());
        return result;
    }


        @Autowired
    private CommentaireRepository commentaireRepository;
    public List<com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO> getCandidaturesEnCours() {
        List<com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO> result = new java.util.ArrayList<>();
        List<Candidature> candidatures = candidatureRepository.findAll();
        for (Candidature c : candidatures) {
            if (!c.getStatut().name().equalsIgnoreCase("acceptee")) continue;
            if (c.getConvention_stage() == null) continue;
            if (c.getAttestation() != null) continue;
            com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO dto = new com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO();
            dto.setCandidature(toDTO(c));
            dto.setOffre(c.getOffre() != null ? offreStageService.toDTO(c.getOffre()) : null);
            // Mapping stagiaire
            if (c.getStagiaire() != null && c.getStagiaire().getUtilisateur() != null) {
                com.gestionstage.gestionstage.dtos.StagiaireDTO stagiaireDTO = new com.gestionstage.gestionstage.dtos.StagiaireDTO();
                stagiaireDTO.setId(c.getStagiaire().getId_stagiaire());
                stagiaireDTO.setNom(c.getStagiaire().getUtilisateur().getNom());
                stagiaireDTO.setPrenom(c.getStagiaire().getUtilisateur().getPrenom());
                stagiaireDTO.setEmail(c.getStagiaire().getUtilisateur().getEmail());
                dto.setStagiaire(stagiaireDTO);
            }
            // Mapping encadrant
            if (c.getEncadrant() != null && c.getEncadrant().getUtilisateur() != null) {
                com.gestionstage.gestionstage.dtos.EncadrantDTO encadrantDTO = new com.gestionstage.gestionstage.dtos.EncadrantDTO();
                encadrantDTO.setId(c.getEncadrant().getId());
                encadrantDTO.setNom(c.getEncadrant().getUtilisateur().getNom());
                encadrantDTO.setPrenom(c.getEncadrant().getUtilisateur().getPrenom());
                encadrantDTO.setEmail(c.getEncadrant().getUtilisateur().getEmail());
                dto.setEncadrant(encadrantDTO);
            }
            // Mapping RH
            if (c.getOffre() != null && c.getOffre().getRh() != null) {
                com.gestionstage.gestionstage.dtos.UtilisateurDTO rhDTO = new com.gestionstage.gestionstage.dtos.UtilisateurDTO();
                rhDTO.setId(c.getOffre().getRh().getIdUtilisateur());
                rhDTO.setNom(c.getOffre().getRh().getNom());
                rhDTO.setPrenom(c.getOffre().getRh().getPrenom());
                rhDTO.setEmail(c.getOffre().getRh().getEmail());
                rhDTO.setRole("rh");
                dto.setRh(rhDTO);
            }
            dto.setRapports(rapportRepository.findByCandidatureId(c.getId()).stream().map(r -> {
                com.gestionstage.gestionstage.dtos.RapportDTO rapportDTO = new com.gestionstage.gestionstage.dtos.RapportDTO();
                rapportDTO.setId(r.getId());
                rapportDTO.setTitre(r.getTitre());
                rapportDTO.setDateDepot(r.getDateDepot());
                rapportDTO.setDocument(r.getDocument());
                rapportDTO.setIdCandidature(r.getCandidature().getId());
                return rapportDTO;
            }).collect(java.util.stream.Collectors.toList()));
            dto.setCommentaires(commentaireRepository.findByRapport_Candidature_Id(c.getId()).stream().map(com -> {
                com.gestionstage.gestionstage.dtos.CommentaireDTO commentaireDTO = new com.gestionstage.gestionstage.dtos.CommentaireDTO();
                commentaireDTO.setId(com.getId());
                commentaireDTO.setContenu(com.getContenu());
                commentaireDTO.setIdRapport(com.getRapport() != null ? com.getRapport().getId() : null);
                return commentaireDTO;
            }).collect(java.util.stream.Collectors.toList()));
            com.gestionstage.gestionstage.entities.Evaluation evaluation = null;
            if (c.getStagiaire() != null && c.getEncadrant() != null) {
                java.util.Optional<com.gestionstage.gestionstage.entities.Evaluation> evalOpt = evaluationRepository.findByStagiaireIdAndEncadrantId(
                    c.getStagiaire().getId_stagiaire(),
                    c.getEncadrant().getId()
                );
                if (evalOpt.isPresent()) {
                    evaluation = evalOpt.get();
                    com.gestionstage.gestionstage.dtos.EvaluationDTO evalDTO = new com.gestionstage.gestionstage.dtos.EvaluationDTO();
                    evalDTO.setId(evaluation.getId());
                    evalDTO.setNote(evaluation.getNote());
                    evalDTO.setCommentaire(evaluation.getCommentaire());
                    evalDTO.setDateEvaluation(evaluation.getDate_evaluation());
                    evalDTO.setId_stagiaire(evaluation.getStagiaire() != null ? evaluation.getStagiaire().getId_stagiaire() : null);
                    evalDTO.setId_encadrant(evaluation.getEncadrant() != null ? evaluation.getEncadrant().getId() : null);
                    dto.setEvaluation(evalDTO);
                }
            }
            result.add(dto);
        }
        return result;
    }

     public List<com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO> getCandidaturesEnCoursByUtilisateur(Integer idUtilisateur) {
        // Filtrer par RH créateur de l'offre
        List<com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO> result = new java.util.ArrayList<>();
        List<Candidature> candidatures = candidatureRepository.findAll();
        for (Candidature c : candidatures) {
            if (!c.getStatut().name().equalsIgnoreCase("acceptee")) continue;
            if (c.getConvention_stage() == null) continue;
            if (c.getAttestation() != null) continue;
            if (c.getOffre() == null || c.getOffre().getRh() == null || !c.getOffre().getRh().getIdUtilisateur().equals(idUtilisateur)) continue;
            com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO dto = new com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO();
            dto.setCandidature(toDTO(c));
            dto.setOffre(c.getOffre() != null ? offreStageService.toDTO(c.getOffre()) : null);
            // Mapping stagiaire
            if (c.getStagiaire() != null && c.getStagiaire().getUtilisateur() != null) {
                com.gestionstage.gestionstage.dtos.StagiaireDTO stagiaireDTO = new com.gestionstage.gestionstage.dtos.StagiaireDTO();
                stagiaireDTO.setId(c.getStagiaire().getId_stagiaire());
                stagiaireDTO.setNom(c.getStagiaire().getUtilisateur().getNom());
                stagiaireDTO.setPrenom(c.getStagiaire().getUtilisateur().getPrenom());
                stagiaireDTO.setEmail(c.getStagiaire().getUtilisateur().getEmail());
                dto.setStagiaire(stagiaireDTO);
            }
            // Mapping encadrant
            if (c.getEncadrant() != null && c.getEncadrant().getUtilisateur() != null) {
                com.gestionstage.gestionstage.dtos.EncadrantDTO encadrantDTO = new com.gestionstage.gestionstage.dtos.EncadrantDTO();
                encadrantDTO.setId(c.getEncadrant().getId());
                encadrantDTO.setNom(c.getEncadrant().getUtilisateur().getNom());
                encadrantDTO.setPrenom(c.getEncadrant().getUtilisateur().getPrenom());
                encadrantDTO.setEmail(c.getEncadrant().getUtilisateur().getEmail());
                dto.setEncadrant(encadrantDTO);
            }
            // Mapping RH
            if (c.getOffre() != null && c.getOffre().getRh() != null) {
                com.gestionstage.gestionstage.dtos.UtilisateurDTO rhDTO = new com.gestionstage.gestionstage.dtos.UtilisateurDTO();
                rhDTO.setId(c.getOffre().getRh().getIdUtilisateur());
                rhDTO.setNom(c.getOffre().getRh().getNom());
                rhDTO.setPrenom(c.getOffre().getRh().getPrenom());
                rhDTO.setEmail(c.getOffre().getRh().getEmail());
                rhDTO.setRole("rh");
                dto.setRh(rhDTO);
            }
            dto.setRapports(rapportRepository.findByCandidatureId(c.getId()).stream().map(r -> {
                com.gestionstage.gestionstage.dtos.RapportDTO rapportDTO = new com.gestionstage.gestionstage.dtos.RapportDTO();
                rapportDTO.setId(r.getId());
                rapportDTO.setTitre(r.getTitre());
                rapportDTO.setDateDepot(r.getDateDepot());
                rapportDTO.setDocument(r.getDocument());
                rapportDTO.setIdCandidature(r.getCandidature().getId());
                return rapportDTO;
            }).collect(java.util.stream.Collectors.toList()));
            dto.setCommentaires(commentaireRepository.findByRapport_Candidature_Id(c.getId()).stream().map(com -> {
                com.gestionstage.gestionstage.dtos.CommentaireDTO commentaireDTO = new com.gestionstage.gestionstage.dtos.CommentaireDTO();
                commentaireDTO.setId(com.getId());
                commentaireDTO.setContenu(com.getContenu());
                commentaireDTO.setIdRapport(com.getRapport() != null ? com.getRapport().getId() : null);
                return commentaireDTO;
            }).collect(java.util.stream.Collectors.toList()));
            com.gestionstage.gestionstage.entities.Evaluation evaluation = null;
            if (c.getStagiaire() != null && c.getEncadrant() != null) {
                java.util.Optional<com.gestionstage.gestionstage.entities.Evaluation> evalOpt = evaluationRepository.findByStagiaireIdAndEncadrantId(
                    c.getStagiaire().getId_stagiaire(),
                    c.getEncadrant().getId()
                );
                if (evalOpt.isPresent()) {
                    evaluation = evalOpt.get();
                    com.gestionstage.gestionstage.dtos.EvaluationDTO evalDTO = new com.gestionstage.gestionstage.dtos.EvaluationDTO();
                    evalDTO.setId(evaluation.getId());
                    evalDTO.setNote(evaluation.getNote());
                    evalDTO.setCommentaire(evaluation.getCommentaire());
                    evalDTO.setDateEvaluation(evaluation.getDate_evaluation());
                    evalDTO.setId_stagiaire(evaluation.getStagiaire() != null ? evaluation.getStagiaire().getId_stagiaire() : null);
                    evalDTO.setId_encadrant(evaluation.getEncadrant() != null ? evaluation.getEncadrant().getId() : null);
                    dto.setEvaluation(evalDTO);
                }
            }
            result.add(dto);
        }
        return result;
    }
}

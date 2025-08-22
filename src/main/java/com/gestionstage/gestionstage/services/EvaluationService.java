package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.dtos.EvaluationDTO;
import com.gestionstage.gestionstage.entities.*;
import com.gestionstage.gestionstage.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EvaluationService {
    // Conversion id utilisateur -> id technique encadrant
    public Integer getEncadrantIdByUtilisateurId(Integer idUtilisateur) {
        Encadrant encadrant = encadrantRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
            .orElseThrow(() -> new IllegalArgumentException("Encadrant introuvable avec id utilisateur : " + idUtilisateur));
        return encadrant.getId();
    }

    // Conversion id utilisateur -> id technique stagiaire
    public Integer getStagiaireIdByUtilisateurId(Integer idUtilisateur) {
        Stagiaire stagiaire = stagiaireRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
            .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable avec id utilisateur : " + idUtilisateur));
        return stagiaire.getId();
    }

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private StagiaireRepository stagiaireRepository;

    @Autowired
    private EncadrantRepository encadrantRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private CandidatureService candidatureService;

    public EvaluationDTO createEvaluation(EvaluationDTO dto) {
    // Valider la note
    double note = dto.getNote() == null ? 0 : dto.getNote();
    if (note < 0 || (note > 0 && (note < 1 || note > 5))) {
        throw new IllegalArgumentException("La note doit être entre 1 et 5, ou laissée à 0 par défaut.");
    }

    // Vérifier que le stagiaire existe
    Stagiaire stagiaire = stagiaireRepository.findById(dto.getId_stagiaire())
            .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable avec id : " + dto.getId_stagiaire()));

    // Vérifier que le stagiaire est bien de type 'stagiaire'
    Utilisateur utilisateurStagiaire = stagiaire.getUtilisateur();
   if (stagiaire.getUtilisateur() == null || stagiaire.getUtilisateur().getType() != Utilisateur.TypeUtilisateur.stagiaire) {
        throw new IllegalArgumentException("L'utilisateur lié au stagiaire n'est pas de type 'stagiaire'.");
    }

    // Vérifier que l'encadrant existe
    Encadrant encadrant = encadrantRepository.findById(dto.getId_encadrant())
            .orElseThrow(() -> new IllegalArgumentException("Encadrant introuvable avec id : " + dto.getId_encadrant()));

    // Vérifier que l'encadrant est bien de type 'encadrant'
    Utilisateur utilisateurEncadrant = encadrant.getUtilisateur();
   if (utilisateurEncadrant == null || utilisateurEncadrant.getType() != Utilisateur.TypeUtilisateur.encadrant) {
        throw new IllegalArgumentException("L'utilisateur lié à l'encadrant n'est pas de type 'encadrant'.");
    }

    // Créer l’évaluation
    Evaluation evaluation = new Evaluation();
    evaluation.setNote((float) note);
    evaluation.setCommentaire(dto.getCommentaire());
    evaluation.setDate_evaluation(dto.getDateEvaluation());
    evaluation.setStagiaire(stagiaire);
    evaluation.setEncadrant(encadrant);

    evaluation = evaluationRepository.save(evaluation);
    dto.setId(evaluation.getId());

    // Notifier le RH pour déposer l'attestation après l'évaluation
    candidatureService.notifierAttestationPourRH(dto.getId_stagiaire());

    return dto;
}

}

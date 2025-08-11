package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.CandidatureDTO;
import com.gestionstage.gestionstage.services.CandidatureService;
import com.gestionstage.gestionstage.dtos.AffectationEncadrantRequest;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/candidatures")
public class CandidatureController {

    @Autowired
    private CandidatureService candidatureService;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('stagiaire')")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidatureDTO create(
            @RequestParam("id_stagiaire") Integer idStagiaire,
            @RequestParam("id_offre") Integer idOffre,
            @RequestParam("statut") String statut,
            @RequestParam("date_soumission") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateSoumission,
            @RequestParam("lettre_motivation") MultipartFile lettreMotivation,
            @RequestParam("cv") MultipartFile cv,
            @RequestParam(value = "convention_stage", required = false) MultipartFile conventionStage,
            @RequestParam(value = "attestation", required = false) MultipartFile attestation
    ) throws Exception {

        if (lettreMotivation.isEmpty()) throw new IllegalArgumentException("Lettre de motivation obligatoire.");
        if (cv.isEmpty()) throw new IllegalArgumentException("CV obligatoire.");

        CandidatureDTO dto = new CandidatureDTO();
        dto.setId_stagiaire(idStagiaire);
        dto.setId_offre(idOffre);
        dto.setStatut(statut);
        dto.setDate_soumission(dateSoumission);
        dto.setLettre_motivation(lettreMotivation.getBytes());
        dto.setCv(cv.getBytes());
        dto.setConvention_stage(conventionStage != null && !conventionStage.isEmpty() ? conventionStage.getBytes() : null);
        dto.setAttestation(attestation != null && !attestation.isEmpty() ? attestation.getBytes() : null);

        return candidatureService.create(dto);
    }

    @PostMapping(value = "/conventions", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('stagiaire')")
    public ResponseEntity<String> uploadConvention(
            @RequestParam("id_candidature") Integer idCandidature,
            @RequestParam("convention_stage") MultipartFile convention
    ) throws Exception {
        candidatureService.uploadDocument(idCandidature, "convention", convention.getBytes());
        return ResponseEntity.ok("Convention déposée");
    }

    @PostMapping(value = "/attestations", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<String> uploadAttestation(
            @RequestParam("id_candidature") Integer idCandidature,
            @RequestParam("attestation") MultipartFile attestation
    ) throws Exception {
        candidatureService.uploadDocument(idCandidature, "attestation", attestation.getBytes());
        return ResponseEntity.ok("Attestation ajoutée");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('rh', 'admin')")
    public List<CandidatureDTO> getAllCandidatures() {
        return candidatureService.getAll();
    }

    @PatchMapping("/{id}/accepter")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<String> accepterCandidature(@PathVariable Integer id) {
        candidatureService.changerStatut(id, "acceptee");
        return ResponseEntity.ok("Candidature acceptée");
    }

    @PatchMapping("/{id}/refuser")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<String> refuserCandidature(@PathVariable Integer id) {
        candidatureService.changerStatut(id, "refusee");
        return ResponseEntity.ok("Candidature refusée");
    }

    @PatchMapping("/{id}/affecter-encadrant")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<String> affecterEncadrant(
            @PathVariable Integer id,
            @RequestBody AffectationEncadrantRequest request
    ) {
        candidatureService.affecterEncadrant(id, request.getId_encadrant());
        return ResponseEntity.ok("Encadrant affecté à la candidature");
    }

    @PatchMapping("/{id}/convention-signee")
    @PreAuthorize("hasRole('rh')")
    public ResponseEntity<String> deposerConventionParRH(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile fichierConvention) {

        try {
            candidatureService.deposerConventionSigneeParRH(id, fichierConvention.getBytes());
            return ResponseEntity.ok("Convention signée déposée. Notification envoyée au RH pour l'attestation.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du traitement du fichier.");
        }
    }
}

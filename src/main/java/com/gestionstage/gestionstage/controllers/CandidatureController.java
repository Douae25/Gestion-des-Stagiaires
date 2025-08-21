package com.gestionstage.gestionstage.controllers;

import com.gestionstage.gestionstage.dtos.CandidatureDTO;
import com.gestionstage.gestionstage.services.CandidatureService;
import com.gestionstage.gestionstage.dtos.AffectationEncadrantRequest;
import com.gestionstage.gestionstage.services.JwtService;

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
    
    @Autowired
    private JwtService jwtService;

    private Integer extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractUserId(token);
        }
        throw new IllegalArgumentException("Token JWT invalide");
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('stagiaire')")
    @ResponseStatus(HttpStatus.CREATED)
    public CandidatureDTO create(
            @RequestParam("id_utilisateur") Integer idUtilisateur,
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
        dto.setId_utilisateur(idUtilisateur);  // Utiliser l'ID utilisateur
        dto.setId_offre(idOffre);
        dto.setStatut(statut);
        dto.setDate_soumission(dateSoumission);
        dto.setLettre_motivation(lettreMotivation.getBytes());
        dto.setCv(cv.getBytes());
        dto.setConvention_stage(conventionStage != null && !conventionStage.isEmpty() ? conventionStage.getBytes() : null);
        dto.setAttestation(attestation != null && !attestation.isEmpty() ? attestation.getBytes() : null);

        return candidatureService.createByUtilisateur(dto);
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

    @GetMapping("/acceptees")
    @PreAuthorize("hasAnyRole('stagiaire','rh', 'encadrant', 'admin')")
    public List<CandidatureDTO> getCandidaturesAcceptees() {
        return candidatureService.getCandidaturesAcceptees();
    }

    @Autowired
    private com.gestionstage.gestionstage.services.RapportService rapportService;

    @GetMapping("/mes-candidatures-acceptees")
    @PreAuthorize("hasRole('stagiaire')")
    public List<com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsDTO> getMesCandidaturesAcceptees(@RequestHeader("Authorization") String authHeader) {
        Integer idUtilisateur = extractUserIdFromToken(authHeader);
        List<CandidatureDTO> candidatures = candidatureService.getCandidaturesAccepteesByUtilisateur(idUtilisateur);
        List<com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsDTO> result = new java.util.ArrayList<>();
        for (CandidatureDTO c : candidatures) {
            com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsDTO dto = new com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsDTO();
            dto.setCandidature(c);
            dto.setRapports(rapportService.getRapportsParCandidature(c.getId()));
            result.add(dto);
        }
        return result;
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    @PreAuthorize("hasAnyRole('stagiaire', 'rh', 'encadrant', 'admin')")
    public List<CandidatureDTO> getCandidaturesByUtilisateur(@PathVariable Integer idUtilisateur) {
        return candidatureService.getCandidaturesByUtilisateur(idUtilisateur);
    }

    @GetMapping("/offre/{idOffre}")
    @PreAuthorize("hasAnyRole('rh', 'admin')")
    public List<CandidatureDTO> getCandidaturesByOffre(@PathVariable Integer idOffre) {
        return candidatureService.getCandidaturesByOffre(idOffre);
    }

        @PutMapping("/{id}/documents")
    @PreAuthorize("hasRole('stagiaire')")
    public ResponseEntity<String> updateCandidatureDocuments(
            @PathVariable Integer id,
            @RequestParam("cv") MultipartFile cv,
            @RequestParam("lettre_motivation") MultipartFile lettreMotivation,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Integer idUtilisateur = extractUserIdFromToken(authHeader);
            candidatureService.updateCandidatureDocuments(id, idUtilisateur, cv.getBytes(), lettreMotivation.getBytes());
            return ResponseEntity.ok("Documents mis à jour avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('stagiaire')")
    public ResponseEntity<String> deleteCandidature(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Integer idUtilisateur = extractUserIdFromToken(authHeader);
            candidatureService.deleteCandidature(id, idUtilisateur);
            return ResponseEntity.ok("Candidature supprimée avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
            return ResponseEntity.ok("Convention signée déposée. ");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors du traitement du fichier.");
        }
    }

    @GetMapping("/rh/{idRh}/acceptees-convention-non-signee")
    @PreAuthorize("hasAnyRole('rh', 'admin')")
    public List<CandidatureDTO> getCandidaturesAccepteesAvecConventionNonSigneeByRh(@PathVariable Integer idRh) {
        return candidatureService.getCandidaturesAccepteesAvecConventionNonSigneeByRh(idRh);
    }

    @GetMapping("/finalisees")
    @PreAuthorize("hasAnyRole('rh', 'admin', 'encadrant')")
    public List<com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsEtEvaluationDTO> getCandidaturesFinalisees() {
        return candidatureService.getCandidaturesFinalisees();
    }

    @GetMapping("/finalisees/rh/{idRh}")
    @PreAuthorize("hasAnyRole('rh', 'admin')")
    public List<com.gestionstage.gestionstage.dtos.CandidatureAvecRapportsEtEvaluationDTO> getCandidaturesFinaliseesByRh(@PathVariable Integer idRh) {
        return candidatureService.getCandidaturesFinaliseesByRh(idRh);
    }

       @GetMapping("/en-cours")
    @PreAuthorize("hasAnyRole('rh', 'admin', 'encadrant')")
    public List<com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO> getCandidaturesEnCours() {
        return candidatureService.getCandidaturesEnCours();
    }


        @GetMapping("/en-cours/mes")
    @PreAuthorize("hasRole('rh')")
    public List<com.gestionstage.gestionstage.dtos.CandidatureEnCoursDTO> getMesCandidaturesEnCours(@RequestHeader("Authorization") String authHeader) {
    Integer idUtilisateur = extractUserIdFromToken(authHeader);
    return candidatureService.getCandidaturesEnCoursByUtilisateur(idUtilisateur);
    }
}

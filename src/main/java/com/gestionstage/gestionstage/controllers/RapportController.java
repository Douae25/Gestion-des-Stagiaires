package com.gestionstage.gestionstage.controllers;


import com.gestionstage.gestionstage.dtos.RapportDTO;
import com.gestionstage.gestionstage.services.RapportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/rapports")
public class RapportController {

    @Autowired
    private RapportService rapportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RapportDTO ajouterRapport(
            @RequestParam("titre") String titre,
            @RequestParam("idCandidature") Integer idCandidature,
            @RequestParam("document") MultipartFile document
    ) throws IOException {
        RapportDTO dto = new RapportDTO();
        dto.setTitre(titre);
        dto.setIdCandidature(idCandidature);
        dto.setDocument(document.getBytes());

        return rapportService.ajouterRapport(dto);
    }

    @GetMapping("/candidature/{idCandidature}")
    public List<RapportDTO> getParCandidature(@PathVariable Integer idCandidature) {
        return rapportService.getRapportsParCandidature(idCandidature);
    }
}

package com.gestionstage.gestionstage.services;


import com.gestionstage.gestionstage.dtos.EncadrantDTO;
import com.gestionstage.gestionstage.dtos.StagiaireDTO;
import com.gestionstage.gestionstage.dtos.UtilisateurCompletDTO;
import com.gestionstage.gestionstage.dtos.UtilisateurUpdateResponse;
import com.gestionstage.gestionstage.entities.Encadrant;
import com.gestionstage.gestionstage.entities.Stagiaire;
import com.gestionstage.gestionstage.entities.Utilisateur;
import com.gestionstage.gestionstage.repositories.EncadrantRepository;
import com.gestionstage.gestionstage.repositories.StagiaireRepository;
import com.gestionstage.gestionstage.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private StagiaireRepository stagiaireRepository;

    @Autowired
    private EncadrantRepository encadrantRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public List<UtilisateurCompletDTO> getAllUtilisateurs() {
        return utilisateurRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UtilisateurCompletDTO getUtilisateurById(Integer id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        return toDTO(utilisateur);
    }

    public UtilisateurCompletDTO getUtilisateurByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        return toDTO(utilisateur);
    }

       private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

@Transactional  // important pour rollback en cas d'erreur
public UtilisateurCompletDTO createUtilisateur(UtilisateurCompletDTO dto) {
    // Validation email et autres champs de base...
    if (!isValidEmail(dto.getEmail())) {
        throw new IllegalArgumentException("Email invalide");
    }

    Utilisateur.TypeUtilisateur type = Utilisateur.TypeUtilisateur.valueOf(dto.getType());

    // Validation stricte selon type : uniquement les infos correspondantes doivent être présentes
    if (type == Utilisateur.TypeUtilisateur.encadrant) {
        if (dto.getEncadrant_info() == null) {
            throw new IllegalArgumentException("Les informations d'encadrant sont obligatoires pour un utilisateur de type encadrant.");
        }
        if (dto.getStagiaire_info() != null) {
            throw new IllegalArgumentException("Les informations de stagiaire ne doivent pas être fournies pour un utilisateur de type encadrant.");
        }
    } else if (type == Utilisateur.TypeUtilisateur.stagiaire) {
        if (dto.getStagiaire_info() == null) {
            throw new IllegalArgumentException("Les informations de stagiaire sont obligatoires pour un utilisateur de type stagiaire.");
        }
        if (dto.getEncadrant_info() != null) {
            throw new IllegalArgumentException("Les informations d'encadrant ne doivent pas être fournies pour un utilisateur de type stagiaire.");
        }
    } else {
        // Pour admin ou RH, on peut exiger qu'aucune info stagiaire ou encadrant ne soit fournie
        if (dto.getEncadrant_info() != null || dto.getStagiaire_info() != null) {
            throw new IllegalArgumentException("Les informations de stagiaire et d'encadrant ne doivent pas être fournies pour ce type d'utilisateur.");
        }
    }

    // Création utilisateur
    Utilisateur utilisateur = new Utilisateur();
    utilisateur.setNom(dto.getNom());
    utilisateur.setPrenom(dto.getPrenom());
    utilisateur.setEmail(dto.getEmail());
    utilisateur.setMot_de_passe(passwordEncoder.encode(dto.getMot_de_passe()));
    utilisateur.setNumero_telephone(dto.getNumero_telephone());
    utilisateur.setType(type);
    utilisateur.setStatut(Utilisateur.Statut.active);


    Utilisateur saved = utilisateurRepository.save(utilisateur);
    dto.setId_utilisateur(saved.getIdUtilisateur());

    // Création stagiaire ou encadrant selon le type
    switch (type) {
        case stagiaire:
            Stagiaire s = new Stagiaire();
            s.setUtilisateur(saved);
            s.setNiveau_etude(dto.getStagiaire_info().getNiveau_etude());
            s.setEtablissement(dto.getStagiaire_info().getEtablissement());
            stagiaireRepository.save(s);
            break;
        case encadrant:
            Encadrant e = new Encadrant();
            e.setUtilisateur(saved);
            e.setDepartement(dto.getEncadrant_info().getDepartement());
            encadrantRepository.save(e);
            break;
        default:
            // Rien à faire pour Admin/RH
            break;
    }

    return dto;
}

@Transactional
public UtilisateurCompletDTO changerStatut(Integer id, String statut) {
    Utilisateur utilisateur = utilisateurRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

    utilisateur.setStatut(Utilisateur.Statut.valueOf(statut));
    utilisateurRepository.save(utilisateur);

    return toDTO(utilisateur);
}


@Transactional
public UtilisateurUpdateResponse updateUtilisateur(Integer id, UtilisateurCompletDTO dto) {
    Utilisateur utilisateur = utilisateurRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

    // Sauvegarder l'ancien email pour comparaison
    String ancienEmail = utilisateur.getEmail();
    String ancienMotDePasse = utilisateur.getMot_de_passe();
    
    Utilisateur.TypeUtilisateur type = Utilisateur.TypeUtilisateur.valueOf(dto.getType());

    // Mise à jour des données de base
    utilisateur.setNom(dto.getNom());
    utilisateur.setPrenom(dto.getPrenom());
    utilisateur.setEmail(dto.getEmail());
    
    // Seulement encoder le mot de passe s'il a changé
    if (dto.getMot_de_passe() != null && !dto.getMot_de_passe().isEmpty() 
        && !dto.getMot_de_passe().equals(ancienMotDePasse)) {
        utilisateur.setMot_de_passe(passwordEncoder.encode(dto.getMot_de_passe()));
    }
    
    utilisateur.setNumero_telephone(dto.getNumero_telephone());
    utilisateur.setType(type); // Si on autorise la modification du type

    utilisateurRepository.save(utilisateur);

    // Mettre à jour les infos selon le type
    switch (type) {
        case stagiaire:
            // Mettre à jour les infos du stagiaire si elles sont fournies
            Stagiaire stagiaire = stagiaireRepository.findByUtilisateurIdUtilisateur(id)
                    .orElseThrow(() -> new IllegalArgumentException("Stagiaire introuvable"));
            
            // Ne mettre à jour les infos du stagiaire que si elles sont fournies
            if (dto.getStagiaire_info() != null) {
                stagiaire.setNiveau_etude(dto.getStagiaire_info().getNiveau_etude());
                stagiaire.setEtablissement(dto.getStagiaire_info().getEtablissement());
                stagiaireRepository.save(stagiaire);
            }
            break;

        case encadrant:
            // Mettre à jour les infos de l'encadrant
            Encadrant encadrant = encadrantRepository.findByUtilisateurIdUtilisateur(id)
                    .orElseThrow(() -> new IllegalArgumentException("Encadrant introuvable"));
            if (dto.getEncadrant_info() == null)
                throw new IllegalArgumentException("Les informations de l'encadrant sont requises");

            encadrant.setDepartement(dto.getEncadrant_info().getDepartement());
            encadrantRepository.save(encadrant);
            break;

        case rh:
        case admin:
            // Rien à mettre à jour de spécifique
            break;
    }

    UtilisateurCompletDTO utilisateurDTO = toDTO(utilisateur);
    
    // Vérifier si l'email a changé
    if (!ancienEmail.equals(dto.getEmail())) {
        System.out.println("UtilisateurService: Email modifié de '" + ancienEmail + "' vers '" + dto.getEmail() + "'");
        // Générer un nouveau token avec le nouvel email et le rôle de l'utilisateur
        String role = "role_" + utilisateur.getType().name();
        String nouveauToken = jwtService.generateToken(dto.getEmail(), role, id);
        System.out.println("UtilisateurService: Nouveau token généré pour email: " + dto.getEmail());
        return new UtilisateurUpdateResponse(utilisateurDTO, nouveauToken);
    }
    
    System.out.println("UtilisateurService: Email non modifié, pas de nouveau token");
    // Si l'email n'a pas changé, retourner sans nouveau token
    return new UtilisateurUpdateResponse(utilisateurDTO);
}


private UtilisateurCompletDTO toDTO(Utilisateur utilisateur) {
    UtilisateurCompletDTO dto = new UtilisateurCompletDTO();
    dto.setId_utilisateur(utilisateur.getIdUtilisateur());
    dto.setNom(utilisateur.getNom());
    dto.setPrenom(utilisateur.getPrenom());
    dto.setEmail(utilisateur.getEmail());
    dto.setMot_de_passe(utilisateur.getMot_de_passe());
    dto.setNumero_telephone(utilisateur.getNumero_telephone());
    dto.setType(utilisateur.getType().name());
    dto.setStatut(utilisateur.getStatut().name());


    // Cas stagiaire
    if (utilisateur.getType() == Utilisateur.TypeUtilisateur.stagiaire) {
        stagiaireRepository.findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur())
                .ifPresent(stagiaire -> {
                    StagiaireDTO stagiaireDTO = new StagiaireDTO();
                    stagiaireDTO.setId(stagiaire.getId());
                    stagiaireDTO.setId_stagiaire(stagiaire.getUtilisateur().getIdUtilisateur());
                    stagiaireDTO.setNiveau_etude(stagiaire.getNiveau_etude());
                    stagiaireDTO.setEtablissement(stagiaire.getEtablissement());
                    dto.setStagiaire_info(stagiaireDTO);
                });
    }

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

}

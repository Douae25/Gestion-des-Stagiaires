package com.gestionstage.gestionstage.repositories;

import com.gestionstage.gestionstage.entities.Stagiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StagiaireRepository extends JpaRepository<Stagiaire, Integer> {
    Optional<Stagiaire> findByUtilisateurIdUtilisateur(Integer idUtilisateur);

}

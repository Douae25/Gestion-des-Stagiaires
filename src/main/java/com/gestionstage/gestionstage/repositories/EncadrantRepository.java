package com.gestionstage.gestionstage.repositories;

import com.gestionstage.gestionstage.entities.Encadrant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface EncadrantRepository extends JpaRepository<Encadrant, Integer> {
    Optional<Encadrant> findByUtilisateurIdUtilisateur(Integer idUtilisateur);
}

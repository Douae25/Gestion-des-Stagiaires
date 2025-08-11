package com.gestionstage.gestionstage.repositories;
import com.gestionstage.gestionstage.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
 Optional<Utilisateur> findByEmail(String email);
}
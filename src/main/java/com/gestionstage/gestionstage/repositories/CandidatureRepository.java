package com.gestionstage.gestionstage.repositories;

import com.gestionstage.gestionstage.entities.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Integer> {
    List<Candidature> findByStagiaireId(Integer idStagiaire);
    List<Candidature> findByStatut(Candidature.Statut statut);
    
    @Query("SELECT c FROM Candidature c WHERE c.stagiaire.utilisateur.id = :idUtilisateur AND c.statut = :statut")
    List<Candidature> findByUtilisateurIdAndStatut(@Param("idUtilisateur") Integer idUtilisateur, 
                                                   @Param("statut") Candidature.Statut statut);
    
    @Query("SELECT c FROM Candidature c WHERE c.statut = 'acceptee' AND c.date_acceptation IS NOT NULL AND c.date_acceptation <= :dateLimit AND c.convention_stage IS NULL")
    List<Candidature> findCandidaturesAccepteesEnRetard(@Param("dateLimit") LocalDate dateLimit);
    
    @Query("SELECT c FROM Candidature c WHERE c.offre.id = :idOffre AND c.statut = 'en_attente'")
    List<Candidature> findCandidaturesEnAttenteByOffre(@Param("idOffre") Integer idOffre);
}

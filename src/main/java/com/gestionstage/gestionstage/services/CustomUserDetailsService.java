package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.entities.Utilisateur;
import com.gestionstage.gestionstage.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("CustomUserDetailsService: Recherche utilisateur avec email: " + username);
        
        Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> {
                    System.out.println("CustomUserDetailsService: Aucun utilisateur trouvé avec l'email: " + username);
                    // Affichons tous les emails en base pour debug
                    utilisateurRepository.findAll().forEach(u -> 
                        System.out.println("Email en base: " + u.getEmail())
                    );
                    return new UsernameNotFoundException("Utilisateur non trouvé");
                });

        System.out.println("CustomUserDetailsService: Utilisateur trouvé - Email: " + utilisateur.getEmail() + ", Type: " + utilisateur.getType());
        
        return User.withUsername(utilisateur.getEmail())
                .password(utilisateur.getMot_de_passe())
                .roles(utilisateur.getType().name())
                .build();
    }
}

package com.gestionstage.gestionstage.services;

import com.gestionstage.gestionstage.entities.Utilisateur;
import com.gestionstage.gestionstage.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        return User.withUsername(utilisateur.getEmail())
                .password(utilisateur.getMot_de_passe())
                .roles(utilisateur.getType().name())
                .authorities(
                    new SimpleGrantedAuthority("ROLE_" + utilisateur.getType().name())
                )
                .build();
    }
}

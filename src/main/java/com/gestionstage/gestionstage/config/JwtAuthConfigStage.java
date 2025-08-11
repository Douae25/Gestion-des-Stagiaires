package com.gestionstage.gestionstage.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.gestionstage.gestionstage.services.JwtService;
import com.gestionstage.gestionstage.services.CustomUserDetailsService;

@Configuration
public class JwtAuthConfigStage {

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        
                        // Stagiaire
                        .requestMatchers("/candidatures/**").hasAnyRole("STAGIAIRE")
                        .requestMatchers("/conventions/deposer").hasAnyRole("STAGIAIRE")
                        .requestMatchers("/rapports/**").hasAnyRole("STAGIAIRE")
                        .requestMatchers("/offres/actives").hasAnyRole("STAGIAIRE")
                        
                        // RH
                        .requestMatchers("/attestations/**").hasAnyRole("RH")
                        .requestMatchers("/candidatures/liste").hasAnyRole("RH")
                        .requestMatchers("/candidatures/accepter").hasAnyRole("RH")
                        .requestMatchers("/candidatures/refuser").hasAnyRole("RH")
                        .requestMatchers("/candidatures/affecter-encadrant").hasAnyRole("RH")
                        .requestMatchers("/conventions/signer").hasAnyRole("RH")
                        .requestMatchers("/offres/**").hasAnyRole("RH")
                        .requestMatchers("/encadrants/**").hasAnyRole("RH")
                        
                        // Encadrant
                        .requestMatchers("/rapports/**").hasAnyRole("ENCADRANT")
                        .requestMatchers("/candidatures/par-rapport").hasAnyRole("ENCADRANT")
                        .requestMatchers("/evaluations/**").hasAnyRole("ENCADRANT")
                        
                        // Admin
                        .requestMatchers("/utilisateurs/**").hasAnyRole("ADMIN")
                        
                        // Tous les rôles
                        .requestMatchers("/rapports/getParRapport").hasAnyRole("STAGIAIRE", "ENCADRANT", "RH", "ADMIN")
                        .requestMatchers("/offres/**").hasAnyRole("STAGIAIRE", "RH", "ADMIN")
                        .requestMatchers("/candidatures/par-candidature").hasAnyRole("STAGIAIRE", "ENCADRANT", "RH", "ADMIN")
                        
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(userDetailsService, jwtService);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

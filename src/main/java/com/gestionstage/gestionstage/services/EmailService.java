package com.gestionstage.gestionstage.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.TaskExecutor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TaskExecutor taskExecutor; // pour exécuter en async

    /**
     * Envoi d'un email HTML de manière asynchrone.
     */
    @Async
    public void envoyerEmailHtml(String to, String subject, String htmlContent) {
        taskExecutor.execute(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom("tonemail@gmail.com");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);  // true = contenu HTML

                mailSender.send(message);
            } catch (MessagingException e) {
                // Log l'erreur, ne pas bloquer le traitement
                e.printStackTrace();
            }
        });
    }
}

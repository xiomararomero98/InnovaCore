package com.innovacore.ms_proyectos.Event;

import com.innovacore.ms_proyectos.Config.RabbitMqConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProyectoEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public ProyectoEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    // ==========================================================
    // PUBLICAR EVENTO: PROYECTO CREADO
    // ==========================================================
    public void publicarProyectoCreado(ProyectoCreadoEvent evento) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE_PROYECTOS,
                RabbitMqConfig.ROUTING_KEY_PROYECTO_CREADO,
                evento
        );
        System.out.println("📤 Evento publicado: ProyectoCreado - " + evento.getNombreProyecto());
    }
}
package com.innovacore.ms_recursos.Event;

import com.innovacore.ms_recursos.Config.RabbitMqConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class AsignacionEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public AsignacionEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    // ==========================================================
    // PUBLICAR EVENTO: ASIGNACIÓN CREADA
    // ==========================================================
    public void publicarAsignacionCreada(AsignacionCreadaEvent evento) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE_RECURSOS,
                RabbitMqConfig.ROUTING_KEY_ASIGNACION_CREADA,
                evento
        );
        System.out.println("📤 Evento publicado: AsignacionCreada - Empleado: " + evento.getNombreEmpleado());
    }
}
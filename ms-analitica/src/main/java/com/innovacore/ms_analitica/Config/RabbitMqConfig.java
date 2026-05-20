package com.innovacore.ms_analitica.Config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    // ==========================================================
    // NOMBRES DE EXCHANGES, COLAS Y ROUTING KEYS
    // (deben coincidir con los de ms-proyectos y ms-recursos)
    // ==========================================================
    public static final String EXCHANGE_PROYECTOS = "proyectos.exchange";
    public static final String EXCHANGE_RECURSOS = "recursos.exchange";

    public static final String QUEUE_PROYECTO_CREADO = "proyecto.creado.queue";
    public static final String ROUTING_KEY_PROYECTO_CREADO = "proyecto.creado";

    public static final String QUEUE_ASIGNACION_CREADA = "asignacion.creada.queue";
    public static final String ROUTING_KEY_ASIGNACION_CREADA = "asignacion.creada";

    // ==========================================================
    // EXCHANGES
    // ==========================================================
    @Bean
    public TopicExchange proyectosExchange() {
        return new TopicExchange(EXCHANGE_PROYECTOS);
    }

    @Bean
    public TopicExchange recursosExchange() {
        return new TopicExchange(EXCHANGE_RECURSOS);
    }

    // ==========================================================
    // COLAS (donde llegan los mensajes)
    // ==========================================================
    @Bean
    public Queue proyectoCreadoQueue() {
        return new Queue(QUEUE_PROYECTO_CREADO, true);
    }

    @Bean
    public Queue asignacionCreadaQueue() {
        return new Queue(QUEUE_ASIGNACION_CREADA, true);
    }

    // ==========================================================
    // BINDINGS (conexiones entre exchanges y colas)
    // ==========================================================
    @Bean
    public Binding bindingProyectoCreado(Queue proyectoCreadoQueue, TopicExchange proyectosExchange) {
        return BindingBuilder.bind(proyectoCreadoQueue)
                .to(proyectosExchange)
                .with(ROUTING_KEY_PROYECTO_CREADO);
    }

    @Bean
    public Binding bindingAsignacionCreada(Queue asignacionCreadaQueue, TopicExchange recursosExchange) {
        return BindingBuilder.bind(asignacionCreadaQueue)
                .to(recursosExchange)
                .with(ROUTING_KEY_ASIGNACION_CREADA);
    }

    // ==========================================================
    // CONVERSOR DE MENSAJES (JSON)
    // ==========================================================
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
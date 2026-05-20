package com.innovacore.ms_recursos.Config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    // ==========================================================
    // NOMBRES DE COLAS, EXCHANGES Y ROUTING KEYS
    // ==========================================================
    public static final String EXCHANGE_RECURSOS = "recursos.exchange";

    public static final String QUEUE_ASIGNACION_CREADA = "asignacion.creada.queue";
    public static final String ROUTING_KEY_ASIGNACION_CREADA = "asignacion.creada";

    // ==========================================================
    // EXCHANGE
    // ==========================================================
    @Bean
    public TopicExchange recursosExchange() {
        return new TopicExchange(EXCHANGE_RECURSOS);
    }

    // ==========================================================
    // COLAS
    // ==========================================================
    @Bean
    public Queue asignacionCreadaQueue() {
        return new Queue(QUEUE_ASIGNACION_CREADA, true);
    }

    // ==========================================================
    // BINDINGS
    // ==========================================================
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

    // ==========================================================
    // RABBIT TEMPLATE
    // ==========================================================
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
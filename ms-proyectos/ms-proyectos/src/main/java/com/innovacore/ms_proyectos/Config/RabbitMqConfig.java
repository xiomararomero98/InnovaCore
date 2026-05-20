package com.innovacore.ms_proyectos.Config;

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
    public static final String EXCHANGE_PROYECTOS = "proyectos.exchange";

    public static final String QUEUE_PROYECTO_CREADO = "proyecto.creado.queue";
    public static final String ROUTING_KEY_PROYECTO_CREADO = "proyecto.creado";

    public static final String QUEUE_TAREA_COMPLETADA = "tarea.completada.queue";
    public static final String ROUTING_KEY_TAREA_COMPLETADA = "tarea.completada";

    // ==========================================================
    // EXCHANGE (central de distribución)
    // ==========================================================
    @Bean
    public TopicExchange proyectosExchange() {
        return new TopicExchange(EXCHANGE_PROYECTOS);
    }

    // ==========================================================
    // COLAS (donde se almacenan los mensajes)
    // ==========================================================
    @Bean
    public Queue proyectoCreadoQueue() {
        return new Queue(QUEUE_PROYECTO_CREADO, true);
    }

    @Bean
    public Queue tareaCompletadaQueue() {
        return new Queue(QUEUE_TAREA_COMPLETADA, true);
    }

    // ==========================================================
    // BINDINGS (conexiones entre exchange y colas)
    // ==========================================================
    @Bean
    public Binding bindingProyectoCreado(Queue proyectoCreadoQueue, TopicExchange proyectosExchange) {
        return BindingBuilder.bind(proyectoCreadoQueue)
                .to(proyectosExchange)
                .with(ROUTING_KEY_PROYECTO_CREADO);
    }

    @Bean
    public Binding bindingTareaCompletada(Queue tareaCompletadaQueue, TopicExchange proyectosExchange) {
        return BindingBuilder.bind(tareaCompletadaQueue)
                .to(proyectosExchange)
                .with(ROUTING_KEY_TAREA_COMPLETADA);
    }

    // ==========================================================
    // CONVERSOR DE MENSAJES (JSON)
    // ==========================================================
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ==========================================================
    // RABBIT TEMPLATE (para publicar mensajes)
    // ==========================================================
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
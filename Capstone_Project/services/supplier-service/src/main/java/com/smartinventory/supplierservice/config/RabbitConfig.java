package com.smartinventory.supplierservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String EXCHANGE = "smart.inventory.events";
    @Bean TopicExchange smartExchange() { return new TopicExchange(EXCHANGE, true, false); }
    @Bean Jackson2JsonMessageConverter messageConverter() { return new Jackson2JsonMessageConverter(); }
    @Bean RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
    @Bean Queue procurementCompletedQueue() { return new Queue("inventory.procurement.completed", true); }
    @Bean Binding procurementCompletedBinding(Queue procurementCompletedQueue, TopicExchange smartExchange) {
        return BindingBuilder.bind(procurementCompletedQueue).to(smartExchange).with("procurement.completed");
    }
}

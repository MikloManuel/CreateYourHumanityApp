package space.createyourhumanity.app;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import space.createyourhumanity.app.config.AsyncSyncConfiguration;
import space.createyourhumanity.app.config.EmbeddedElasticsearch;
import space.createyourhumanity.app.config.EmbeddedMongo;
import space.createyourhumanity.app.config.JacksonConfiguration;
import space.createyourhumanity.app.config.TestSecurityConfiguration;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = { CreateyourhumanityApp.class, JacksonConfiguration.class, AsyncSyncConfiguration.class, TestSecurityConfiguration.class }
)
@EmbeddedMongo
@EmbeddedElasticsearch
public @interface IntegrationTest {
}

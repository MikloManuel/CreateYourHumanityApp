package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.GrantSettings;

/**
 * Spring Data MongoDB repository for the GrantSettings entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GrantSettingsRepository extends MongoRepository<GrantSettings, String> {}

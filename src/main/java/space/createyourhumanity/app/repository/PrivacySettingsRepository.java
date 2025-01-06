package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.PrivacySettings;

/**
 * Spring Data MongoDB repository for the PrivacySettings entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PrivacySettingsRepository extends MongoRepository<PrivacySettings, String> {}

package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.KeyTable;

/**
 * Spring Data MongoDB repository for the KeyTable entity.
 */
@SuppressWarnings("unused")
@Repository
public interface KeyTableRepository extends MongoRepository<KeyTable, String> {}

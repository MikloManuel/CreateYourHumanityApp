package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.Friendrequest;

/**
 * Spring Data MongoDB repository for the Friendrequest entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FriendrequestRepository extends MongoRepository<Friendrequest, String> {}

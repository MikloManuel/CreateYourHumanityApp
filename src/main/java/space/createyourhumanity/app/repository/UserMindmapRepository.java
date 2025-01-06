package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.UserMindmap;

/**
 * Spring Data MongoDB repository for the UserMindmap entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserMindmapRepository extends MongoRepository<UserMindmap, String> {}

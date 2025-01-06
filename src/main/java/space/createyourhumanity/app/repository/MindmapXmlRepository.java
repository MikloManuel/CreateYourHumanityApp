package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.MindmapXml;

/**
 * Spring Data MongoDB repository for the MindmapXml entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MindmapXmlRepository extends MongoRepository<MindmapXml, String> {}

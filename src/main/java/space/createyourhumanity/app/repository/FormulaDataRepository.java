package space.createyourhumanity.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import space.createyourhumanity.app.domain.FormulaData;

/**
 * Spring Data MongoDB repository for the FormulaData entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FormulaDataRepository extends MongoRepository<FormulaData, String> {}

package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.FormulaData;
import space.createyourhumanity.app.repository.FormulaDataRepository;

/**
 * Spring Data Elasticsearch repository for the {@link FormulaData} entity.
 */
public interface FormulaDataSearchRepository extends ElasticsearchRepository<FormulaData, String>, FormulaDataSearchRepositoryInternal {}

interface FormulaDataSearchRepositoryInternal {
    Stream<FormulaData> search(String query);

    Stream<FormulaData> search(Query query);

    @Async
    void index(FormulaData entity);

    @Async
    void deleteFromIndexById(String id);
}

class FormulaDataSearchRepositoryInternalImpl implements FormulaDataSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final FormulaDataRepository repository;

    FormulaDataSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, FormulaDataRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<FormulaData> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<FormulaData> search(Query query) {
        return elasticsearchTemplate.search(query, FormulaData.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(FormulaData entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), FormulaData.class);
    }
}

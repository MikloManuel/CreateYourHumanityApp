package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.KeyTable;
import space.createyourhumanity.app.repository.KeyTableRepository;

/**
 * Spring Data Elasticsearch repository for the {@link KeyTable} entity.
 */
public interface KeyTableSearchRepository extends ElasticsearchRepository<KeyTable, String>, KeyTableSearchRepositoryInternal {}

interface KeyTableSearchRepositoryInternal {
    Stream<KeyTable> search(String query);

    Stream<KeyTable> search(Query query);

    @Async
    void index(KeyTable entity);

    @Async
    void deleteFromIndexById(String id);
}

class KeyTableSearchRepositoryInternalImpl implements KeyTableSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final KeyTableRepository repository;

    KeyTableSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, KeyTableRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<KeyTable> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<KeyTable> search(Query query) {
        return elasticsearchTemplate.search(query, KeyTable.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(KeyTable entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), KeyTable.class);
    }
}

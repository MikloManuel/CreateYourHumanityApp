package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.GrantSettings;
import space.createyourhumanity.app.repository.GrantSettingsRepository;

/**
 * Spring Data Elasticsearch repository for the {@link GrantSettings} entity.
 */
public interface GrantSettingsSearchRepository
    extends ElasticsearchRepository<GrantSettings, String>, GrantSettingsSearchRepositoryInternal {}

interface GrantSettingsSearchRepositoryInternal {
    Stream<GrantSettings> search(String query);

    Stream<GrantSettings> search(Query query);

    @Async
    void index(GrantSettings entity);

    @Async
    void deleteFromIndexById(String id);
}

class GrantSettingsSearchRepositoryInternalImpl implements GrantSettingsSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final GrantSettingsRepository repository;

    GrantSettingsSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, GrantSettingsRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<GrantSettings> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<GrantSettings> search(Query query) {
        return elasticsearchTemplate.search(query, GrantSettings.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(GrantSettings entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), GrantSettings.class);
    }
}

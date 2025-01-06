package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.UserMindmap;
import space.createyourhumanity.app.repository.UserMindmapRepository;

/**
 * Spring Data Elasticsearch repository for the {@link UserMindmap} entity.
 */
public interface UserMindmapSearchRepository extends ElasticsearchRepository<UserMindmap, String>, UserMindmapSearchRepositoryInternal {}

interface UserMindmapSearchRepositoryInternal {
    Stream<UserMindmap> search(String query);

    Stream<UserMindmap> search(Query query);

    @Async
    void index(UserMindmap entity);

    @Async
    void deleteFromIndexById(String id);
}

class UserMindmapSearchRepositoryInternalImpl implements UserMindmapSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final UserMindmapRepository repository;

    UserMindmapSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, UserMindmapRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<UserMindmap> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<UserMindmap> search(Query query) {
        return elasticsearchTemplate.search(query, UserMindmap.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(UserMindmap entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), UserMindmap.class);
    }
}

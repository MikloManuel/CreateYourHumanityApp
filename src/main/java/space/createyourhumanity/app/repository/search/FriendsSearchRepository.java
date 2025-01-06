package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.Friends;
import space.createyourhumanity.app.repository.FriendsRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Friends} entity.
 */
public interface FriendsSearchRepository extends ElasticsearchRepository<Friends, String>, FriendsSearchRepositoryInternal {}

interface FriendsSearchRepositoryInternal {
    Stream<Friends> search(String query);

    Stream<Friends> search(Query query);

    @Async
    void index(Friends entity);

    @Async
    void deleteFromIndexById(String id);
}

class FriendsSearchRepositoryInternalImpl implements FriendsSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final FriendsRepository repository;

    FriendsSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, FriendsRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<Friends> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<Friends> search(Query query) {
        return elasticsearchTemplate.search(query, Friends.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(Friends entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), Friends.class);
    }
}

package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.Friendrequest;
import space.createyourhumanity.app.repository.FriendrequestRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Friendrequest} entity.
 */
public interface FriendrequestSearchRepository
    extends ElasticsearchRepository<Friendrequest, String>, FriendrequestSearchRepositoryInternal {}

interface FriendrequestSearchRepositoryInternal {
    Stream<Friendrequest> search(String query);

    Stream<Friendrequest> search(Query query);

    @Async
    void index(Friendrequest entity);

    @Async
    void deleteFromIndexById(String id);
}

class FriendrequestSearchRepositoryInternalImpl implements FriendrequestSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final FriendrequestRepository repository;

    FriendrequestSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, FriendrequestRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<Friendrequest> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<Friendrequest> search(Query query) {
        return elasticsearchTemplate.search(query, Friendrequest.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(Friendrequest entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), Friendrequest.class);
    }
}

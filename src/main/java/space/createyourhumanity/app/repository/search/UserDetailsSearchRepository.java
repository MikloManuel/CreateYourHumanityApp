package space.createyourhumanity.app.repository.search;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery;
import java.util.stream.Stream;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.scheduling.annotation.Async;
import space.createyourhumanity.app.domain.UserDetails;
import space.createyourhumanity.app.repository.UserDetailsRepository;

/**
 * Spring Data Elasticsearch repository for the {@link UserDetails} entity.
 */
public interface UserDetailsSearchRepository extends ElasticsearchRepository<UserDetails, String>, UserDetailsSearchRepositoryInternal {}

interface UserDetailsSearchRepositoryInternal {
    Stream<UserDetails> search(String query);

    Stream<UserDetails> search(Query query);

    @Async
    void index(UserDetails entity);

    @Async
    void deleteFromIndexById(String id);
}

class UserDetailsSearchRepositoryInternalImpl implements UserDetailsSearchRepositoryInternal {

    private final ElasticsearchTemplate elasticsearchTemplate;
    private final UserDetailsRepository repository;

    UserDetailsSearchRepositoryInternalImpl(ElasticsearchTemplate elasticsearchTemplate, UserDetailsRepository repository) {
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.repository = repository;
    }

    @Override
    public Stream<UserDetails> search(String query) {
        NativeQuery nativeQuery = new NativeQuery(QueryStringQuery.of(qs -> qs.query(query))._toQuery());
        return search(nativeQuery);
    }

    @Override
    public Stream<UserDetails> search(Query query) {
        return elasticsearchTemplate.search(query, UserDetails.class).map(SearchHit::getContent).stream();
    }

    @Override
    public void index(UserDetails entity) {
        repository.findById(entity.getId()).ifPresent(elasticsearchTemplate::save);
    }

    @Override
    public void deleteFromIndexById(String id) {
        elasticsearchTemplate.delete(String.valueOf(id), UserDetails.class);
    }
}
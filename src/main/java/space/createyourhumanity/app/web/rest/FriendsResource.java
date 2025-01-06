package space.createyourhumanity.app.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.createyourhumanity.app.domain.Friends;
import space.createyourhumanity.app.repository.FriendsRepository;
import space.createyourhumanity.app.repository.search.FriendsSearchRepository;
import space.createyourhumanity.app.web.rest.errors.BadRequestAlertException;
import space.createyourhumanity.app.web.rest.errors.ElasticsearchExceptionMapper;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link space.createyourhumanity.app.domain.Friends}.
 */
@RestController
@RequestMapping("/api/friends")
public class FriendsResource {

    private static final Logger log = LoggerFactory.getLogger(FriendsResource.class);

    private static final String ENTITY_NAME = "friends";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FriendsRepository friendsRepository;

    private final FriendsSearchRepository friendsSearchRepository;

    public FriendsResource(FriendsRepository friendsRepository, FriendsSearchRepository friendsSearchRepository) {
        this.friendsRepository = friendsRepository;
        this.friendsSearchRepository = friendsSearchRepository;
    }

    /**
     * {@code POST  /friends} : Create a new friends.
     *
     * @param friends the friends to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new friends, or with status {@code 400 (Bad Request)} if the friends has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Friends> createFriends(@RequestBody Friends friends) throws URISyntaxException {
        log.debug("REST request to save Friends : {}", friends);
        if (friends.getId() != null) {
            throw new BadRequestAlertException("A new friends cannot already have an ID", ENTITY_NAME, "idexists");
        }
        friends = friendsRepository.save(friends);
        friendsSearchRepository.index(friends);
        return ResponseEntity.created(new URI("/api/friends/" + friends.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, friends.getId()))
            .body(friends);
    }

    /**
     * {@code PUT  /friends/:id} : Updates an existing friends.
     *
     * @param id the id of the friends to save.
     * @param friends the friends to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friends,
     * or with status {@code 400 (Bad Request)} if the friends is not valid,
     * or with status {@code 500 (Internal Server Error)} if the friends couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Friends> updateFriends(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody Friends friends
    ) throws URISyntaxException {
        log.debug("REST request to update Friends : {}, {}", id, friends);
        if (friends.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, friends.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!friendsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        friends = friendsRepository.save(friends);
        friendsSearchRepository.index(friends);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, friends.getId()))
            .body(friends);
    }

    /**
     * {@code PATCH  /friends/:id} : Partial updates given fields of an existing friends, field will ignore if it is null
     *
     * @param id the id of the friends to save.
     * @param friends the friends to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friends,
     * or with status {@code 400 (Bad Request)} if the friends is not valid,
     * or with status {@code 404 (Not Found)} if the friends is not found,
     * or with status {@code 500 (Internal Server Error)} if the friends couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Friends> partialUpdateFriends(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody Friends friends
    ) throws URISyntaxException {
        log.debug("REST request to partial update Friends partially : {}, {}", id, friends);
        if (friends.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, friends.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!friendsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Friends> result = friendsRepository
            .findById(friends.getId())
            .map(existingFriends -> {
                if (friends.getConnectDate() != null) {
                    existingFriends.setConnectDate(friends.getConnectDate());
                }
                if (friends.getFriendId() != null) {
                    existingFriends.setFriendId(friends.getFriendId());
                }

                return existingFriends;
            })
            .map(friendsRepository::save)
            .map(savedFriends -> {
                friendsSearchRepository.index(savedFriends);
                return savedFriends;
            });

        return ResponseUtil.wrapOrNotFound(result, HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, friends.getId()));
    }

    /**
     * {@code GET  /friends} : get all the friends.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friends in body.
     */
    @GetMapping("")
    public List<Friends> getAllFriends() {
        log.debug("REST request to get all Friends");
        return friendsRepository.findAll();
    }

    /**
     * {@code GET  /friends/:id} : get the "id" friends.
     *
     * @param id the id of the friends to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the friends, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Friends> getFriends(@PathVariable("id") String id) {
        log.debug("REST request to get Friends : {}", id);
        Optional<Friends> friends = friendsRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(friends);
    }

    /**
     * {@code DELETE  /friends/:id} : delete the "id" friends.
     *
     * @param id the id of the friends to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFriends(@PathVariable("id") String id) {
        log.debug("REST request to delete Friends : {}", id);
        friendsRepository.deleteById(id);
        friendsSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code SEARCH  /friends/_search?query=:query} : search for the friends corresponding
     * to the query.
     *
     * @param query the query of the friends search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<Friends> searchFriends(@RequestParam("query") String query) {
        log.debug("REST request to search Friends for query {}", query);
        try {
            return StreamSupport.stream(friendsSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}

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
import space.createyourhumanity.app.domain.Friendrequest;
import space.createyourhumanity.app.repository.FriendrequestRepository;
import space.createyourhumanity.app.repository.search.FriendrequestSearchRepository;
import space.createyourhumanity.app.web.rest.errors.BadRequestAlertException;
import space.createyourhumanity.app.web.rest.errors.ElasticsearchExceptionMapper;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link space.createyourhumanity.app.domain.Friendrequest}.
 */
@CrossOrigin(origins = "http://localhost:9000")
@RestController
@RequestMapping("/api/friendrequests")
public class FriendrequestResource {

    private static final Logger log = LoggerFactory.getLogger(FriendrequestResource.class);

    private static final String ENTITY_NAME = "friendrequest";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FriendrequestRepository friendrequestRepository;

    private final FriendrequestSearchRepository friendrequestSearchRepository;

    public FriendrequestResource(
        FriendrequestRepository friendrequestRepository,
        FriendrequestSearchRepository friendrequestSearchRepository
    ) {
        this.friendrequestRepository = friendrequestRepository;
        this.friendrequestSearchRepository = friendrequestSearchRepository;
    }

    /**
     * {@code POST  /friendrequests} : Create a new friendrequest.
     *
     * @param friendrequest the friendrequest to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new friendrequest, or with status {@code 400 (Bad Request)} if the friendrequest has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("request")
    public ResponseEntity<Friendrequest> createFriendrequest(@RequestBody Friendrequest friendrequest) throws URISyntaxException {
        log.debug("REST request to save Friendrequest : {}", friendrequest);
        if (friendrequest.getId() != null) {
            throw new BadRequestAlertException("A new friendrequest cannot already have an ID", ENTITY_NAME, "idexists");
        }
        friendrequest = friendrequestRepository.save(friendrequest);
        friendrequestSearchRepository.index(friendrequest);
        return ResponseEntity.created(new URI("/api/friendrequests/" + friendrequest.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, friendrequest.getId()))
            .body(friendrequest);
    }

    /**
     * {@code PUT  /friendrequests/:id} : Updates an existing friendrequest.
     *
     * @param id the id of the friendrequest to save.
     * @param friendrequest the friendrequest to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendrequest,
     * or with status {@code 400 (Bad Request)} if the friendrequest is not valid,
     * or with status {@code 500 (Internal Server Error)} if the friendrequest couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Friendrequest> updateFriendrequest(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody Friendrequest friendrequest
    ) throws URISyntaxException {
        log.debug("REST request to update Friendrequest : {}, {}", id, friendrequest);
        if (friendrequest.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, friendrequest.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!friendrequestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        friendrequest = friendrequestRepository.save(friendrequest);
        friendrequestSearchRepository.index(friendrequest);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, friendrequest.getId()))
            .body(friendrequest);
    }

    /**
     * {@code PATCH  /friendrequests/:id} : Partial updates given fields of an existing friendrequest, field will ignore if it is null
     *
     * @param id the id of the friendrequest to save.
     * @param friendrequest the friendrequest to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated friendrequest,
     * or with status {@code 400 (Bad Request)} if the friendrequest is not valid,
     * or with status {@code 404 (Not Found)} if the friendrequest is not found,
     * or with status {@code 500 (Internal Server Error)} if the friendrequest couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Friendrequest> partialUpdateFriendrequest(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody Friendrequest friendrequest
    ) throws URISyntaxException {
        log.debug("REST request to partial update Friendrequest partially : {}, {}", id, friendrequest);
        if (friendrequest.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, friendrequest.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!friendrequestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Friendrequest> result = friendrequestRepository
            .findById(friendrequest.getId())
            .map(existingFriendrequest -> {
                if (friendrequest.getRequestDate() != null) {
                    existingFriendrequest.setRequestDate(friendrequest.getRequestDate());
                }
                if (friendrequest.getRequestUserId() != null) {
                    existingFriendrequest.setRequestUserId(friendrequest.getRequestUserId());
                }
                if (friendrequest.getInfo() != null) {
                    existingFriendrequest.setInfo(friendrequest.getInfo());
                }

                return existingFriendrequest;
            })
            .map(friendrequestRepository::save)
            .map(savedFriendrequest -> {
                friendrequestSearchRepository.index(savedFriendrequest);
                return savedFriendrequest;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, friendrequest.getId())
        );
    }

    /**
     * {@code GET  /friendrequests} : get all the friendrequests.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of friendrequests in body.
     */
    @GetMapping("")
    public List<Friendrequest> getAllFriendrequests() {
        log.debug("REST request to get all Friendrequests");
        return friendrequestRepository.findAll();
    }

    /**
     * {@code GET  /friendrequests/:id} : get the "id" friendrequest.
     *
     * @param id the id of the friendrequest to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the friendrequest, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Friendrequest> getFriendrequest(@PathVariable("id") String id) {
        log.debug("REST request to get Friendrequest : {}", id);
        Optional<Friendrequest> friendrequest = friendrequestRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(friendrequest);
    }

    /**
     * {@code DELETE  /friendrequests/:id} : delete the "id" friendrequest.
     *
     * @param id the id of the friendrequest to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFriendrequest(@PathVariable("id") String id) {
        log.debug("REST request to delete Friendrequest : {}", id);
        friendrequestRepository.deleteById(id);
        friendrequestSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code SEARCH  /friendrequests/_search?query=:query} : search for the friendrequest corresponding
     * to the query.
     *
     * @param query the query of the friendrequest search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<Friendrequest> searchFriendrequests(@RequestParam("query") String query) {
        log.debug("REST request to search Friendrequests for query {}", query);
        try {
            return StreamSupport.stream(friendrequestSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}

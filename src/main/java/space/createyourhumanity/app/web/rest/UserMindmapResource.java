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
import space.createyourhumanity.app.domain.UserMindmap;
import space.createyourhumanity.app.repository.UserMindmapRepository;
import space.createyourhumanity.app.repository.search.UserMindmapSearchRepository;
import space.createyourhumanity.app.web.rest.errors.BadRequestAlertException;
import space.createyourhumanity.app.web.rest.errors.ElasticsearchExceptionMapper;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link space.createyourhumanity.app.domain.UserMindmap}.
 */
@RestController
@RequestMapping("/api/user-mindmaps")
public class UserMindmapResource {

    private static final Logger log = LoggerFactory.getLogger(UserMindmapResource.class);

    private static final String ENTITY_NAME = "userMindmap";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserMindmapRepository userMindmapRepository;

    private final UserMindmapSearchRepository userMindmapSearchRepository;

    public UserMindmapResource(UserMindmapRepository userMindmapRepository, UserMindmapSearchRepository userMindmapSearchRepository) {
        this.userMindmapRepository = userMindmapRepository;
        this.userMindmapSearchRepository = userMindmapSearchRepository;
    }

    /**
     * {@code POST  /user-mindmaps} : Create a new userMindmap.
     *
     * @param userMindmap the userMindmap to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userMindmap, or with status {@code 400 (Bad Request)} if the userMindmap has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UserMindmap> createUserMindmap(@RequestBody UserMindmap userMindmap) throws URISyntaxException {
        log.debug("REST request to save UserMindmap : {}", userMindmap);
        if (userMindmap.getId() != null) {
            throw new BadRequestAlertException("A new userMindmap cannot already have an ID", ENTITY_NAME, "idexists");
        }
        userMindmap = userMindmapRepository.save(userMindmap);
        userMindmapSearchRepository.index(userMindmap);
        return ResponseEntity.created(new URI("/api/user-mindmaps/" + userMindmap.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, userMindmap.getId()))
            .body(userMindmap);
    }

    /**
     * {@code PUT  /user-mindmaps/:id} : Updates an existing userMindmap.
     *
     * @param id the id of the userMindmap to save.
     * @param userMindmap the userMindmap to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userMindmap,
     * or with status {@code 400 (Bad Request)} if the userMindmap is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userMindmap couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserMindmap> updateUserMindmap(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody UserMindmap userMindmap
    ) throws URISyntaxException {
        log.debug("REST request to update UserMindmap : {}, {}", id, userMindmap);
        if (userMindmap.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userMindmap.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userMindmapRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        userMindmap = userMindmapRepository.save(userMindmap);
        userMindmapSearchRepository.index(userMindmap);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userMindmap.getId()))
            .body(userMindmap);
    }

    /**
     * {@code PATCH  /user-mindmaps/:id} : Partial updates given fields of an existing userMindmap, field will ignore if it is null
     *
     * @param id the id of the userMindmap to save.
     * @param userMindmap the userMindmap to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userMindmap,
     * or with status {@code 400 (Bad Request)} if the userMindmap is not valid,
     * or with status {@code 404 (Not Found)} if the userMindmap is not found,
     * or with status {@code 500 (Internal Server Error)} if the userMindmap couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UserMindmap> partialUpdateUserMindmap(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody UserMindmap userMindmap
    ) throws URISyntaxException {
        log.debug("REST request to partial update UserMindmap partially : {}, {}", id, userMindmap);
        if (userMindmap.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userMindmap.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userMindmapRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UserMindmap> result = userMindmapRepository
            .findById(userMindmap.getId())
            .map(existingUserMindmap -> {
                if (userMindmap.getText() != null) {
                    existingUserMindmap.setText(userMindmap.getText());
                }
                if (userMindmap.getModified() != null) {
                    existingUserMindmap.setModified(userMindmap.getModified());
                }

                return existingUserMindmap;
            })
            .map(userMindmapRepository::save)
            .map(savedUserMindmap -> {
                userMindmapSearchRepository.index(savedUserMindmap);
                return savedUserMindmap;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userMindmap.getId())
        );
    }

    /**
     * {@code GET  /user-mindmaps} : get all the userMindmaps.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userMindmaps in body.
     */
    @GetMapping("")
    public List<UserMindmap> getAllUserMindmaps() {
        log.debug("REST request to get all UserMindmaps");
        return userMindmapRepository.findAll();
    }

    /**
     * {@code GET  /user-mindmaps/:id} : get the "id" userMindmap.
     *
     * @param id the id of the userMindmap to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userMindmap, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserMindmap> getUserMindmap(@PathVariable("id") String id) {
        log.debug("REST request to get UserMindmap : {}", id);
        Optional<UserMindmap> userMindmap = userMindmapRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(userMindmap);
    }

    /**
     * {@code DELETE  /user-mindmaps/:id} : delete the "id" userMindmap.
     *
     * @param id the id of the userMindmap to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserMindmap(@PathVariable("id") String id) {
        log.debug("REST request to delete UserMindmap : {}", id);
        userMindmapRepository.deleteById(id);
        userMindmapSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code SEARCH  /user-mindmaps/_search?query=:query} : search for the userMindmap corresponding
     * to the query.
     *
     * @param query the query of the userMindmap search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<UserMindmap> searchUserMindmaps(@RequestParam("query") String query) {
        log.debug("REST request to search UserMindmaps for query {}", query);
        try {
            return StreamSupport.stream(userMindmapSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}

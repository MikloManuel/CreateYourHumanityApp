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
import space.createyourhumanity.app.domain.GrantSettings;
import space.createyourhumanity.app.repository.GrantSettingsRepository;
import space.createyourhumanity.app.repository.search.GrantSettingsSearchRepository;
import space.createyourhumanity.app.web.rest.errors.BadRequestAlertException;
import space.createyourhumanity.app.web.rest.errors.ElasticsearchExceptionMapper;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link space.createyourhumanity.app.domain.GrantSettings}.
 */
@RestController
@RequestMapping("/api/grant-settings")
public class GrantSettingsResource {

    private static final Logger log = LoggerFactory.getLogger(GrantSettingsResource.class);

    private static final String ENTITY_NAME = "grantSettings";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GrantSettingsRepository grantSettingsRepository;

    private final GrantSettingsSearchRepository grantSettingsSearchRepository;

    public GrantSettingsResource(
        GrantSettingsRepository grantSettingsRepository,
        GrantSettingsSearchRepository grantSettingsSearchRepository
    ) {
        this.grantSettingsRepository = grantSettingsRepository;
        this.grantSettingsSearchRepository = grantSettingsSearchRepository;
    }

    /**
     * {@code POST  /grant-settings} : Create a new grantSettings.
     *
     * @param grantSettings the grantSettings to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new grantSettings, or with status {@code 400 (Bad Request)} if the grantSettings has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<GrantSettings> createGrantSettings(@RequestBody GrantSettings grantSettings) throws URISyntaxException {
        log.debug("REST request to save GrantSettings : {}", grantSettings);
        if (grantSettings.getId() != null) {
            throw new BadRequestAlertException("A new grantSettings cannot already have an ID", ENTITY_NAME, "idexists");
        }
        grantSettings = grantSettingsRepository.save(grantSettings);
        grantSettingsSearchRepository.index(grantSettings);
        return ResponseEntity.created(new URI("/api/grant-settings/" + grantSettings.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, grantSettings.getId()))
            .body(grantSettings);
    }

    /**
     * {@code PUT  /grant-settings/:id} : Updates an existing grantSettings.
     *
     * @param id the id of the grantSettings to save.
     * @param grantSettings the grantSettings to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated grantSettings,
     * or with status {@code 400 (Bad Request)} if the grantSettings is not valid,
     * or with status {@code 500 (Internal Server Error)} if the grantSettings couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<GrantSettings> updateGrantSettings(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody GrantSettings grantSettings
    ) throws URISyntaxException {
        log.debug("REST request to update GrantSettings : {}, {}", id, grantSettings);
        if (grantSettings.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, grantSettings.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!grantSettingsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        grantSettings = grantSettingsRepository.save(grantSettings);
        grantSettingsSearchRepository.index(grantSettings);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, grantSettings.getId()))
            .body(grantSettings);
    }

    /**
     * {@code PATCH  /grant-settings/:id} : Partial updates given fields of an existing grantSettings, field will ignore if it is null
     *
     * @param id the id of the grantSettings to save.
     * @param grantSettings the grantSettings to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated grantSettings,
     * or with status {@code 400 (Bad Request)} if the grantSettings is not valid,
     * or with status {@code 404 (Not Found)} if the grantSettings is not found,
     * or with status {@code 500 (Internal Server Error)} if the grantSettings couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<GrantSettings> partialUpdateGrantSettings(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody GrantSettings grantSettings
    ) throws URISyntaxException {
        log.debug("REST request to partial update GrantSettings partially : {}, {}", id, grantSettings);
        if (grantSettings.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, grantSettings.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!grantSettingsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<GrantSettings> result = grantSettingsRepository
            .findById(grantSettings.getId())
            .map(existingGrantSettings -> {
                if (grantSettings.getGrantMap() != null) {
                    existingGrantSettings.setGrantMap(grantSettings.getGrantMap());
                }

                return existingGrantSettings;
            })
            .map(grantSettingsRepository::save)
            .map(savedGrantSettings -> {
                grantSettingsSearchRepository.index(savedGrantSettings);
                return savedGrantSettings;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, grantSettings.getId())
        );
    }

    /**
     * {@code GET  /grant-settings} : get all the grantSettings.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of grantSettings in body.
     */
    @GetMapping("")
    public List<GrantSettings> getAllGrantSettings() {
        log.debug("REST request to get all GrantSettings");
        return grantSettingsRepository.findAll();
    }

    /**
     * {@code GET  /grant-settings/:id} : get the "id" grantSettings.
     *
     * @param id the id of the grantSettings to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the grantSettings, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GrantSettings> getGrantSettings(@PathVariable("id") String id) {
        log.debug("REST request to get GrantSettings : {}", id);
        Optional<GrantSettings> grantSettings = grantSettingsRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(grantSettings);
    }

    /**
     * {@code DELETE  /grant-settings/:id} : delete the "id" grantSettings.
     *
     * @param id the id of the grantSettings to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrantSettings(@PathVariable("id") String id) {
        log.debug("REST request to delete GrantSettings : {}", id);
        grantSettingsRepository.deleteById(id);
        grantSettingsSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code SEARCH  /grant-settings/_search?query=:query} : search for the grantSettings corresponding
     * to the query.
     *
     * @param query the query of the grantSettings search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<GrantSettings> searchGrantSettings(@RequestParam("query") String query) {
        log.debug("REST request to search GrantSettings for query {}", query);
        try {
            return StreamSupport.stream(grantSettingsSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}

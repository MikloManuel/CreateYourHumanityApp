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
import space.createyourhumanity.app.domain.PrivacySettings;
import space.createyourhumanity.app.repository.PrivacySettingsRepository;
import space.createyourhumanity.app.repository.search.PrivacySettingsSearchRepository;
import space.createyourhumanity.app.web.rest.errors.BadRequestAlertException;
import space.createyourhumanity.app.web.rest.errors.ElasticsearchExceptionMapper;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link space.createyourhumanity.app.domain.PrivacySettings}.
 */
@RestController
@RequestMapping("/api/privacy-settings")
public class PrivacySettingsResource {

    private static final Logger log = LoggerFactory.getLogger(PrivacySettingsResource.class);

    private static final String ENTITY_NAME = "privacySettings";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PrivacySettingsRepository privacySettingsRepository;

    private final PrivacySettingsSearchRepository privacySettingsSearchRepository;

    public PrivacySettingsResource(
        PrivacySettingsRepository privacySettingsRepository,
        PrivacySettingsSearchRepository privacySettingsSearchRepository
    ) {
        this.privacySettingsRepository = privacySettingsRepository;
        this.privacySettingsSearchRepository = privacySettingsSearchRepository;
    }

    /**
     * {@code POST  /privacy-settings} : Create a new privacySettings.
     *
     * @param privacySettings the privacySettings to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new privacySettings, or with status {@code 400 (Bad Request)} if the privacySettings has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PrivacySettings> createPrivacySettings(@RequestBody PrivacySettings privacySettings) throws URISyntaxException {
        log.debug("REST request to save PrivacySettings : {}", privacySettings);
        if (privacySettings.getId() != null) {
            throw new BadRequestAlertException("A new privacySettings cannot already have an ID", ENTITY_NAME, "idexists");
        }
        privacySettings = privacySettingsRepository.save(privacySettings);
        privacySettingsSearchRepository.index(privacySettings);
        return ResponseEntity.created(new URI("/api/privacy-settings/" + privacySettings.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, privacySettings.getId()))
            .body(privacySettings);
    }

    /**
     * {@code PUT  /privacy-settings/:id} : Updates an existing privacySettings.
     *
     * @param id the id of the privacySettings to save.
     * @param privacySettings the privacySettings to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated privacySettings,
     * or with status {@code 400 (Bad Request)} if the privacySettings is not valid,
     * or with status {@code 500 (Internal Server Error)} if the privacySettings couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PrivacySettings> updatePrivacySettings(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody PrivacySettings privacySettings
    ) throws URISyntaxException {
        log.debug("REST request to update PrivacySettings : {}, {}", id, privacySettings);
        if (privacySettings.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, privacySettings.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!privacySettingsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        privacySettings = privacySettingsRepository.save(privacySettings);
        privacySettingsSearchRepository.index(privacySettings);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, privacySettings.getId()))
            .body(privacySettings);
    }

    /**
     * {@code PATCH  /privacy-settings/:id} : Partial updates given fields of an existing privacySettings, field will ignore if it is null
     *
     * @param id the id of the privacySettings to save.
     * @param privacySettings the privacySettings to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated privacySettings,
     * or with status {@code 400 (Bad Request)} if the privacySettings is not valid,
     * or with status {@code 404 (Not Found)} if the privacySettings is not found,
     * or with status {@code 500 (Internal Server Error)} if the privacySettings couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PrivacySettings> partialUpdatePrivacySettings(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody PrivacySettings privacySettings
    ) throws URISyntaxException {
        log.debug("REST request to partial update PrivacySettings partially : {}, {}", id, privacySettings);
        if (privacySettings.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, privacySettings.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!privacySettingsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PrivacySettings> result = privacySettingsRepository
            .findById(privacySettings.getId())
            .map(existingPrivacySettings -> {
                if (privacySettings.getSettingsMap() != null) {
                    existingPrivacySettings.setSettingsMap(privacySettings.getSettingsMap());
                }

                return existingPrivacySettings;
            })
            .map(privacySettingsRepository::save)
            .map(savedPrivacySettings -> {
                privacySettingsSearchRepository.index(savedPrivacySettings);
                return savedPrivacySettings;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, privacySettings.getId())
        );
    }

    /**
     * {@code GET  /privacy-settings} : get all the privacySettings.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of privacySettings in body.
     */
    @GetMapping("")
    public List<PrivacySettings> getAllPrivacySettings() {
        log.debug("REST request to get all PrivacySettings");
        return privacySettingsRepository.findAll();
    }

    /**
     * {@code GET  /privacy-settings/:id} : get the "id" privacySettings.
     *
     * @param id the id of the privacySettings to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the privacySettings, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PrivacySettings> getPrivacySettings(@PathVariable("id") String id) {
        log.debug("REST request to get PrivacySettings : {}", id);
        Optional<PrivacySettings> privacySettings = privacySettingsRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(privacySettings);
    }

    /**
     * {@code DELETE  /privacy-settings/:id} : delete the "id" privacySettings.
     *
     * @param id the id of the privacySettings to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrivacySettings(@PathVariable("id") String id) {
        log.debug("REST request to delete PrivacySettings : {}", id);
        privacySettingsRepository.deleteById(id);
        privacySettingsSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code SEARCH  /privacy-settings/_search?query=:query} : search for the privacySettings corresponding
     * to the query.
     *
     * @param query the query of the privacySettings search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<PrivacySettings> searchPrivacySettings(@RequestParam("query") String query) {
        log.debug("REST request to search PrivacySettings for query {}", query);
        try {
            return StreamSupport.stream(privacySettingsSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}
